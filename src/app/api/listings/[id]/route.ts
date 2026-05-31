import { KycStatus, Role, VehicleStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/http";
import { vehicleListingSchema } from "@/lib/validators";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireApiUser();

    const vehicle = await db.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }

    if (user.role !== Role.OWNER || vehicle.ownerId !== user.id) {
      return NextResponse.json({ error: "You cannot edit this listing." }, { status: 403 });
    }

    if (user.kycStatus !== KycStatus.APPROVED) {
      return NextResponse.json({ error: "KYC approval is required before editing listings." }, { status: 403 });
    }

    const body = vehicleListingSchema.parse(await request.json());

    const listing = await db.$transaction(async (tx) => {
      await tx.vehiclePhoto.deleteMany({ where: { vehicleId: id } });
      await tx.availabilityBlock.deleteMany({ where: { vehicleId: id } });

      return tx.vehicle.update({
        where: { id },
        data: {
          make: body.make,
          model: body.model,
          year: body.year,
          category: body.category,
          transmission: body.transmission,
          fuelType: body.fuelType,
          seats: body.seats,
          city: body.city,
          address: body.address,
          latitude: body.latitude ?? null,
          longitude: body.longitude ?? null,
          dailyPrice: body.dailyPrice,
          monthlyPrice: body.monthlyAvailable ? body.monthlyPrice ?? null : null,
          depositAmount: body.depositAmount,
          description: body.description,
          rules: body.rules,
          mileageLimitPerDay: body.mileageLimitPerDay,
          plateNumber: body.plateNumber,
          hasOsago: body.hasOsago,
          hasCasco: body.hasCasco,
          airportPickupAvailable: body.airportPickupAvailable,
          deliveryAvailable: body.deliveryAvailable,
          monthlyAvailable: body.monthlyAvailable,
          instantBook: body.instantBook,
          pickupInstructions: body.pickupInstructions?.trim() ? body.pickupInstructions.trim() : null,
          deliveryFee: body.deliveryAvailable ? body.deliveryFee ?? 0 : null,
          status: vehicle.status === VehicleStatus.INACTIVE ? VehicleStatus.INACTIVE : VehicleStatus.PENDING_REVIEW,
          rejectionReason: null,
          photos: {
            create: body.photoUrls.map((url, index) => ({
              url,
              sortOrder: index,
            })),
          },
          availabilityBlocks: {
            create: body.availabilityBlocks.map((block) => ({
              startDate: new Date(block.startDate),
              endDate: new Date(block.endDate),
              reason: block.reason,
            })),
          },
        },
      });
    });

    return NextResponse.json({ ok: true, listingId: listing.id });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireApiUser();

    const vehicle = await db.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }

    if (user.role !== Role.OWNER || vehicle.ownerId !== user.id) {
      return NextResponse.json({ error: "You cannot change this listing." }, { status: 403 });
    }

    const body = (await request.json()) as { action?: "DEACTIVATE" | "ACTIVATE" };
    if (!body.action) {
      return NextResponse.json({ error: "Action is required." }, { status: 400 });
    }

    if (body.action === "ACTIVATE" && user.kycStatus !== KycStatus.APPROVED) {
      return NextResponse.json({ error: "KYC approval is required before resubmitting listings." }, { status: 403 });
    }

    const nextStatus = body.action === "DEACTIVATE" ? VehicleStatus.INACTIVE : VehicleStatus.PENDING_REVIEW;

    await db.vehicle.update({
      where: { id },
      data: {
        status: nextStatus,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
