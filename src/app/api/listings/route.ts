import { KycStatus, Role, VehicleStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/http";
import { createNotification } from "@/lib/notifications";
import { vehicleListingSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();

    if (user.role !== Role.OWNER) {
      return NextResponse.json({ error: "Only owners can create listings." }, { status: 403 });
    }

    if (user.kycStatus !== KycStatus.APPROVED) {
      return NextResponse.json({ error: "KYC approval is required before submitting listings." }, { status: 403 });
    }

    const body = vehicleListingSchema.parse(await request.json());

    if (body.acceptedTerms !== true) {
      return NextResponse.json(
        { error: "You must confirm that you are authorized to list this vehicle and agree to the Terms of Use." },
        { status: 400 },
      );
    }

    const listing = await db.vehicle.create({
      data: {
        ownerId: user.id,
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
        status: VehicleStatus.PENDING_REVIEW,
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

    const admins = await db.user.findMany({
      where: { role: Role.ADMIN },
      select: { id: true },
    });

    await Promise.all(
      admins.map((admin) =>
        createNotification({
          userId: admin.id,
          type: "LISTING_REVIEW",
          title: "New listing pending review",
          message: `${user.name} submitted ${body.make} ${body.model} for approval.`,
        }),
      ),
    );

    return NextResponse.json({ ok: true, listingId: listing.id });
  } catch (error) {
    return handleApiError(error);
  }
}
