import { VehicleStatus } from "@prisma/client";
import { ShieldCheck, Star } from "lucide-react";
import { notFound } from "next/navigation";

import { BackButton } from "@/components/back-button";
import { BookingCard } from "@/components/booking-card";
import { CarGallery } from "@/components/car-gallery";
import { ReviewCard } from "@/components/review-card";
import { StatusBadge } from "@/components/status-badge";
import { getDisabledDateIntervals } from "@/lib/availability";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";
import { getVehicleDetail } from "@/lib/queries";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CarDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [resolvedParams, query, locale] = await Promise.all([params, searchParams, getCurrentLocale()]);
  const labels = getDictionary(locale);
  const vehicle = await getVehicleDetail(resolvedParams.id);

  if (!vehicle || vehicle.status !== VehicleStatus.ACTIVE || vehicle.owner.isSuspended) {
    notFound();
  }

  const ownerReviewCount = vehicle.owner.reviewsReceived.length;
  const ownerAverageRating =
    ownerReviewCount > 0
      ? vehicle.owner.reviewsReceived.reduce((sum, review) => sum + review.rating, 0) / ownerReviewCount
      : 0;

  const disabledRanges = getDisabledDateIntervals({
    bookings: vehicle.bookings,
    blocks: vehicle.availabilityBlocks,
  });

  const initialLocation = readQueryValue(query.location) || readQueryValue(query.city);
  const initialStartDate = readQueryValue(query.fromDate) || readQueryValue(query.startDate);
  const initialEndDate = readQueryValue(query.untilDate) || readQueryValue(query.endDate);
  const initialStartTime = readQueryValue(query.fromTime);
  const initialEndTime = readQueryValue(query.untilTime);
  const initialDurationMonths = Number(readQueryValue(query.durationMonths) || "1");
  const monthlyMode = vehicle.monthlyAvailable || readQueryValue(query.filter) === "monthly";

  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_520px] lg:items-start lg:px-8">
      <section className="space-y-8">
        <div>
          <BackButton fallbackHref="/search" label={labels.backToSearch} />
        </div>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge value={vehicle.status} />
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
              {vehicle.city}
            </span>
          </div>
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-slate-50">
                {vehicle.make} {vehicle.model}
              </h1>
              <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
                {vehicle.year} / {vehicle.category} / {vehicle.transmission} / {vehicle.fuelType}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">
                {formatCurrency(vehicle.dailyPrice)}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{labels.deposit} {formatCurrency(vehicle.depositAmount)}</p>
            </div>
          </div>
        </div>

        <CarGallery
          images={vehicle.photos.map((photo) => photo.url)}
          title={`${vehicle.make} ${vehicle.model}`}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50">{labels.carSpecs}</h2>
            <div className="mt-5 grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
              <Spec label={labels.seats} value={vehicle.seats} />
              <Spec label={labels.mileagePerDay} value={`${vehicle.mileageLimitPerDay} km`} />
              <Spec label="Plate" value={vehicle.plateNumber} />
              <Spec label="Address" value={vehicle.address} />
              <Spec label="OSAGO" value={vehicle.hasOsago ? "Confirmed" : "Missing"} />
              <Spec label="CASCO" value={vehicle.hasCasco ? "Available" : "Not included"} />
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50">{labels.owner}</h2>
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-950 dark:text-slate-50">{vehicle.owner.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{vehicle.owner.city}</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {ownerAverageRating ? ownerAverageRating.toFixed(1) : labels.newLabel}
                </div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
                {locale === "uz"
                  ? "Faol e'lonlar uchun egasi tasdiqlangan bo'lishi kerak"
                  : locale === "ru"
                    ? "Для размещения требуется подтвержденный владелец"
                    : "Owner verification required for listings"}
              </div>
              <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{vehicle.description}</p>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{labels.rules}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{vehicle.rules}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50">{labels.reviews}</h2>
          <div className="mt-6 grid gap-4">
            {vehicle.reviews.length ? (
              vehicle.reviews.map((review) => <ReviewCard key={review.id} review={review} />)
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {locale === "uz" ? "Bu avtomobil uchun hali sharh yo'q." : locale === "ru" ? "Для этого авто пока нет отзывов." : "No reviews yet for this car."}
              </p>
            )}
          </div>
        </div>
      </section>

      <aside className="w-full space-y-6">
        <BookingCard
          vehicleId={vehicle.id}
          dailyPrice={vehicle.dailyPrice}
          monthlyPrice={vehicle.monthlyPrice}
          depositAmount={vehicle.depositAmount}
          disabledRanges={disabledRanges}
          monthlyMode={monthlyMode}
          initialDurationMonths={Number.isFinite(initialDurationMonths) ? initialDurationMonths : 1}
          initialLocation={initialLocation}
          initialStartDate={initialStartDate}
          initialEndDate={initialEndDate}
          initialStartTime={initialStartTime}
          initialEndTime={initialEndTime}
        />
        <div className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
          <h3 className="text-lg font-black tracking-tight text-slate-950 dark:text-slate-50">{labels.unavailableBlocks}</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            {vehicle.availabilityBlocks.length ? (
              vehicle.availabilityBlocks.map((block) => (
                <div key={block.id} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                  <p className="font-semibold text-slate-900 dark:text-slate-50">{block.reason}</p>
                  <p className="mt-1">
                    {block.startDate.toDateString()} to {block.endDate.toDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p>{locale === "uz" ? "Hozircha qo'lda bloklangan sana yo'q." : locale === "ru" ? "Пока нет вручную заблокированных дат." : "No manually blocked dates right now."}</p>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

function readQueryValue(value?: string | string[]) {
  return typeof value === "string" ? value : undefined;
}

function Spec({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-2 font-semibold text-slate-900 dark:text-slate-50">{value}</p>
    </div>
  );
}
