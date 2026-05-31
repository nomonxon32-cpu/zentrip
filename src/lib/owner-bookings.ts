import {
  BookingPaymentStatus,
  BookingStatus,
  DocumentType,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
  Prisma,
} from "@prisma/client";

import { hasAvailabilityConflict } from "@/lib/availability";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/http";
import { createNotification } from "@/lib/notifications";

const ownerBookingListInclude = {
  vehicle: {
    include: {
      photos: {
        orderBy: { sortOrder: "asc" as const },
        take: 1,
      },
    },
  },
  renter: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      city: true,
      kycStatus: true,
    },
  },
} satisfies Prisma.BookingInclude;

const ownerBookingDetailInclude = {
  vehicle: {
    include: {
      photos: {
        orderBy: { sortOrder: "asc" as const },
        take: 4,
      },
      bookings: {
        select: {
          id: true,
          startDate: true,
          endDate: true,
          status: true,
        },
        orderBy: { startDate: "asc" as const },
      },
      availabilityBlocks: {
        orderBy: { startDate: "asc" as const },
      },
    },
  },
  renter: {
    include: {
      kycDocuments: {
        where: {
          documentType: DocumentType.DRIVER_LICENSE,
        },
        orderBy: { createdAt: "desc" as const },
        take: 1,
      },
    },
  },
  owner: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      city: true,
    },
  },
  payments: {
    orderBy: { createdAt: "asc" as const },
  },
  messages: {
    include: {
      sender: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "asc" as const },
  },
  disputes: {
    orderBy: { createdAt: "desc" as const },
  },
} satisfies Prisma.BookingInclude;

export type OwnerBookingListRecord = Prisma.BookingGetPayload<{
  include: typeof ownerBookingListInclude;
}>;

export type OwnerBookingDetailRecord = Prisma.BookingGetPayload<{
  include: typeof ownerBookingDetailInclude;
}>;

export async function getOwnerBookings(ownerId: string) {
  return db.booking.findMany({
    where: { ownerId },
    include: ownerBookingListInclude,
    orderBy: [{ createdAt: "desc" }],
  });
}

export async function getOwnerBookingById(ownerId: string, bookingId: string) {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: ownerBookingDetailInclude,
  });

  if (!booking || booking.ownerId !== ownerId || booking.vehicle.ownerId !== ownerId) {
    return null;
  }

  return booking;
}

export async function approveOwnerBooking(params: {
  ownerId: string;
  bookingId: string;
  pickupNotes?: string | null;
}) {
  const booking = await getDecisionBooking(params.ownerId, params.bookingId);

  if (booking.status !== BookingStatus.PENDING_OWNER_APPROVAL) {
    throw new ApiError(400, "Booking is not awaiting approval.");
  }

  const hasConflict = hasAvailabilityConflict({
    startDate: booking.startDate,
    endDate: booking.endDate,
    bookings: booking.vehicle.bookings.filter((vehicleBooking) => vehicleBooking.id !== booking.id),
    blocks: booking.vehicle.availabilityBlocks,
  });

  if (hasConflict) {
    throw new ApiError(409, "These dates are no longer available for approval.");
  }

  await db.booking.update({
    where: { id: booking.id },
    data: {
      status: BookingStatus.CONFIRMED,
      pickupNotes: params.pickupNotes ?? booking.pickupNotes,
    },
  });

  await createNotification({
    userId: booking.renterId,
    type: "BOOKING_APPROVED",
    title: "Booking approved",
    message: `${booking.owner.name} approved your booking request for ${booking.vehicle.make} ${booking.vehicle.model}.`,
  });
}

export async function rejectOwnerBooking(params: {
  ownerId: string;
  bookingId: string;
  reason?: string | null;
}) {
  const booking = await getDecisionBooking(params.ownerId, params.bookingId);

  if (booking.status !== BookingStatus.PENDING_OWNER_APPROVAL) {
    throw new ApiError(400, "Booking is not awaiting approval.");
  }

  const rejectionReason = params.reason?.trim() || "Rejected by owner";
  const rentalPayment = booking.payments.find((payment) => payment.type === PaymentType.RENTAL_PAYMENT);
  const refundAmount = rentalPayment?.amount ?? booking.rentalAmount + booking.serviceFee;
  const hasRefundRecord = booking.payments.some((payment) => payment.type === PaymentType.REFUND);

  await db.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.REJECTED,
        paymentStatus: BookingPaymentStatus.REFUNDED,
        cancellationReason: rejectionReason,
      },
    });

    await tx.payment.updateMany({
      where: {
        bookingId: booking.id,
        type: PaymentType.RENTAL_PAYMENT,
      },
      data: {
        status: PaymentStatus.REFUNDED,
      },
    });

    await tx.payment.updateMany({
      where: {
        bookingId: booking.id,
        type: PaymentType.DEPOSIT_HOLD,
        status: {
          notIn: [PaymentStatus.RELEASED, PaymentStatus.REFUNDED],
        },
      },
      data: {
        status: PaymentStatus.RELEASED,
      },
    });

    if (!hasRefundRecord) {
      await tx.payment.create({
        data: {
          bookingId: booking.id,
          userId: booking.renterId,
          amount: refundAmount,
          type: PaymentType.REFUND,
          method: rentalPayment?.method ?? PaymentMethod.UZCARD,
          status: PaymentStatus.REFUNDED,
          providerReference: `OWNER-REFUND-${Date.now()}`,
        },
      });
    }
  });

  await createNotification({
    userId: booking.renterId,
    type: "BOOKING_REJECTED",
    title: "Booking rejected",
    message: `${booking.owner.name} rejected your booking request.${params.reason?.trim() ? ` Reason: ${params.reason.trim()}` : ""}`,
  });
}

async function getDecisionBooking(ownerId: string, bookingId: string) {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      vehicle: {
        include: {
          bookings: {
            select: {
              id: true,
              startDate: true,
              endDate: true,
              status: true,
            },
          },
          availabilityBlocks: {
            select: {
              startDate: true,
              endDate: true,
            },
          },
        },
      },
      renter: {
        select: {
          id: true,
          name: true,
        },
      },
      owner: {
        select: {
          id: true,
          name: true,
        },
      },
      payments: true,
    },
  });

  if (!booking || booking.ownerId !== ownerId || booking.vehicle.ownerId !== ownerId) {
    throw new ApiError(403, "Only the vehicle owner can perform this action.");
  }

  return booking;
}
