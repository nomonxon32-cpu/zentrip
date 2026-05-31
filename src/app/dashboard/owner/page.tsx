import Link from "next/link";
import { BookingStatus, Role } from "@prisma/client";

import { OwnerBookingRequestCard } from "@/components/dashboard/owner-booking-request-card";
import { DashboardShell } from "@/components/dashboard-shell";
import { EmptyState } from "@/components/empty-state";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";
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
  const monthlyEarnings = bookings
    .filter(
      (booking) =>
        booking.status === BookingStatus.COMPLETED &&
        booking.endDate >= monthStart &&
        booking.endDate < nextMonthStart,
    )
    .reduce((sum, booking) => sum + booking.rentalAmount - booking.serviceFee, 0);
  const averageRating =
    reviews.length > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : labels.newLabel;

  return (
    <DashboardShell
      title={labels.ownerDashboard}
      description={labels.ownerDashboardDescription}
      links={getOwnerDashboardLinks("overview", locale)}
    >
      <div id="owner-earnings" className="grid gap-4 md:grid-cols-4">
        <StatCard label={labels.activeListings} value={activeListings} />
        <StatCard label={labels.pendingBookings} value={pendingBookings} accent="emerald" />
        <StatCard label={labels.monthlyEarnings} value={monthlyEarnings} formatAsCurrency accent="slate" />
        <StatCard label={labels.averageRating} value={averageRating} />
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,520px)]">
        <div className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
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
          <div className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
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

          <div className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
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
