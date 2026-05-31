import { BookingStatus, PaymentStatus, PaymentType, Prisma } from "@prisma/client";

import { SERVICE_FEE_RATE } from "@/lib/constants";
import { db } from "@/lib/db";

const ownerVehicleInclude = {
  photos: {
    orderBy: { sortOrder: "asc" as const },
    take: 1,
  },
  bookings: {
    include: {
      renter: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      payments: {
        select: {
          type: true,
          status: true,
          amount: true,
        },
      },
    },
    orderBy: { startDate: "desc" as const },
  },
} satisfies Prisma.VehicleInclude;

type OwnerVehicleRecord = Prisma.VehicleGetPayload<{
  include: typeof ownerVehicleInclude;
}>;

export async function getOwnerListingsWithMetrics(ownerId: string) {
  const vehicles = await db.vehicle.findMany({
    where: {
      ownerId,
    },
    include: ownerVehicleInclude,
    orderBy: [{ createdAt: "desc" }],
  });

  return vehicles.map(summarizeVehicle);
}

export async function getOwnerEarningsOverview(ownerId: string) {
  const vehicles = await getOwnerListingsWithMetrics(ownerId);
  const completedBookings = vehicles.flatMap((vehicle) =>
    vehicle.bookings.filter((booking) => booking.status === BookingStatus.COMPLETED),
  );
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalEarned = completedBookings.reduce((sum, booking) => sum + getOwnerNet(booking), 0);
  const thisMonthEarned = completedBookings
    .filter((booking) => booking.endDate >= monthStart)
    .reduce((sum, booking) => sum + getOwnerNet(booking), 0);
  const completedTrips = completedBookings.length;
  const pendingPayouts = completedBookings
    .filter((booking) => !booking.payments.some((payment) => payment.type === PaymentType.PAYOUT && payment.status === PaymentStatus.SUCCESS))
    .reduce((sum, booking) => sum + getOwnerNet(booking), 0);

  return {
    totalEarned,
    thisMonthEarned,
    completedTrips,
    pendingPayouts,
    vehicles,
  };
}

export async function getOwnerVehicleEarningsHistory(ownerId: string, vehicleId: string) {
  const vehicle = await db.vehicle.findUnique({
    where: { id: vehicleId },
    include: ownerVehicleInclude,
  });

  if (!vehicle || vehicle.ownerId !== ownerId) {
    return null;
  }

  const history = vehicle.bookings.map((booking) => ({
    id: booking.id,
    renterName: booking.renter.name,
    renterEmail: booking.renter.email,
    startDate: booking.startDate,
    endDate: booking.endDate,
    days: booking.days,
    rentalAmount: booking.rentalAmount,
    serviceFee: booking.serviceFee,
    ownerNet: getOwnerNet(booking),
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    depositStatus:
      booking.payments.find((payment) => payment.type === PaymentType.DEPOSIT_HOLD)?.status ?? PaymentStatus.PENDING,
  }));

  const completedHistory = history.filter((booking) => booking.status === BookingStatus.COMPLETED);
  const totalEarned = completedHistory.reduce((sum, booking) => sum + booking.ownerNet, 0);
  const completedTrips = completedHistory.length;
  const averageTripValue = completedTrips ? Math.round(totalEarned / completedTrips) : 0;

  return {
    vehicle: summarizeVehicle(vehicle),
    history,
    totalEarned,
    completedTrips,
    averageTripValue,
  };
}

function summarizeVehicle(vehicle: OwnerVehicleRecord) {
  const completedBookings = vehicle.bookings.filter((booking) => booking.status === BookingStatus.COMPLETED);

  return {
    ...vehicle,
    completedTrips: completedBookings.length,
    totalEarned: completedBookings.reduce((sum, booking) => sum + getOwnerNet(booking), 0),
    hasPendingRequests: vehicle.bookings.some((booking) => booking.status === BookingStatus.PENDING_OWNER_APPROVAL),
  };
}

function getOwnerNet(booking: {
  rentalAmount: number;
  serviceFee: number;
}) {
  if (booking.serviceFee > 0) {
    return booking.rentalAmount - booking.serviceFee;
  }

  return Math.round(booking.rentalAmount * (1 - SERVICE_FEE_RATE));
}
