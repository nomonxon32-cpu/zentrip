import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireApiRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/http";
import { createNotification } from "@/lib/notifications";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const admin = await requireApiRole(Role.ADMIN);

    const body = (await request.json()) as { action?: "SUSPEND" | "UNSUSPEND" };
    if (!body.action) {
      return NextResponse.json({ error: "Action is required." }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (user.id === admin.id && body.action === "SUSPEND") {
      return NextResponse.json({ error: "You cannot suspend your own admin account." }, { status: 400 });
    }

    await db.user.update({
      where: { id },
      data: {
        isSuspended: body.action === "SUSPEND",
      },
    });

    await createNotification({
      userId: user.id,
      type: "ACCOUNT_STATUS",
      title: body.action === "SUSPEND" ? "Account suspended" : "Account restored",
      message:
        body.action === "SUSPEND"
          ? "Your account was suspended by Zentrip admin."
          : "Your account was restored by Zentrip admin.",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
