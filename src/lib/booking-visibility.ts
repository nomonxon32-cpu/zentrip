import { BookingStatus, Role } from "@prisma/client";

const sensitiveDetailRevealStatuses: BookingStatus[] = [
  BookingStatus.CONFIRMED,
  BookingStatus.ACTIVE,
  BookingStatus.COMPLETED,
];

export function isSensitiveBookingDetailsVisible(status: BookingStatus) {
  return sensitiveDetailRevealStatuses.includes(status);
}

export function canRevealVehicleSensitiveDetails(params: {
  viewer:
    | {
        id: string;
        role: Role;
      }
    | null
    | undefined;
  vehicleOwnerId: string;
  renterBookings?: Array<{
    renterId: string;
    status: BookingStatus;
  }>;
}) {
  const { viewer, vehicleOwnerId, renterBookings = [] } = params;

  if (!viewer) {
    return false;
  }

  if (viewer.role === Role.ADMIN || viewer.id === vehicleOwnerId) {
    return true;
  }

  if (viewer.role !== Role.RENTER) {
    return false;
  }

  return renterBookings.some(
    (booking) => booking.renterId === viewer.id && isSensitiveBookingDetailsVisible(booking.status),
  );
}
