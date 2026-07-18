import Link from "next/link";
import { Role, VehicleStatus } from "@prisma/client";

import { AdminShell } from "@/components/admin/admin-shell";
import { ListingReviewActions } from "@/components/admin/listing-review-actions";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentLocale, getDictionary, getStatusLabel, type Locale } from "@/lib/i18n";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ListingFilter = "PENDING_REVIEW" | "ACTIVE" | "REJECTED" | "INACTIVE" | "ALL";
type ListingSort = "newest" | "oldest" | "priceHigh" | "priceLow";

const FILTER_OPTIONS: ListingFilter[] = [
  VehicleStatus.PENDING_REVIEW,
  VehicleStatus.ACTIVE,
  VehicleStatus.REJECTED,
  VehicleStatus.INACTIVE,
  "ALL",
];

const SORT_OPTIONS: ListingSort[] = ["newest", "oldest", "priceHigh", "priceLow"];

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole(Role.ADMIN);

  const [params, locale] = await Promise.all([searchParams, getCurrentLocale()]);
  const labels = getDictionary(locale);

  const currentFilter = parseListingFilter(typeof params.status === "string" ? params.status : undefined);
  const currentSort = parseListingSort(typeof params.sort === "string" ? params.sort : undefined);

  const [counts, listings] = await Promise.all([
    db.vehicle.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    db.vehicle.findMany({
      where: currentFilter === "ALL" ? undefined : { status: currentFilter },
      include: {
        owner: true,
        photos: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: getListingSortOrder(currentSort),
    }),
  ]);

  const countsByStatus = counts.reduce<Record<string, number>>((accumulator, entry) => {
    accumulator[entry.status] = entry._count._all;
    return accumulator;
  }, {});

  const totalListings = counts.reduce((sum, entry) => sum + entry._count._all, 0);

  const filterTabs = FILTER_OPTIONS.map((option) => ({
    value: option,
    label: getFilterLabel(option, locale),
    count:
      option === "ALL"
        ? totalListings
        : countsByStatus[option] ?? 0,
    href: buildListingsHref(option, currentSort),
  }));

  const sortTabs = SORT_OPTIONS.map((option) => ({
    value: option,
    label: getSortLabel(option, locale),
    href: buildListingsHref(currentFilter, option),
  }));

  return (
    <AdminShell
      currentPath="/admin/listings"
      title={labels.listings}
      description={labels.listingsDescription}
    >
      <div className="surface-card space-y-5 rounded-[2rem] p-5 dark:bg-slate-900 sm:p-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
            {labels.currentStatus}
          </p>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {filterTabs.map((tab) => {
              const isActive = tab.value === currentFilter;

              return (
                <Link
                  key={tab.value}
                  href={tab.href}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
                    isActive
                      ? "border-slate-950 bg-slate-950 text-white hover:bg-slate-800 dark:border-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-bold",
                      isActive
                        ? "bg-white/20 text-white dark:bg-slate-200 dark:text-slate-950"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                    )}
                  >
                    {tab.count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
            {labels.sortBy}
          </p>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {sortTabs.map((tab) => {
              const isActive = tab.value === currentSort;

              return (
                <Link
                  key={tab.value}
                  href={tab.href}
                  className={cn(
                    "inline-flex shrink-0 items-center rounded-full border px-4 py-2 text-sm font-semibold transition",
                    isActive
                      ? "border-slate-950 bg-slate-950 text-white hover:bg-slate-800 dark:border-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {listings.length ? (
        <div className="grid gap-6">
          {listings.map((listing) => {
            const mainPhoto = listing.photos[0];
            const thumbnailPhotos = listing.photos.slice(1, 4);

            return (
              <article
                key={listing.id}
                className="surface-card grid gap-6 rounded-[2rem] p-5 dark:bg-slate-900 sm:p-6 xl:grid-cols-[320px_minmax(0,1fr)]"
              >
                <div className="space-y-4">
                  {mainPhoto ? (
                    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950">
                      <img
                        src={mainPhoto.url}
                        alt={`${listing.make} ${listing.model}`}
                        className="h-56 w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="flex h-56 items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
                      {labels.noPhotosUploaded}
                    </div>
                  )}

                  {thumbnailPhotos.length ? (
                    <div className="grid grid-cols-3 gap-3">
                      {thumbnailPhotos.map((photo, index) => (
                        <div
                          key={photo.id}
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950"
                        >
                          <img
                            src={photo.url}
                            alt={`${listing.make} ${listing.model} thumbnail ${index + 2}`}
                            className="h-20 w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="min-w-0 space-y-5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge value={listing.status} />
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                        {labels.submittedOn}: {formatDate(listing.createdAt)}
                      </p>
                    </div>
                    <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50">
                      {listing.make} {listing.model}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      {listing.city} / {formatCurrency(listing.dailyPrice)} {labels.perDay}
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <InfoCard label={labels.ownerLabel} value={listing.owner.name} />
                    <InfoCard label={labels.pickupLocation} value={listing.address} />
                    <InfoCard label={labels.plate} value={listing.plateNumber} />
                    <InfoCard label={labels.currentStatus} value={getStatusLabel(locale, listing.status)} />
                  </div>

                  {listing.pickupInstructions ? (
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                        {labels.pickupInstructionsLabel}
                      </p>
                      <p className="mt-2 leading-6">{listing.pickupInstructions}</p>
                    </div>
                  ) : null}

                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.9fr)]">
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                        {labels.vehicleDetails}
                      </p>
                      <p className="mt-2 leading-7">{listing.description}</p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                        {labels.rules}
                      </p>
                      <p className="mt-2 leading-7">{listing.rules}</p>
                    </div>
                  </div>

                  {listing.rejectionReason ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      <p className="font-semibold">{labels.rejectionReason}</p>
                      <p className="mt-2 leading-6">{listing.rejectionReason}</p>
                    </div>
                  ) : null}

                  <ListingReviewActions
                    listingId={listing.id}
                    status={listing.status}
                    publicHref={listing.status === VehicleStatus.ACTIVE ? `/cars/${listing.id}` : undefined}
                  />
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={labels.noResults}
          description={getEmptyStateDescription(locale, currentFilter)}
        />
      )}
    </AdminShell>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-2 break-words font-semibold text-slate-950 dark:text-slate-50">{value}</p>
    </div>
  );
}

function parseListingFilter(value?: string): ListingFilter {
  if (value && FILTER_OPTIONS.includes(value as ListingFilter)) {
    return value as ListingFilter;
  }

  return VehicleStatus.PENDING_REVIEW;
}

function parseListingSort(value?: string): ListingSort {
  if (value && SORT_OPTIONS.includes(value as ListingSort)) {
    return value as ListingSort;
  }

  return "newest";
}

function getListingSortOrder(sort: ListingSort) {
  switch (sort) {
    case "oldest":
      return { createdAt: "asc" } as const;
    case "priceHigh":
      return { dailyPrice: "desc" } as const;
    case "priceLow":
      return { dailyPrice: "asc" } as const;
    case "newest":
    default:
      return { createdAt: "desc" } as const;
  }
}

function buildListingsHref(filter: ListingFilter, sort: ListingSort) {
  const params = new URLSearchParams();
  params.set("status", filter);
  params.set("sort", sort);
  return `/admin/listings?${params.toString()}`;
}

function getFilterLabel(filter: ListingFilter, locale: Locale) {
  if (filter === "ALL") {
    return getDictionary(locale).quickAll;
  }

  if (filter === VehicleStatus.INACTIVE) {
    return getDictionary(locale).deactivated;
  }

  return getStatusLabel(locale, filter);
}

function getSortLabel(sort: ListingSort, locale: Locale) {
  const labels = getDictionary(locale);

  switch (sort) {
    case "oldest":
      return labels.oldestFirst;
    case "priceHigh":
      return labels.priceHighToLow;
    case "priceLow":
      return labels.priceLowToHigh;
    case "newest":
    default:
      return labels.newest;
  }
}

function getEmptyStateDescription(locale: Locale, filter: ListingFilter) {
  if (filter === VehicleStatus.PENDING_REVIEW) {
    return getDictionary(locale).noPendingListingReviews;
  }

  if (locale === "uz") {
    switch (filter) {
      case VehicleStatus.ACTIVE:
        return "Hozircha faol e'lonlar topilmadi.";
      case VehicleStatus.REJECTED:
        return "Rad etilgan e'lonlar topilmadi.";
      case VehicleStatus.INACTIVE:
        return "Faolsiz e'lonlar topilmadi.";
      case "ALL":
      default:
        return "Hozircha hech qanday e'lon topilmadi.";
    }
  }

  if (locale === "ru") {
    switch (filter) {
      case VehicleStatus.ACTIVE:
        return "Активные объявления пока не найдены.";
      case VehicleStatus.REJECTED:
        return "Отклоненные объявления пока не найдены.";
      case VehicleStatus.INACTIVE:
        return "Деактивированные объявления пока не найдены.";
      case "ALL":
      default:
        return "Объявления пока не найдены.";
    }
  }

  switch (filter) {
    case VehicleStatus.ACTIVE:
      return "No active listings matched this view yet.";
    case VehicleStatus.REJECTED:
      return "No rejected listings matched this view yet.";
    case VehicleStatus.INACTIVE:
      return "No deactivated listings matched this view yet.";
    case "ALL":
    default:
      return "No listings matched this view yet.";
  }
}
