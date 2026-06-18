import { BookingStatus, Role } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/http";
import { createNotification } from "@/lib/notifications";
import { approveOwnerBooking, rejectOwnerBooking } from "@/lib/owner-bookings";

type BookingAction =
  | "APPROVE"
  | "REJECT"
  | "START"
  | "COMPLETE"
  | "CANCEL";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireApiUser();

    const booking = await db.booking.findUnique({
      where: { id },
      include: {
        vehicle: true,
        renter: true,
        owner: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    const body = (await request.json()) as {
      action?: BookingAction;
      reason?: string;
      pickupNotes?: string;
      returnNotes?: string;
    };

    if (!body.action) {
      return NextResponse.json({ error: "Action is required." }, { status: 400 });
    }

    if (body.action === "CANCEL") {
      if (user.role !== Role.RENTER || booking.renterId !== user.id) {
        return NextResponse.json({ error: "Only the renter can cancel this booking." }, { status: 403 });
      }

      if (
        booking.status !== BookingStatus.PENDING_OWNER_APPROVAL &&
        booking.status !== BookingStatus.CONFIRMED
      ) {
        return NextResponse.json({ error: "This booking can no longer be cancelled." }, { status: 400 });
      }

      // Cash-only flow: no online money moved, so there is nothing to refund.
      // Simply mark the booking cancelled; paymentStatus stays UNPAID.
      await db.booking.update({
        where: { id },
        data: {
          status: BookingStatus.CANCELLED,
          cancellationReason: body.reason ?? "Cancelled by renter",
        },
      });

      await createNotification({
        userId: booking.ownerId,
        type: "BOOKING_CANCELLED",
        title: "Booking cancelled",
        message: `${booking.renter.name} cancelled the booking for ${booking.vehicle.make} ${booking.vehicle.model}.`,
      });

      return NextResponse.json({ ok: true });
    }

    if (user.role !== Role.OWNER || booking.ownerId !== user.id) {
      return NextResponse.json({ error: "Only the vehicle owner can perform this action." }, { status: 403 });
    }

    if (body.action === "APPROVE") {
      await approveOwnerBooking({
        ownerId: user.id,
        bookingId: id,
        pickupNotes: body.pickupNotes,
      });
    }

    if (body.action === "REJECT") {
      await rejectOwnerBooking({
        ownerId: user.id,
        bookingId: id,
        reason: body.reason,
      });
    }

    if (body.action === "START") {
      if (booking.status !== BookingStatus.CONFIRMED) {
        return NextResponse.json({ error: "Only confirmed bookings can be started." }, { status: 400 });
      }

      await db.booking.update({
        where: { id },
        data: {
          status: BookingStatus.ACTIVE,
          pickupNotes: body.pickupNotes ?? booking.pickupNotes,
        },
      });
    }

    if (body.action === "COMPLETE") {
      if (booking.status !== BookingStatus.ACTIVE) {
        return NextResponse.json({ error: "Only active bookings can be completed." }, { status: 400 });
      }

      // Cash-only flow: payout and deposit are handled in cash offline, so we
      // only advance the booking lifecycle here.
      await db.booking.update({
        where: { id },
        data: {
          status: BookingStatus.COMPLETED,
          returnNotes: body.returnNotes ?? booking.returnNotes,
        },
      });

      await createNotification({
        userId: booking.renterId,
        type: "BOOKING_COMPLETED",
        title: "Trip completed",
        message: `Your trip for ${booking.vehicle.make} ${booking.vehicle.model} is complete. Thanks for using Zentrip.`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
