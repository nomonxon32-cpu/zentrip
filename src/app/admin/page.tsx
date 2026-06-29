import { BookingStatus, KycStatus, Role, VehicleStatus } from "@prisma/client";
import Link from "next/link";

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
  const pendingListings = vehicles.filter((vehicle) => vehicle.status === VehicleStatus.PENDING_REVIEW);
  const activeBookingStatuses: BookingStatus[] = [
    BookingStatus.PENDING_OWNER_APPROVAL,
    BookingStatus.CONFIRMED,
    BookingStatus.ACTIVE,
  ];
  const activeBookings = bookings.filter((booking) => activeBookingStatuses.includes(booking.status)).length;
  const recentUsers = users.slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 6);

  return (
    <AdminShell
      currentPath="/admin"
      title={labels.adminControlCenter}
      description={labels.adminControlDescription}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <StatCard label={labels.totalUsers} value={users.length} />
        <StatCard label={labels.pendingKyc} value={pendingKyc} accent="emerald" />
        <StatCard label={locale === "uz" ? "Kutilayotgan e'lonlar" : locale === "ru" ? "Ожидающие объявления" : "Pending listings"} value={pendingListings.length} />
        <StatCard label={labels.activeListings} value={activeListings} />
        <StatCard label={locale === "uz" ? "Faol bronlar" : locale === "ru" ? "Активные бронирования" : "Active bookings"} value={activeBookings} accent="slate" />
        <StatCard label={labels.totalBookings} value={totalBookings} />
        <StatCard label={labels.disputes} value={disputes.length} accent="emerald" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="surface-card rounded-[2rem] p-5 dark:bg-slate-900 sm:p-6">
          <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">{labels.pendingListingReviews}</h2>
          <div className="mt-5 space-y-4">
            {pendingListings.length ? (
              pendingListings.map((listing) => (
                <div key={listing.id} className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center dark:border-slate-800">
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

        <div className="space-y-6">
          <div className="surface-card rounded-[2rem] p-5 dark:bg-slate-900 sm:p-6">
            <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">
              {locale === "uz" ? "Moderatsiya navbati" : locale === "ru" ? "Очередь модерации" : "Moderation queue"}
            </h2>
            <div className="mt-5 space-y-3">
              {[
                {
                  href: "/admin/kyc",
                  label: locale === "uz" ? "KYC tekshiruvlari" : locale === "ru" ? "Проверки KYC" : "KYC reviews",
                  count: pendingKyc,
                },
                {
                  href: "/admin/listings",
                  label: locale === "uz" ? "E'lon tasdiqlari" : locale === "ru" ? "Проверка объявлений" : "Listing approvals",
                  count: pendingListings.length,
                },
                {
                  href: "/admin/disputes",
                  label: locale === "uz" ? "Ochiq nizolar" : locale === "ru" ? "Открытые споры" : "Open disputes",
                  count: disputes.length,
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-sky-200 hover:bg-sky-50/40 sm:flex-row sm:items-center dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-950"
                >
                  <span className="font-semibold text-slate-950 dark:text-slate-50">{item.label}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{item.count}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="surface-card rounded-[2rem] p-5 dark:bg-slate-900 sm:p-6">
            <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">
              {locale === "uz" ? "Yangi foydalanuvchilar" : locale === "ru" ? "Новые пользователи" : "Recent users"}
            </h2>
            <div className="mt-5 space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center dark:border-slate-800">
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-slate-50">{user.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                  </div>
                  <StatusBadge value={user.role} />
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card rounded-[2rem] p-5 dark:bg-slate-900 sm:p-6">
            <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">{labels.recentBookingStatuses}</h2>
            <div className="mt-5 space-y-4">
              {bookings.slice(0, 4).map((booking) => (
                <div key={booking.id} className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center dark:border-slate-800">
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
      </div>
    </AdminShell>
  );
}
