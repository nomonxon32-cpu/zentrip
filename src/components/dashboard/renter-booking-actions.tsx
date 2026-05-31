"use client";

import { BookingStatus } from "@prisma/client";

import { ApiActionButton } from "@/components/api-action-button";

export function RenterBookingActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: BookingStatus;
}) {
  const canCancel =
    status === BookingStatus.PENDING_OWNER_APPROVAL || status === BookingStatus.CONFIRMED;

  if (!canCancel) {
    return null;
  }

  return (
    <ApiActionButton
      endpoint={`/api/bookings/${bookingId}`}
      payload={{ action: "CANCEL", reason: "Cancelled by renter." }}
      label="Cancel booking"
      successMessage="Booking cancelled"
      variant="danger"
    />
  );
}
