import Link from "next/link";
import { BookingStatus, Role } from "@prisma/client";

import { OwnerBookingRequestCard } from "@/components/dashboard/owner-booking-request-card";
import { DashboardShell } from "@/components/dashboard-shell";
import { EmptyState } from "@/components/empty-state";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
import { getOwnerPayoutAmount } from "@/lib/booking-finance";
import { db } from "@/lib/db";
import { getCurrentLocale, getDictionary, getStatusLabel } from "@/lib/i18n";
import { getOwnerBookings } from "@/lib/owner-bookings";
import { getOwnerDashboardLinks } from "@/lib/owner-navigation";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OwnerDashboardPage() {
  const [user, locale] = await Promise.all([requireRole(Role.OWNER), getCurrentLocale()]);
  const labels = getDictionary(locale);
  const [vehicles, bookings, messages, reviews] = await Promise.all([
    db.vehicle.findMany({
      where: { ownerId: user.id },
      include: {
        photos: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    getOwnerBookings(user.id),
    db.message.findMany({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
      include: {
        sender: { select: { name: true } },
        receiver: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    db.review.findMany({
      where: {
        receiverId: user.id,
      },
    }),
  ]);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const activeListings = vehicles.filter((vehicle) => vehicle.status === "ACTIVE").length;
  const pendingRequests = bookings.filter((booking) => booking.status === BookingStatus.PENDING_OWNER_APPROVAL);
  const pendingBookings = pendingRequests.length;
  const upcomingApprovedBookings = bookings.filter(
    (booking) => booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.ACTIVE,
  ).length;
  const monthlyEarnings = bookings
    .filter(
      (booking) =>
        booking.status === BookingStatus.COMPLETED &&
        booking.endDate >= monthStart &&
        booking.endDate < nextMonthStart,
    )
    .reduce((sum, booking) => sum + getOwnerPayoutAmount(booking), 0);
  const averageRating =
    reviews.length > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : labels.newLabel;
  const title = locale === "uz" ? "Avtoparkingizni boshqaring" : locale === "ru" ? "Управляйте автопарком" : "Manage your fleet";
  const description =
    locale === "uz"
      ? "Mashinalaringiz, bronlar va daromadni bitta boshqaruv panelida kuzating."
      : locale === "ru"
        ? "Держите свои автомобили, бронирования и доход в одном рабочем пространстве."
        : "Keep your cars, bookings, and earnings in one management workspace.";

  return (
    <DashboardShell
      title={title}
      description={description}
      links={getOwnerDashboardLinks("overview", locale)}
    >
      <div id="owner-earnings" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={labels.activeListings} value={activeListings} />
        <StatCard label={labels.pendingBookings} value={pendingBookings} accent="emerald" />
        <StatCard
          label={locale === "uz" ? "Tasdiqlangan safarlar" : locale === "ru" ? "Подтвержденные поездки" : "Approved trips"}
          value={upcomingApprovedBookings}
          accent="slate"
        />
        <StatCard label={labels.monthlyEarnings} value={monthlyEarnings} formatAsCurrency />
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,520px)]">
        <div className="surface-card rounded-[2rem] p-5 dark:bg-slate-900 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">{labels.myListings}</h2>
            <Link href="/dashboard/owner/listings" className="text-sm font-semibold text-sky-600 dark:text-sky-400">
              {labels.manageListings}
            </Link>
          </div>
          <div className="space-y-4">
            {vehicles.length ? (
              vehicles.slice(0, 4).map((vehicle) => (
                <Link
                  key={vehicle.id}
                  href={`/dashboard/owner/listings/${vehicle.id}/edit`}
                  className="flex min-w-0 items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-sky-200 hover:bg-sky-50/40 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-900"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-950 dark:text-slate-50">
                      {vehicle.make} {vehicle.model}
                    </p>
                    <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                      {vehicle.city} / {formatCurrency(vehicle.dailyPrice)} {labels.perDay}
                    </p>
                  </div>
                  <StatusBadge value={vehicle.status} />
                </Link>
              ))
            ) : (
              <EmptyState
                title={labels.noListingsYet}
                description={labels.noListingsYetDescription}
              />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card rounded-[2rem] p-5 dark:bg-slate-900 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">
                  {locale === "uz" ? "Tezkor boshqaruv" : locale === "ru" ? "Быстрое управление" : "Quick actions"}
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {locale === "uz"
                    ? "Yangi avtomobil qo'shing, bronlarni ko'ring yoki daromad tarixiga o'ting."
                    : locale === "ru"
                      ? "Добавьте автомобиль, откройте запросы на бронирование или перейдите к доходам."
                      : "Add a new car, review booking requests, or jump into your earnings history."}
                </p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                KYC {getStatusLabel(locale, user.kycStatus)}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                  {labels.averageRating}
                </p>
                <p className="mt-2 text-xl font-black text-slate-950 dark:text-slate-50">{averageRating}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                  {labels.kycStatus}
                </p>
                <p className="mt-2 text-xl font-black text-slate-950 dark:text-slate-50">
                  {getStatusLabel(locale, user.kycStatus)}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap">
              <Link href="/dashboard/owner/listings/new" className="btn-primary inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition sm:w-auto">
                {labels.addNewCar}
              </Link>
              <Link href="/dashboard/owner/bookings" className="btn-secondary inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition sm:w-auto">
                {labels.bookingRequests}
              </Link>
              <Link href="/dashboard/owner/earnings" className="btn-secondary inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition sm:w-auto">
                {labels.earnings}
              </Link>
            </div>
          </div>

          <div className="surface-card rounded-[2rem] p-5 dark:bg-slate-900 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">{labels.bookingRequests}</h2>
              <Link href="/dashboard/owner/bookings" className="text-sm font-semibold text-sky-600 dark:text-sky-400">
                {labels.viewAllRequests}
              </Link>
            </div>
            <div className="mt-5 space-y-4">
              {pendingRequests.length ? (
                <div className={pendingRequests.length > 2 ? "max-h-[640px] space-y-4 overflow-y-auto pr-1" : "space-y-4"}>
                  {pendingRequests
                    .slice(0, 3)
                    .map((booking) => <OwnerBookingRequestCard key={booking.id} booking={booking} compact />)}
                </div>
              ) : null}
              {!pendingRequests.length ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">{labels.noPendingRequests}</p>
              ) : null}
            </div>
          </div>

          <div className="surface-card rounded-[2rem] p-5 dark:bg-slate-900 sm:p-6">
            <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">{labels.recentMessages}</h2>
            <div className="mt-5 space-y-4">
              {messages.length ? (
                messages.map((message) => (
                  <div key={message.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                    <p className="font-semibold text-slate-950 dark:text-slate-50">{message.sender.name}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{message.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">{labels.messagesWillAppear}</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
