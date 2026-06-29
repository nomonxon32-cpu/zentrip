import Link from "next/link";
import { BookingStatus, Role } from "@prisma/client";

import { DashboardShell } from "@/components/dashboard-shell";
import { EmptyState } from "@/components/empty-state";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentLocale, getDictionary, getStatusLabel } from "@/lib/i18n";
import { getRenterDashboardLinks } from "@/lib/renter-navigation";

export const dynamic = "force-dynamic";

export default async function RenterDashboardPage() {
  const [user, locale] = await Promise.all([requireRole(Role.RENTER), getCurrentLocale()]);
  const labels = getDictionary(locale);
  const bookings = await db.booking.findMany({
    where: { renterId: user.id },
    include: {
      vehicle: {
        include: {
          photos: {
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { startDate: "desc" },
  });

  const upcomingBookings = bookings.filter(
    (booking) =>
      booking.status === BookingStatus.PENDING_OWNER_APPROVAL ||
      booking.status === BookingStatus.CONFIRMED ||
      booking.status === BookingStatus.ACTIVE,
  );
  const pastBookings = bookings.filter(
    (booking) =>
      booking.status === BookingStatus.COMPLETED ||
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.REJECTED,
  );

  return (
    <DashboardShell
      title={labels.renterDashboard}
      description={labels.renterDashboardDescription}
      links={getRenterDashboardLinks("overview", locale)}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label={labels.upcomingBookings} value={upcomingBookings.length} />
        <StatCard
          label={labels.completedTrips}
          value={pastBookings.filter((booking) => booking.status === BookingStatus.COMPLETED).length}
          accent="emerald"
        />
        <StatCard label={labels.kycStatus} value={getStatusLabel(locale, user.kycStatus)} accent="slate" />
      </div>

      <section className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
        <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
          <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">{labels.upcomingAndActive}</h2>
          <Link href="/search" className="text-sm font-semibold text-sky-600 dark:text-sky-400">
            {labels.bookAnotherCar}
          </Link>
        </div>
        <div className="space-y-4">
          {upcomingBookings.length ? (
            upcomingBookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/dashboard/renter/bookings/${booking.id}`}
                  className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-sky-200 hover:bg-sky-50/40 sm:flex-row sm:flex-wrap sm:items-center dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-900"
                >
                  <div>
                  <p className="font-semibold text-slate-950 dark:text-slate-50">
                    {booking.vehicle.make} {booking.vehicle.model}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {booking.startDate.toDateString()} to {booking.endDate.toDateString()}
                  </p>
                </div>
                <StatusBadge value={booking.status} />
              </Link>
            ))
          ) : (
            <EmptyState
              title={labels.noActiveTripsYet}
              description={labels.noActiveTripsDescription}
            />
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
          <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">{labels.pastBookings}</h2>
          <div className="mt-5 space-y-4">
            {pastBookings.length ? (
              pastBookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/dashboard/renter/bookings/${booking.id}`}
                  className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center dark:border-slate-800"
                >
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-slate-50">
                      {booking.vehicle.make} {booking.vehicle.model}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{getStatusLabel(locale, booking.status)}</p>
                  </div>
                  <StatusBadge value={booking.status} />
                </Link>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">{labels.noPastBookingsYet}</p>
            )}
          </div>
        </div>
        <div className="space-y-6">
          <div className="surface-dashed rounded-[2rem] p-6 shadow-sm dark:bg-slate-900">
            <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">{labels.savedCars}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {labels.savedCarsDescription}
            </p>
          </div>
          <div className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
            <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">{labels.quickActions}</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/dashboard/kyc" className="btn-primary rounded-full px-4 py-2 text-sm font-semibold transition">
                {labels.updateKyc}
              </Link>
              <Link href="/search" className="btn-secondary rounded-full px-4 py-2 text-sm font-semibold transition">
                {labels.browseCars}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
