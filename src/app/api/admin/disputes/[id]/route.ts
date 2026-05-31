import { BookingStatus, DisputeStatus, Role } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireApiRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/http";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await requireApiRole(Role.ADMIN);

    const body = (await request.json()) as { status?: DisputeStatus; adminNote?: string };
    if (!body.status) {
      return NextResponse.json({ error: "Status is required." }, { status: 400 });
    }
    const nextStatus = body.status;

    const dispute = await db.dispute.findUnique({
      where: { id },
    });

    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found." }, { status: 404 });
    }

    await db.$transaction(async (tx) => {
      await tx.dispute.update({
        where: { id },
        data: {
          status: nextStatus,
          adminNote: body.adminNote ?? null,
        },
      });

      if (nextStatus === DisputeStatus.RESOLVED || nextStatus === DisputeStatus.REJECTED) {
        await tx.booking.update({
          where: { id: dispute.bookingId },
          data: {
            status: BookingStatus.COMPLETED,
          },
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
