import Link from "next/link";
import { Role } from "@prisma/client";

import { DashboardShell } from "@/components/dashboard-shell";
import { EmptyState } from "@/components/empty-state";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";
import { getOwnerEarningsOverview } from "@/lib/owner-earnings";
import { getOwnerDashboardLinks } from "@/lib/owner-navigation";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OwnerEarningsPage() {
  const [user, locale] = await Promise.all([requireRole(Role.OWNER), getCurrentLocale()]);
  const labels = getDictionary(locale);
  const summary = await getOwnerEarningsOverview(user.id);

  return (
    <DashboardShell
      title={labels.earnings}
      description={
        locale === "uz"
          ? "Yakunlangan safarlarni kuzating, har bir avtomobil bo'yicha to'lovlarni ko'ring va eng yaxshi natija berayotgan mashinalarni toping."
          : locale === "ru"
            ? "Следите за завершенными поездками, смотрите выплаты по каждому авто и определяйте самые прибыльные машины."
            : "Track completed trips, review payouts per vehicle, and see which cars are generating the strongest returns."
      }
      links={getOwnerDashboardLinks("earnings", locale)}
    >
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label={locale === "uz" ? "Jami daromad" : locale === "ru" ? "Общий доход" : "Total earned"} value={summary.totalEarned} formatAsCurrency />
        <StatCard label={locale === "uz" ? "Shu oy" : locale === "ru" ? "За месяц" : "This month"} value={summary.thisMonthEarned} formatAsCurrency accent="emerald" />
        <StatCard label={labels.completedTrips} value={summary.completedTrips} />
        <StatCard label={locale === "uz" ? "Kutilayotgan to'lovlar" : locale === "ru" ? "Ожидающие выплаты" : "Pending payouts"} value={summary.pendingPayouts} formatAsCurrency accent="slate" />
      </div>

      {summary.vehicles.length ? (
        <div className="grid gap-5">
          {summary.vehicles.map((vehicle) => {
            const cover = vehicle.photos[0]?.url;

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
                      <h2 className="truncate text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50">
                        {vehicle.make} {vehicle.model} {vehicle.year}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{vehicle.city}</p>
                    </div>
                    <StatusBadge value={vehicle.status} />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <Info label={labels.completedTrips} value={String(vehicle.completedTrips)} />
                    <Info label={labels.earnings} value={formatCurrency(vehicle.totalEarned)} />
                    <Info label={labels.perDay} value={formatCurrency(vehicle.dailyPrice)} />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/dashboard/owner/earnings/${vehicle.id}`}
                      className="btn-primary rounded-full px-4 py-2 text-sm font-semibold transition"
                    >
                      {labels.viewHistory}
                    </Link>
                    <Link
                      href={`/dashboard/owner/listings/${vehicle.id}/edit`}
                      className="btn-secondary rounded-full px-4 py-2 text-sm font-semibold transition"
                    >
                      {labels.edit}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={locale === "uz" ? "Hali daromad tarixi yo'q" : locale === "ru" ? "Пока нет истории доходов" : "No earnings history yet"}
          description={
            locale === "uz"
              ? "Tasdiqlangan e'lonlaringiz bo'yicha safarlar yakunlangach ular shu yerda ko'rinadi."
              : locale === "ru"
                ? "Завершенные поездки по вашим одобренным объявлениям появятся здесь."
                : "Completed trips will appear here once renters finish bookings on your approved listings."
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
