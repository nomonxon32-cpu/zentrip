import { BookingStatus, BookingType, KycStatus, Role, VehicleStatus } from "@prisma/client";

import { validateRentalPeriod } from "@/lib/pricing";

type DateLike = Date | string;

export function asDate(value: DateLike) {
  return value instanceof Date ? value : new Date(value);
}

export function checkDateOverlap(
  existingStartDate: DateLike,
  existingEndDate: DateLike,
  requestedStartDate: DateLike,
  requestedEndDate: DateLike,
) {
  const existingStart = asDate(existingStartDate);
  const existingEnd = asDate(existingEndDate);
  const requestedStart = asDate(requestedStartDate);
  const requestedEnd = asDate(requestedEndDate);

  return existingStart <= requestedEnd && existingEnd >= requestedStart;
}

export function hasAvailabilityConflict(params: {
  startDate: Date;
  endDate: Date;
  bookings: Array<{ startDate: DateLike; endDate: DateLike; status: BookingStatus }>;
  blocks: Array<{ startDate: DateLike; endDate: DateLike }>;
}) {
  const bookingConflict = params.bookings.some(
    (booking) =>
      isBlockingBookingStatus(booking.status) &&
      checkDateOverlap(booking.startDate, booking.endDate, params.startDate, params.endDate),
  );

  const blockedConflict = params.blocks.some((block) =>
    checkDateOverlap(block.startDate, block.endDate, params.startDate, params.endDate),
  );

  return bookingConflict || blockedConflict;
}

export function getDisabledDateIntervals(params: {
  bookings: Array<{ startDate: DateLike; endDate: DateLike; status: BookingStatus }>;
  blocks: Array<{ startDate: DateLike; endDate: DateLike }>;
}) {
  const bookingRanges = params.bookings
    .filter((booking) => isBlockingBookingStatus(booking.status))
    .map((booking) => ({ from: asDate(booking.startDate), to: asDate(booking.endDate) }));

  const blockRanges = params.blocks.map((block) => ({
    from: asDate(block.startDate),
    to: asDate(block.endDate),
  }));

  return [...bookingRanges, ...blockRanges];
}

export function canUserBookVehicle(params: {
  user:
    | {
        id: string;
        role: Role;
        kycStatus: KycStatus;
        isSuspended: boolean;
      }
    | null
    | undefined;
  vehicle: {
    ownerId: string;
    status: VehicleStatus;
  };
  bookingType?: BookingType;
  startDate: Date;
  endDate: Date;
  now?: Date;
}) {
  if (!params.user) {
    return { allowed: false, reason: "Please log in to continue." };
  }

  if (params.user.isSuspended) {
    return { allowed: false, reason: "Suspended accounts cannot create bookings." };
  }

  if (params.user.role !== Role.RENTER) {
    return { allowed: false, reason: "Only renters can create bookings." };
  }

  if (params.user.kycStatus !== KycStatus.APPROVED) {
    return { allowed: false, reason: "KYC approval is required before booking." };
  }

  if (params.vehicle.ownerId === params.user.id) {
    return { allowed: false, reason: "You cannot book your own vehicle." };
  }

  if (params.vehicle.status !== VehicleStatus.ACTIVE) {
    return { allowed: false, reason: "This vehicle is not accepting bookings." };
  }

  if (params.bookingType === BookingType.MONTHLY) {
    const today = new Date();
    const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const start = new Date(params.startDate.getFullYear(), params.startDate.getMonth(), params.startDate.getDate());
    const end = new Date(params.endDate.getFullYear(), params.endDate.getMonth(), params.endDate.getDate());

    if (start < normalizedToday) {
      return { allowed: false, reason: "Booking start date cannot be in the past." };
    }

    if (end <= start) {
      return { allowed: false, reason: "End date must be after start date." };
    }
  } else {
    const periodValidation = validateRentalPeriod(params.startDate, params.endDate, params.now);
    if (!periodValidation.valid) {
      return { allowed: false, reason: periodValidation.message };
    }
  }

  return { allowed: true };
}

function isBlockingBookingStatus(status: BookingStatus) {
  return (
    status === BookingStatus.CONFIRMED ||
    status === BookingStatus.ACTIVE ||
    status === BookingStatus.PENDING_OWNER_APPROVAL ||
    status === BookingStatus.PENDING_PAYMENT
  );
}
