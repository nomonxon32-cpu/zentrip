import { BookingPaymentStatus, BookingStatus, BookingType, PaymentStatus, PaymentType, Role, VehicleStatus } from "@prisma/client";
import { addMonths } from "date-fns";
import { NextResponse } from "next/server";

import { canUserBookVehicle, hasAvailabilityConflict } from "@/lib/availability";
import { requireApiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/http";
import { simulatePayment } from "@/lib/mock-payment";
import { createNotification } from "@/lib/notifications";
import {
  type BookingPrice,
  calculateBookingPrice,
  calculateMonthlyBookingPrice,
  getVehicleMonthlyPrice,
} from "@/lib/pricing";
import { bookingSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();

    if (user.role !== Role.RENTER) {
      return NextResponse.json({ error: "Only renters can create bookings." }, { status: 403 });
    }

    const body = bookingSchema.parse(await request.json());

    const vehicle = await db.vehicle.findUnique({
      where: { id: body.vehicleId },
      include: {
        owner: true,
        bookings: {
          select: {
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
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });
    }

    if (vehicle.owner.isSuspended) {
      return NextResponse.json({ error: "Suspended owners cannot accept bookings." }, { status: 403 });
    }

    if (vehicle.status !== VehicleStatus.ACTIVE) {
      return NextResponse.json({ error: "Only active listings can be booked." }, { status: 400 });
    }

    const startDate = new Date(body.startDate);
    const bookingType = body.bookingType ?? BookingType.DAILY;
    const durationMonths = bookingType === BookingType.MONTHLY ? body.durationMonths ?? 1 : null;
    const endDate =
      bookingType === BookingType.MONTHLY && durationMonths
        ? addMonths(startDate, durationMonths)
        : new Date(body.endDate);
    const deliveryFee =
      vehicle.deliveryAvailable && body.pickupLocation?.trim()
        ? vehicle.deliveryFee ?? 0
        : 0;

    const eligibility = canUserBookVehicle({
      user,
      vehicle: {
        ownerId: vehicle.ownerId,
        status: vehicle.status,
      },
      bookingType,
      startDate,
      endDate,
    });

    if (!eligibility.allowed) {
      return NextResponse.json({ error: eligibility.reason }, { status: 400 });
    }

    const hasConflict = hasAvailabilityConflict({
      startDate,
      endDate,
      bookings: vehicle.bookings,
      blocks: vehicle.availabilityBlocks,
    });

    if (hasConflict) {
      return NextResponse.json({ error: "Selected dates are unavailable." }, { status: 409 });
    }

    const pricing: BookingPrice =
      bookingType === BookingType.MONTHLY && durationMonths
        ? calculateMonthlyBookingPrice({
            startDate,
            durationMonths,
            dailyPrice: vehicle.dailyPrice,
            monthlyPrice: getVehicleMonthlyPrice(vehicle.dailyPrice, vehicle.monthlyPrice),
            depositAmount: vehicle.depositAmount,
            deliveryFee,
          })
        : calculateBookingPrice({
            startDate,
            endDate,
            dailyPrice: vehicle.dailyPrice,
            depositAmount: vehicle.depositAmount,
            deliveryFee,
          });

    const payment = await simulatePayment({
      amount: pricing.totalAmount,
      method: body.paymentMethod,
    });

    if (!payment.success) {
      return NextResponse.json({ error: "Payment failed." }, { status: 402 });
    }

    const booking = await db.$transaction(async (tx) => {
      const created = await tx.booking.create({
        data: {
          vehicleId: vehicle.id,
          renterId: user.id,
          ownerId: vehicle.ownerId,
          startDate,
          endDate,
          bookingType,
          durationMonths,
          days: pricing.days,
          dailyPrice: pricing.dailyPrice,
          monthlyPrice: pricing.monthlyPrice ?? null,
          rentalAmount: pricing.rentalAmount,
          serviceFee: pricing.serviceFee,
          depositAmount: pricing.depositAmount,
          deliveryFee: pricing.deliveryFee,
          totalAmount: pricing.totalAmount,
          status: BookingStatus.PENDING_OWNER_APPROVAL,
          paymentStatus: BookingPaymentStatus.PAID,
          pickupLocation: body.pickupLocation?.trim() || null,
          startTime: body.startTime || null,
          endTime: body.endTime || null,
          pickupNotes: body.pickupNotes ?? null,
        },
      });

      await tx.payment.createMany({
        data: [
          {
            bookingId: created.id,
            userId: user.id,
            amount: pricing.rentalAmount + pricing.serviceFee,
            type: PaymentType.RENTAL_PAYMENT,
            method: body.paymentMethod,
            status: PaymentStatus.SUCCESS,
            providerReference: payment.providerReference,
          },
          {
            bookingId: created.id,
            userId: user.id,
            amount: pricing.depositAmount,
            type: PaymentType.DEPOSIT_HOLD,
            method: body.paymentMethod,
            status: PaymentStatus.HELD,
            providerReference: `${payment.providerReference}-DEP`,
          },
        ],
      });

      return created;
    });

    await Promise.all([
      createNotification({
        userId: vehicle.ownerId,
        type: "BOOKING_REQUEST",
        title: "New booking request",
        message: `${user.name} requested ${vehicle.make} ${vehicle.model}.`,
      }),
      createNotification({
        userId: user.id,
        type: "BOOKING_REQUEST",
        title: "Booking requested",
        message: `Your booking request for ${vehicle.make} ${vehicle.model} was sent to the owner.`,
      }),
    ]);

    return NextResponse.json({ ok: true, bookingId: booking.id });
  } catch (error) {
    return handleApiError(error);
  }
}
