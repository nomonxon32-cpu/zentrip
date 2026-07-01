import {
  BookingPaymentStatus,
  BookingStatus,
  DisputeStatus,
  KycStatus,
  Role,
  VehicleStatus,
} from "@prisma/client";

import { getBookingPayableTotal, getOwnerPayoutAmount } from "@/lib/booking-finance";
import { db } from "@/lib/db";

export type DropdownStats =
  | {
      role: "RENTER";
      kycStatus: KycStatus;
      totalSpent: number;
      upcomingTrips: number;
      completedTrips: number;
      savedCars: number;
    }
  | {
      role: "OWNER";
      kycStatus: KycStatus;
      totalEarned: number;
      pendingBookingRequests: number;
      activeListings: number;
      completedTrips: number;
    }
  | {
      role: "ADMIN";
      pendingKyc: number;
      pendingListings: number;
      openDisputes: number;
      totalBookings: number;
    };

export async function getUserDropdownStats(user: {
  id: string;
  role: Role;
  kycStatus: KycStatus;
}): Promise<DropdownStats> {
  if (user.role === Role.RENTER) {
    const [spentAggregate, upcomingTrips, completedTrips, savedCars] = await Promise.all([
      db.booking.aggregate({
        where: {
          renterId: user.id,
          OR: [
            { paymentStatus: BookingPaymentStatus.PAID },
            {
              status: {
                in: [BookingStatus.CONFIRMED, BookingStatus.ACTIVE, BookingStatus.COMPLETED],
              },
            },
          ],
        },
        _sum: {
          rentalAmount: true,
          depositAmount: true,
          deliveryFee: true,
          serviceFee: true,
        },
      }),
      db.booking.count({
        where: {
          renterId: user.id,
          status: {
            in: [BookingStatus.PENDING_OWNER_APPROVAL, BookingStatus.CONFIRMED, BookingStatus.ACTIVE],
          },
        },
      }),
      db.booking.count({
        where: {
          renterId: user.id,
          status: BookingStatus.COMPLETED,
        },
      }),
      db.favorite.count({
        where: {
          userId: user.id,
        },
      }),
    ]);

    return {
      role: Role.RENTER,
      kycStatus: user.kycStatus,
      totalSpent: getBookingPayableTotal({
        rentalAmount: spentAggregate._sum.rentalAmount ?? 0,
        depositAmount: spentAggregate._sum.depositAmount ?? 0,
        deliveryFee: spentAggregate._sum.deliveryFee ?? 0,
        serviceFee: spentAggregate._sum.serviceFee ?? 0,
      }),
      upcomingTrips,
      completedTrips,
      savedCars,
    };
  }

  if (user.role === Role.OWNER) {
    const [earnedAggregate, pendingBookingRequests, activeListings, completedTrips] = await Promise.all([
      db.booking.aggregate({
        where: {
          ownerId: user.id,
          status: BookingStatus.COMPLETED,
        },
        _sum: {
          rentalAmount: true,
          deliveryFee: true,
          serviceFee: true,
        },
      }),
      db.booking.count({
        where: {
          ownerId: user.id,
          status: BookingStatus.PENDING_OWNER_APPROVAL,
        },
      }),
      db.vehicle.count({
        where: {
          ownerId: user.id,
          status: VehicleStatus.ACTIVE,
        },
      }),
      db.booking.count({
        where: {
          ownerId: user.id,
          status: BookingStatus.COMPLETED,
        },
      }),
    ]);

    return {
      role: Role.OWNER,
      kycStatus: user.kycStatus,
      totalEarned: getOwnerPayoutAmount({
        rentalAmount: earnedAggregate._sum.rentalAmount ?? 0,
        deliveryFee: earnedAggregate._sum.deliveryFee ?? 0,
        serviceFee: earnedAggregate._sum.serviceFee ?? 0,
      }),
      pendingBookingRequests,
      activeListings,
      completedTrips,
    };
  }

  const [pendingKyc, pendingListings, openDisputes, totalBookings] = await Promise.all([
    db.kycDocument.count({
      where: {
        status: KycStatus.PENDING,
      },
    }),
    db.vehicle.count({
      where: {
        status: VehicleStatus.PENDING_REVIEW,
      },
    }),
    db.dispute.count({
      where: {
        status: {
          in: [DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW],
        },
      },
    }),
    db.booking.count(),
  ]);

  return {
    role: Role.ADMIN,
    pendingKyc,
    pendingListings,
    openDisputes,
    totalBookings,
  };
}
