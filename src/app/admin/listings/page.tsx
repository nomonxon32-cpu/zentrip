import { Role } from "@prisma/client";

import { AdminShell } from "@/components/admin/admin-shell";
import { ListingReviewActions } from "@/components/admin/listing-review-actions";
import { StatusBadge } from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminListingsPage() {
  await requireRole(Role.ADMIN);
  const locale = await getCurrentLocale();
  const labels = getDictionary(locale);
  const listings = await db.vehicle.findMany({
    include: {
      owner: true,
      photos: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminShell
      currentPath="/admin/listings"
      title={labels.listings}
      description={labels.listingsDescription}
    >
      <div className="grid gap-6">
        {listings.map((listing) => (
          <div key={listing.id} className="surface-card grid gap-6 rounded-[2rem] p-5 dark:bg-slate-900 sm:p-6 xl:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-3">
              <StatusBadge value={listing.status} />
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50">
                  {listing.make} {listing.model}
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {listing.city} / {formatCurrency(listing.dailyPrice)} {labels.perDay}
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{labels.ownerLabel}: {listing.owner.name}</p>
              </div>
              <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{listing.description}</p>
              {listing.photos.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {listing.photos.slice(0, 6).map((photo, index) => (
                    <div
                      key={photo.id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <img
                        src={photo.url}
                        alt={`${listing.make} ${listing.model} photo ${index + 1}`}
                        className="h-32 w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  {labels.noPhotosUploaded}
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                      {labels.pickupLocation}
                    </p>
                    <p className="mt-2 font-semibold text-slate-950 dark:text-slate-50">{listing.address}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                      {labels.plate}
                    </p>
                    <p className="mt-2 font-semibold text-slate-950 dark:text-slate-50">{listing.plateNumber}</p>
                  </div>
                </div>
                {listing.pickupInstructions ? (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                      {labels.pickupInstructionsLabel}
                    </p>
                    <p className="mt-2 leading-6">{listing.pickupInstructions}</p>
                  </div>
                ) : null}
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                <p className="font-semibold text-slate-950 dark:text-slate-50">{labels.rules}</p>
                <p className="mt-2">{listing.rules}</p>
              </div>
              <ListingReviewActions listingId={listing.id} />
              {listing.rejectionReason ? <p className="text-sm text-rose-600 dark:text-rose-400">{listing.rejectionReason}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
