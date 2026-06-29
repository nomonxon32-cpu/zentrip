import Link from "next/link";
import { Role } from "@prisma/client";

import { ApiActionButton } from "@/components/api-action-button";
import { DashboardShell } from "@/components/dashboard-shell";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";
import { getOwnerListingsWithMetrics } from "@/lib/owner-earnings";
import { getOwnerDashboardLinks } from "@/lib/owner-navigation";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OwnerListingsPage() {
  const [user, locale] = await Promise.all([requireRole(Role.OWNER), getCurrentLocale()]);
  const labels = getDictionary(locale);
  const vehicles = await getOwnerListingsWithMetrics(user.id);

  return (
    <DashboardShell
      title={labels.ownerListingsTitle}
      description={labels.ownerListingsDescription}
      links={getOwnerDashboardLinks("listings", locale)}
    >
      <div className="surface-card flex flex-col items-start justify-between gap-4 rounded-[2rem] p-5 dark:bg-slate-900 sm:flex-row sm:items-center sm:p-6">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">{labels.myListings}</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {locale === "uz"
              ? "E'lon tafsilotlarini tahrirlang, mavjudlikni boshqaring va har bir avtomobil natijasini kuzating."
              : locale === "ru"
                ? "Редактируйте объявления, управляйте доступностью и следите за результатами каждого авто."
                : "Edit listing details, manage availability blocks, and review how each vehicle is performing."}
          </p>
        </div>
        <Link
          href="/dashboard/owner/listings/new"
          className="btn-primary inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition sm:w-auto"
        >
          {labels.addNewCar}
        </Link>
      </div>

      {vehicles.length ? (
        <div className="grid gap-5">
          {vehicles.map((vehicle) => {
            const cover = vehicle.photos[0]?.url;
            const toggleAction = vehicle.status === "ACTIVE" ? "DEACTIVATE" : "ACTIVATE";

            return (
              <div
                key={vehicle.id}
                className="surface-card grid gap-5 rounded-[2rem] p-5 dark:bg-slate-900 lg:grid-cols-[220px_1fr]"
              >
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
                  {cover ? (
                    <img
                      src={cover}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="h-44 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-44 items-center justify-center text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {labels.noPhotosUploaded}
                    </div>
                  )}
                </div>

                <div className="min-w-0 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50">
                        {vehicle.make} {vehicle.model} {vehicle.year}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {vehicle.city} / {formatCurrency(vehicle.dailyPrice)} {labels.perDay}
                      </p>
                    </div>
                    <StatusBadge value={vehicle.status} />
                  </div>

                  <div className="grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2 xl:grid-cols-3">
                    <Info label={labels.completedTrips} value={String(vehicle.completedTrips)} />
                    <Info label={labels.earnings} value={formatCurrency(vehicle.totalEarned)} />
                    <Info
                      label={labels.pendingBookings}
                      value={
                        vehicle.hasPendingRequests
                          ? locale === "uz"
                            ? "Ko'rib chiqish kutilmoqda"
                            : locale === "ru"
                              ? "Ожидает проверки"
                              : "Waiting for review"
                          : labels.noneLabel
                      }
                    />
                  </div>

                  <div className="grid gap-3 sm:flex sm:flex-wrap">
                    <Link
                      href={`/dashboard/owner/listings/${vehicle.id}/edit`}
                      className="btn-secondary inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition sm:w-auto"
                    >
                      {labels.edit}
                    </Link>
                    <Link
                      href={`/dashboard/owner/listings/${vehicle.id}/edit`}
                      className="btn-secondary inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition sm:w-auto"
                    >
                      {labels.manageAvailability}
                    </Link>
                    <Link
                      href={`/dashboard/owner/earnings/${vehicle.id}`}
                      className="btn-secondary inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition sm:w-auto"
                    >
                      {labels.viewEarnings}
                    </Link>
                    <ApiActionButton
                      endpoint={`/api/listings/${vehicle.id}`}
                      payload={{ action: toggleAction }}
                      label={vehicle.status === "ACTIVE" ? labels.deactivate : labels.sendForReview}
                      successMessage={
                        vehicle.status === "ACTIVE"
                          ? labels.listingDeactivated
                          : locale === "uz"
                            ? "E'lon qayta ko'rib chiqishga yuborildi"
                            : locale === "ru"
                              ? "Объявление отправлено на повторную проверку"
                              : "Listing resubmitted"
                      }
                      variant={vehicle.status === "ACTIVE" ? "outline" : "default"}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={labels.noListingsYet}
          description={labels.noListingsYetDescription}
          action={
            <Link
              href="/dashboard/owner/listings/new"
              className="btn-primary inline-flex rounded-full px-5 py-3 text-sm font-semibold transition"
            >
              {labels.addNewCar}
            </Link>
          }
        />
      )}
    </DashboardShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-2 break-words font-semibold text-slate-950 dark:text-slate-50">{value}</p>
    </div>
  );
}
