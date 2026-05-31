import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = (await request.json()) as { vehicleId?: string };

    if (!body.vehicleId) {
      return NextResponse.json({ error: "Vehicle is required." }, { status: 400 });
    }

    await db.favorite.upsert({
      where: {
        userId_vehicleId: {
          userId: user.id,
          vehicleId: body.vehicleId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        vehicleId: body.vehicleId,
      },
    });

    return NextResponse.json({ ok: true, isFavorited: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireApiUser();
    const body = (await request.json()) as { vehicleId?: string };

    if (!body.vehicleId) {
      return NextResponse.json({ error: "Vehicle is required." }, { status: 400 });
    }

    await db.favorite.deleteMany({
      where: {
        userId: user.id,
        vehicleId: body.vehicleId,
      },
    });

    return NextResponse.json({ ok: true, isFavorited: false });
  } catch (error) {
    return handleApiError(error);
  }
}
