import Link from "next/link";
import { Role } from "@prisma/client";
import { notFound } from "next/navigation";

import { BackButton } from "@/components/back-button";
import { PriceBreakdown } from "@/components/price-breakdown";
import { StatusBadge } from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function BookingConfirmedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [user, locale, resolvedParams] = await Promise.all([requireRole(Role.RENTER), getCurrentLocale(), params]);
  const labels = getDictionary(locale);
  const booking = await db.booking.findUnique({
    where: { id: resolvedParams.id },
    include: {
      vehicle: true,
    },
  });

  if (!booking || booking.renterId !== user.id) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackHref="/dashboard/renter" label={labels.backToDashboard} />
      </div>
      <div className="surface-card rounded-[2.5rem] p-8 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">{labels.bookingRequested}</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 dark:text-slate-50">
          {locale === "uz"
            ? `${booking.vehicle.make} ${booking.vehicle.model} uchun so'rovingiz yuborildi.`
            : locale === "ru"
              ? `Ваш запрос на ${booking.vehicle.make} ${booking.vehicle.model} отправлен.`
              : `Your request for ${booking.vehicle.make} ${booking.vehicle.model} is in.`}
        </h1>
        <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-400">
          {locale === "uz"
            ? "To'lov muvaffaqiyatli simulyatsiya qilindi va egasiga xabar yuborildi. Qaytariladigan depozit safar yakunigacha ushlab turiladi."
            : locale === "ru"
              ? "Оплата успешно смоделирована, владелец уведомлен. Возвратный депозит удерживается до завершения поездки."
              : "Payment was simulated successfully and the owner has been notified. The refundable deposit is marked as held until trip completion."}
        </p>
        <div className="mt-6">
          <StatusBadge value={booking.status} />
        </div>
        <div className="mt-8">
          <PriceBreakdown
            days={booking.days}
            dailyPrice={booking.dailyPrice}
            rentalAmount={booking.rentalAmount}
            serviceFee={booking.serviceFee}
            depositAmount={booking.depositAmount}
            deliveryFee={booking.deliveryFee}
            totalAmount={booking.totalAmount}
          />
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/dashboard/renter/bookings/${booking.id}`} className="btn-primary rounded-full px-5 py-3 text-sm font-semibold transition">
            {labels.view}
          </Link>
          <Link href="/search" className="btn-secondary rounded-full px-5 py-3 text-sm font-semibold transition">
            {labels.browseCars}
          </Link>
        </div>
      </div>
    </div>
  );
}
