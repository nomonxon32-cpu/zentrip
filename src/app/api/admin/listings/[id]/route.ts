import { Role, VehicleStatus } from "@prisma/client";
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
    await requireApiRole(Role.ADMIN);

    const body = (await request.json()) as {
      action?: "APPROVE" | "REJECT" | "DEACTIVATE";
      rejectionReason?: string;
    };

    if (!body.action) {
      return NextResponse.json({ error: "Action is required." }, { status: 400 });
    }

    const vehicle = await db.vehicle.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            isSuspended: true,
            kycStatus: true,
          },
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }

    if (body.action === "REJECT" && !body.rejectionReason?.trim()) {
      return NextResponse.json({ error: "A rejection reason is required." }, { status: 400 });
    }

    if (body.action === "DEACTIVATE" && vehicle.status !== VehicleStatus.ACTIVE) {
      return NextResponse.json({ error: "Only active listings can be deactivated." }, { status: 400 });
    }

    if (body.action === "APPROVE" && vehicle.owner.isSuspended) {
      return NextResponse.json({ error: "Suspended owners cannot have active listings." }, { status: 400 });
    }

    if (body.action === "APPROVE" && vehicle.owner.kycStatus !== "APPROVED") {
      return NextResponse.json({ error: "Owner KYC must be approved before a listing can go live." }, { status: 400 });
    }

    const nextStatus =
      body.action === "APPROVE"
        ? VehicleStatus.ACTIVE
        : body.action === "REJECT"
          ? VehicleStatus.REJECTED
          : VehicleStatus.INACTIVE;

    await db.vehicle.update({
      where: { id },
      data: {
        status: nextStatus,
        rejectionReason:
          body.action === "REJECT"
            ? body.rejectionReason?.trim() ?? "Listing did not meet review requirements."
            : null,
      },
    });

    await createNotification({
      userId: vehicle.ownerId,
      type: "LISTING_STATUS",
      title: `Listing ${nextStatus.toLowerCase()}`,
      message:
        body.action === "APPROVE"
          ? `${vehicle.make} ${vehicle.model} is now live.`
          : body.rejectionReason ?? `${vehicle.make} ${vehicle.model} was updated by admin.`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
