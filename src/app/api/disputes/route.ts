import { BookingStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/http";
import { createNotification } from "@/lib/notifications";
import { disputeSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();

    const body = disputeSchema.parse(await request.json());
    const booking = await db.booking.findUnique({
      where: { id: body.bookingId },
    });

    if (!booking || ![booking.ownerId, booking.renterId].includes(user.id)) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    const dispute = await db.dispute.create({
      data: {
        bookingId: booking.id,
        openedById: user.id,
        reason: body.reason,
        description: body.description,
      },
    });

    await db.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.DISPUTED,
      },
    });

    const admins = await db.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    await Promise.all(
      admins.map((admin) =>
        createNotification({
          userId: admin.id,
          type: "DISPUTE",
          title: "New dispute opened",
          message: `${user.name} opened a dispute on booking ${booking.id}.`,
        }),
      ),
    );

    return NextResponse.json({ ok: true, id: dispute.id });
  } catch (error) {
    return handleApiError(error);
  }
}
