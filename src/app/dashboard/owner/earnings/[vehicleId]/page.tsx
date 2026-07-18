import { Role } from "@prisma/client";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { BackButton } from "@/components/back-button";
import { CashPaymentBadge } from "@/components/cash-payment-badge";
import { DashboardShell } from "@/components/dashboard-shell";
import { EmptyState } from "@/components/empty-state";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
import { getWaivedPlatformFee } from "@/lib/booking-finance";
import { getCashPaymentDisplayLabel, getCashPaymentDisplayState } from "@/lib/booking-payment-display";
import { getCurrentLocale, getDictionary, getStatusLabel } from "@/lib/i18n";
import { getOwnerVehicleEarningsHistory } from "@/lib/owner-earnings";
import { getOwnerDashboardLinks } from "@/lib/owner-navigation";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OwnerVehicleEarningsPage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const [user, locale, resolvedParams] = await Promise.all([requireRole(Role.OWNER), getCurrentLocale(), params]);
  const labels = getDictionary(locale);
  const summary = await getOwnerVehicleEarningsHistory(user.id, resolvedParams.vehicleId);

  if (!summary) {
    notFound();
  }

  const cover = summary.vehicle.photos[0]?.url;

  return (
    <DashboardShell
      title={`${summary.vehicle.make} ${summary.vehicle.model} ${labels.earnings.toLowerCase()}`}
      description={
        locale === "uz"
          ? "Bu avtomobil bo'yicha safar daromadi, to'lov natijalari va ijarachilar tarixini ko'ring."
          : locale === "ru"
            ? "РЎРјРѕС‚СЂРёС‚Рµ РґРѕС…РѕРґРЅРѕСЃС‚СЊ РїРѕ РєР°Р¶РґРѕР№ РїРѕРµР·РґРєРµ, СЂРµР·СѓР»СЊС‚Р°С‚С‹ РѕРїР»Р°С‚ Рё РёСЃС‚РѕСЂРёСЋ Р°СЂРµРЅРґР°С‚РѕСЂРѕРІ РґР»СЏ СЌС‚РѕРіРѕ Р°РІС‚Рѕ."
            : "Review trip-by-trip earnings, payment outcomes, and the renter history for this vehicle."
      }
      links={getOwnerDashboardLinks("earnings", locale)}
      backAction={<BackButton fallbackHref="/dashboard/owner/earnings" label={labels.backToEarnings} />}
    >
      <div className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50">
              {summary.vehicle.make} {summary.vehicle.model} {summary.vehicle.year}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{summary.vehicle.city}</p>
          </div>
          <StatusBadge value={summary.vehicle.status} />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[220px_1fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
            {cover ? (
              <img
                src={cover}
                alt={`${summary.vehicle.make} ${summary.vehicle.model}`}
                className="h-44 w-full object-cover"
              />
            ) : (
              <div className="flex h-44 items-center justify-center text-sm font-semibold text-slate-500 dark:text-slate-400">
                {labels.noPhotosUploaded}
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label={locale === "uz" ? "Jami daromad" : locale === "ru" ? "РћР±С‰РёР№ РґРѕС…РѕРґ" : "Total earned"}
              value={summary.totalEarned}
              formatAsCurrency
            />
            <StatCard label={labels.completedTrips} value={summary.completedTrips} accent="emerald" />
            <StatCard
              label={locale === "uz" ? "O'rtacha safar qiymati" : locale === "ru" ? "РЎСЂРµРґРЅСЏСЏ СЃС‚РѕРёРјРѕСЃС‚СЊ РїРѕРµР·РґРєРё" : "Average trip value"}
              value={summary.averageTripValue}
              formatAsCurrency
              accent="slate"
            />
          </div>
        </div>
      </div>

      {summary.history.length ? (
        <div className="space-y-4">
          {summary.history.map((booking) => {
            const cashPaymentLabel = getCashPaymentDisplayLabel(
              labels,
              getCashPaymentDisplayState({
                bookingStatus: booking.status,
                paymentStatus: booking.paymentStatus,
              }),
            );

            return (
              <div key={booking.id} className="surface-card rounded-[2rem] p-5 dark:bg-slate-900">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">{booking.renterName}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{booking.renterEmail}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge value={booking.status} />
                    <CashPaymentBadge bookingStatus={booking.status} paymentStatus={booking.paymentStatus} />
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <Info label={labels.fromDate} value={formatDate(booking.startDate)} />
                  <Info label={labels.untilDate} value={formatDate(booking.endDate)} />
                  <Info label={labels.daysLabel} value={String(booking.days)} />
                  <Info
                    label={locale === "uz" ? "Ijara summasi" : locale === "ru" ? "РЎСѓРјРјР° Р°СЂРµРЅРґС‹" : "Rental amount"}
                    value={formatCurrency(booking.rentalAmount)}
                  />
                  <Info
                    label={labels.platformServiceFee}
                    value={
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-400 line-through decoration-slate-400/90 dark:text-slate-500 dark:decoration-slate-500/90">
                          {formatCurrency(getWaivedPlatformFee(booking.serviceFee))}
                        </p>
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {labels.waivedForLaunch}
                        </p>
                      </div>
                    }
                  />
                  <Info
                    label={locale === "uz" ? "Ega daromadi" : locale === "ru" ? "Р”РѕС…РѕРґ РІР»Р°РґРµР»СЊС†Р°" : "Owner net"}
                    value={formatCurrency(booking.ownerNet)}
                  />
                  <Info
                    label={locale === "uz" ? "Depozit holati" : locale === "ru" ? "РЎС‚Р°С‚СѓСЃ РґРµРїРѕР·РёС‚Р°" : "Deposit status"}
                    value={getStatusLabel(locale, booking.depositStatus)}
                  />
                  <Info label={labels.paymentMethodLabel} value={cashPaymentLabel} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={locale === "uz" ? "Hali bron tarixi yo'q" : locale === "ru" ? "РџРѕРєР° РЅРµС‚ РёСЃС‚РѕСЂРёРё Р±СЂРѕРЅРёСЂРѕРІР°РЅРёР№" : "No booking history yet"}
          description={
            locale === "uz"
              ? "Bu avtomobil bo'yicha yakunlangan safarlar shu yerda ko'rinadi."
              : locale === "ru"
                ? "Р—Р°РІРµСЂС€РµРЅРЅС‹Рµ РїРѕРµР·РґРєРё РїРѕ СЌС‚РѕРјСѓ Р°РІС‚Рѕ РїРѕСЏРІСЏС‚СЃСЏ Р·РґРµСЃСЊ."
                : "Completed and past trips for this car will appear here once renters start using it."
          }
        />
      )}
    </DashboardShell>
  );
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{label}</p>
      <div className="mt-2 break-words font-semibold text-slate-950 dark:text-slate-50">{value}</div>
    </div>
  );
}
