import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/http";
import { createNotification } from "@/lib/notifications";
import { messageSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();

    const body = messageSchema.parse(await request.json());

    if (body.receiverId === user.id) {
      return NextResponse.json({ error: "You cannot send a message to yourself." }, { status: 400 });
    }

    if (body.bookingId) {
      const booking = await db.booking.findUnique({
        where: { id: body.bookingId },
      });

      if (!booking || ![booking.ownerId, booking.renterId].includes(user.id)) {
        return NextResponse.json({ error: "You cannot message on this booking." }, { status: 403 });
      }

      const expectedReceiverId = booking.ownerId === user.id ? booking.renterId : booking.ownerId;
      if (body.receiverId !== expectedReceiverId) {
        return NextResponse.json({ error: "Messages on a booking must go to the other booking participant." }, { status: 400 });
      }
    }

    const message = await db.message.create({
      data: {
        senderId: user.id,
        receiverId: body.receiverId,
        bookingId: body.bookingId ?? null,
        content: body.content,
        attachmentUrl: body.attachmentUrl ?? null,
      },
    });

    await createNotification({
      userId: body.receiverId,
      type: "MESSAGE",
      title: "New message",
      message: `${user.name} sent you a message.`,
    });

    return NextResponse.json({ ok: true, id: message.id });
  } catch (error) {
    return handleApiError(error);
  }
}
