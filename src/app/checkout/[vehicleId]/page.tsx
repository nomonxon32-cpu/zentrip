import Link from "next/link";
import { BookingType, Role, VehicleStatus } from "@prisma/client";
import { notFound } from "next/navigation";

import { BackButton } from "@/components/back-button";
import { CheckoutForm } from "@/components/forms/checkout-form";
import { EmptyState } from "@/components/empty-state";
import { getDisabledDateIntervals } from "@/lib/availability";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ vehicleId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [user, locale, resolvedParams, query] = await Promise.all([
    requireRole(Role.RENTER),
    getCurrentLocale(),
    params,
    searchParams,
  ]);
  const labels = getDictionary(locale);
  const pickupLocation =
    typeof query.location === "string"
      ? query.location
      : typeof query.city === "string"
        ? query.city
        : undefined;
  const startDate =
    typeof query.fromDate === "string"
      ? query.fromDate
      : typeof query.startDate === "string"
        ? query.startDate
        : undefined;
  const endDate =
    typeof query.untilDate === "string"
      ? query.untilDate
      : typeof query.endDate === "string"
        ? query.endDate
        : undefined;
  const startTime = typeof query.fromTime === "string" ? query.fromTime : undefined;
  const endTime = typeof query.untilTime === "string" ? query.untilTime : undefined;
  const bookingType = typeof query.bookingType === "string" ? query.bookingType : undefined;
  const durationMonths =
    typeof query.durationMonths === "string" && Number.isFinite(Number(query.durationMonths))
      ? Number(query.durationMonths)
      : undefined;

  const vehicle = await db.vehicle.findUnique({
    where: { id: resolvedParams.vehicleId },
    include: {
      owner: true,
      bookings: {
        select: {
          startDate: true,
          endDate: true,
          status: true,
        },
      },
      availabilityBlocks: {
        select: {
          startDate: true,
          endDate: true,
        },
      },
    },
  });

  if (!vehicle) {
    notFound();
  }

  if (vehicle.status !== VehicleStatus.ACTIVE || vehicle.owner.isSuspended) {
    notFound();
  }

  if (user.kycStatus !== "APPROVED") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <EmptyState
          title={locale === "uz" ? "Checkout uchun KYC tasdig'i kerak" : locale === "ru" ? "Для оформления нужен одобренный KYC" : "KYC approval required before checkout"}
          description={locale === "uz" ? "Bron so'rovi yuborilishidan oldin ijarachining tasdiqlanishi kerak." : locale === "ru" ? "Перед оплатой и отправкой запроса арендатор должен быть подтвержден." : "Renter verification must be approved before a booking request can be paid and submitted."}
          action={
            <Link href="/dashboard/kyc" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-slate-800 hover:!text-white dark:bg-slate-100 dark:!text-slate-950 dark:hover:bg-slate-200 dark:hover:!text-slate-950">
              {labels.kyc}
            </Link>
          }
        />
      </div>
    );
  }

  const disabledRanges = getDisabledDateIntervals({
    bookings: vehicle.bookings,
    blocks: vehicle.availabilityBlocks,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackHref={`/cars/${vehicle.id}`} label={labels.backToCar} />
      </div>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">
          {locale === "uz" ? "Checkout" : locale === "ru" ? "Оформление" : "Checkout"}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">
          {vehicle.make} {vehicle.model}
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {locale === "uz"
            ? "Ushbu MVPda har bir bron so'rovi egasi tomonidan tasdiqlanadi."
            : locale === "ru"
              ? "В этом MVP каждое бронирование требует одобрения владельца."
              : "Owner approval is required for every booking request in this MVP."}
        </p>
      </div>
      <CheckoutForm
        vehicleId={vehicle.id}
        dailyPrice={vehicle.dailyPrice}
        monthlyPrice={vehicle.monthlyPrice ?? undefined}
        depositAmount={vehicle.depositAmount}
        monthlyMode={vehicle.monthlyAvailable && bookingType === BookingType.MONTHLY}
        deliveryAvailable={vehicle.deliveryAvailable}
        deliveryFee={vehicle.deliveryFee ?? 0}
        airportPickupAvailable={vehicle.airportPickupAvailable}
        pickupInstructions={vehicle.pickupInstructions ?? undefined}
        pickupLocation={pickupLocation}
        initialStartDate={startDate}
        initialEndDate={endDate}
        initialDurationMonths={durationMonths}
        initialStartTime={startTime}
        initialEndTime={endTime}
        disabledRanges={disabledRanges}
      />
    </div>
  );
}
