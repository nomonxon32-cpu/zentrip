import { BookingStatus, Role, VehicleStatus } from "@prisma/client";

import { AdminShell } from "@/components/admin/admin-shell";
import { EmptyState } from "@/components/empty-state";
import { StatCard } from "@/components/stat-card";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await requireRole(Role.ADMIN);
  const locale = await getCurrentLocale();
  const [bookings, vehicles, recentUsers] = await Promise.all([
    db.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        vehicle: {
          select: {
            city: true,
          },
        },
      },
    }),
    db.vehicle.findMany({
      select: {
        city: true,
        status: true,
      },
    }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        role: true,
        createdAt: true,
      },
    }),
  ]);

  const activeBookingStatuses: BookingStatus[] = [
    BookingStatus.PENDING_OWNER_APPROVAL,
    BookingStatus.CONFIRMED,
    BookingStatus.ACTIVE,
  ];
  const activeBookings = bookings.filter((booking) => activeBookingStatuses.includes(booking.status)).length;
  const completedBookings = bookings.filter((booking) => booking.status === BookingStatus.COMPLETED).length;
  const liveListings = vehicles.filter((vehicle) => vehicle.status === VehicleStatus.ACTIVE).length;
  const grossVolume = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

  const cities = Object.entries(
    vehicles.reduce<Record<string, number>>((summary, vehicle) => {
      summary[vehicle.city] = (summary[vehicle.city] ?? 0) + 1;
      return summary;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <AdminShell
      currentPath="/admin/analytics"
      title={locale === "uz" ? "Analitika" : locale === "ru" ? "Аналитика" : "Analytics"}
      description={
        locale === "uz"
          ? "Faol bronlar, aylanma hajm va shaharlardagi taklif tarqalishini tez ko'rib chiqing."
          : locale === "ru"
            ? "Быстро просматривайте активные бронирования, оборот и распределение предложений по городам."
            : "Review live bookings, gross volume, and supply distribution across cities."
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label={locale === "uz" ? "Faol bronlar" : locale === "ru" ? "Активные бронирования" : "Active bookings"} value={activeBookings} />
        <StatCard label={locale === "uz" ? "Yakunlangan safarlar" : locale === "ru" ? "Завершенные поездки" : "Completed trips"} value={completedBookings} accent="emerald" />
        <StatCard label={locale === "uz" ? "Faol e'lonlar" : locale === "ru" ? "Активные объявления" : "Active listings"} value={liveListings} />
        <StatCard label={locale === "uz" ? "Aylanma hajm" : locale === "ru" ? "Оборот" : "Gross volume"} value={grossVolume} formatAsCurrency accent="slate" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
          <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">
            {locale === "uz" ? "Shaharlar bo'yicha taklif" : locale === "ru" ? "Предложение по городам" : "Supply by city"}
          </h2>
          <div className="mt-5 space-y-3">
            {cities.length ? (
              cities.map(([city, count]) => (
                <div key={city} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <span className="font-semibold text-slate-950 dark:text-slate-50">{city}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{count}</span>
                </div>
              ))
            ) : (
              <EmptyState
                title={locale === "uz" ? "Ma'lumot topilmadi" : locale === "ru" ? "Нет данных" : "No analytics yet"}
                description={
                  locale === "uz"
                    ? "E'lonlar paydo bo'lishi bilan shaharlar bo'yicha jamlanma shu yerda ko'rinadi."
                    : locale === "ru"
                      ? "Сводка по городам появится здесь, когда в системе будет больше объявлений."
                      : "City summaries will appear here as more live listings come online."
                }
              />
            )}
          </div>
        </section>

        <section className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
          <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">
            {locale === "uz" ? "Yangi foydalanuvchilar" : locale === "ru" ? "Новые пользователи" : "Recent users"}
          </h2>
          <div className="mt-5 space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <p className="font-semibold text-slate-950 dark:text-slate-50">{user.name}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {user.role} / {user.createdAt.toLocaleDateString("en-US")}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
