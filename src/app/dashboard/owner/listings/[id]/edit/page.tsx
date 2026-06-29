import { Role } from "@prisma/client";
import { notFound } from "next/navigation";

import { ApiActionButton } from "@/components/api-action-button";
import { BackButton } from "@/components/back-button";
import { VehicleForm } from "@/components/forms/vehicle-form";
import { StatusBadge } from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [user, locale] = await Promise.all([requireRole(Role.OWNER), getCurrentLocale()]);
  const labels = getDictionary(locale);
  const { id } = await params;
  const vehicle = await db.vehicle.findUnique({
    where: { id },
    include: {
      photos: {
        orderBy: { sortOrder: "asc" },
      },
      availabilityBlocks: {
        orderBy: { startDate: "asc" },
      },
    },
  });

  if (!vehicle || vehicle.ownerId !== user.id) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackHref="/dashboard/owner/listings" label={labels.backToListings} />
      </div>
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">Listing editor</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">
            {vehicle.make} {vehicle.model}
          </h1>
        </div>
        <div className="grid w-full gap-3 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
          <StatusBadge value={vehicle.status} />
          <ApiActionButton
            endpoint={`/api/listings/${vehicle.id}`}
            payload={{ action: vehicle.status === "INACTIVE" ? "ACTIVATE" : "DEACTIVATE" }}
            label={vehicle.status === "INACTIVE" ? "Send for re-review" : "Deactivate"}
            successMessage={vehicle.status === "INACTIVE" ? "Listing resubmitted" : "Listing deactivated"}
            variant={vehicle.status === "INACTIVE" ? "default" : "outline"}
          />
        </div>
      </div>
      <VehicleForm
        mode="edit"
        vehicleId={vehicle.id}
        initialValues={{
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          category: vehicle.category,
          transmission: vehicle.transmission,
          fuelType: vehicle.fuelType,
          seats: vehicle.seats,
          city: vehicle.city,
          address: vehicle.address,
          latitude: vehicle.latitude ?? null,
          longitude: vehicle.longitude ?? null,
          dailyPrice: vehicle.dailyPrice,
          monthlyPrice: vehicle.monthlyPrice ?? null,
          depositAmount: vehicle.depositAmount,
          description: vehicle.description,
          rules: vehicle.rules,
          mileageLimitPerDay: vehicle.mileageLimitPerDay,
          plateNumber: vehicle.plateNumber,
          hasOsago: vehicle.hasOsago,
          hasCasco: vehicle.hasCasco,
          airportPickupAvailable: vehicle.airportPickupAvailable,
          deliveryAvailable: vehicle.deliveryAvailable,
          monthlyAvailable: vehicle.monthlyAvailable,
          instantBook: vehicle.instantBook,
          pickupInstructions: vehicle.pickupInstructions ?? "",
          deliveryFee: vehicle.deliveryFee ?? null,
          photoUrls: vehicle.photos.map((photo) => photo.url),
          availabilityBlocks: vehicle.availabilityBlocks.map((block) => ({
            startDate: block.startDate.toISOString().slice(0, 10),
            endDate: block.endDate.toISOString().slice(0, 10),
            reason: block.reason,
          })),
        }}
      />
    </div>
  );
}
