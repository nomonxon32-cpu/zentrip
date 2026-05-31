import { BookingStatus, Role } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/http";
import { reviewSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();

    if (user.role !== Role.RENTER) {
      return NextResponse.json({ error: "Only renters can leave reviews in this MVP." }, { status: 403 });
    }

    const body = reviewSchema.parse(await request.json());
    const booking = await db.booking.findUnique({
      where: { id: body.bookingId },
    });

    if (!booking || booking.renterId !== user.id) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      return NextResponse.json({ error: "Reviews are available after a trip is completed." }, { status: 400 });
    }

    if (body.vehicleId !== booking.vehicleId || body.receiverId !== booking.ownerId) {
      return NextResponse.json({ error: "Review details do not match the completed booking." }, { status: 400 });
    }

    const existingReview = await db.review.findUnique({
      where: {
        bookingId_authorId: {
          bookingId: body.bookingId,
          authorId: user.id,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json({ error: "You already reviewed this booking." }, { status: 409 });
    }

    await db.review.create({
      data: {
        authorId: user.id,
        bookingId: booking.id,
        vehicleId: booking.vehicleId,
        receiverId: booking.ownerId,
        rating: body.rating,
        comment: body.comment,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
