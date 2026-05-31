import { KycStatus, Role, VehicleStatus } from "@prisma/client";

import { AdminShell } from "@/components/admin/admin-shell";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  await requireRole(Role.ADMIN);
  const locale = await getCurrentLocale();
  const labels = getDictionary(locale);

  const [users, vehicles, bookings, disputes] = await Promise.all([
    db.user.findMany(),
    db.vehicle.findMany(),
    db.booking.findMany(),
    db.dispute.findMany(),
  ]);

  const pendingKyc = users.filter((user) => user.kycStatus === KycStatus.PENDING).length;
  const activeListings = vehicles.filter((vehicle) => vehicle.status === VehicleStatus.ACTIVE).length;
  const totalBookings = bookings.length;
  const gmv = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
  const pendingListings = vehicles.filter((vehicle) => vehicle.status === VehicleStatus.PENDING_REVIEW);

  return (
    <AdminShell
      currentPath="/admin"
      title={labels.adminControlCenter}
      description={labels.adminControlDescription}
    >
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label={labels.totalUsers} value={users.length} />
        <StatCard label={labels.pendingKyc} value={pendingKyc} accent="emerald" />
        <StatCard label={labels.activeListings} value={activeListings} />
        <StatCard label={labels.totalBookings} value={totalBookings} accent="slate" />
        <StatCard label={labels.gmv} value={gmv} formatAsCurrency />
        <StatCard label={labels.disputes} value={disputes.length} accent="emerald" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <div className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
          <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">{labels.pendingListingReviews}</h2>
          <div className="mt-5 space-y-4">
            {pendingListings.length ? (
              pendingListings.map((listing) => (
                <div key={listing.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-slate-50">
                      {listing.make} {listing.model}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{listing.city}</p>
                  </div>
                  <StatusBadge value={listing.status} />
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">{labels.noPendingListingReviews}</p>
            )}
          </div>
        </div>

        <div className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
          <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">{labels.recentBookingStatuses}</h2>
          <div className="mt-5 space-y-4">
            {bookings.slice(0, 6).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div>
                  <p className="font-semibold text-slate-950 dark:text-slate-50">{booking.id.slice(-8)}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{formatCurrency(booking.totalAmount)}</p>
                </div>
                <StatusBadge value={booking.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
