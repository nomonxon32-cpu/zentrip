import Link from "next/link";
import { BookingStatus, Role } from "@prisma/client";

import { CashPaymentBadge } from "@/components/cash-payment-badge";
import { DashboardShell } from "@/components/dashboard-shell";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";
import { getRenterDashboardLinks } from "@/lib/renter-navigation";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function RenterBookingsPage() {
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
    orderBy: [{ startDate: "desc" }],
  });

  const sections = [
    {
      title: locale === "uz" ? "Kutilayotgan va faol" : locale === "ru" ? "Предстоящие и активные" : "Upcoming and active",
      items: bookings.filter(
        (booking) =>
          booking.status === BookingStatus.PENDING_OWNER_APPROVAL ||
          booking.status === BookingStatus.CONFIRMED ||
          booking.status === BookingStatus.ACTIVE,
      ),
    },
    {
      title: labels.completedTrips,
      items: bookings.filter((booking) => booking.status === BookingStatus.COMPLETED),
    },
    {
      title:
        locale === "uz"
          ? "Bekor qilingan va rad etilgan"
          : locale === "ru"
            ? "Отмененные и отклоненные"
            : "Cancelled and rejected",
      items: bookings.filter(
        (booking) =>
          booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.REJECTED,
      ),
    },
  ];

  return (
    <DashboardShell
      title={labels.myBookings}
      description={
        locale === "uz"
          ? "Barcha ijarachi bronlarini bir joyda ko'ring: tasdiq kutilayotgan so'rovlardan yakunlangan safargacha."
          : locale === "ru"
            ? "Просматривайте все бронирования арендатора в одном месте: от ожидающих одобрения до завершенных поездок."
            : "Review every renter booking in one place, from pending approvals to completed trips."
      }
      links={getRenterDashboardLinks("bookings", locale)}
    >
      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.title} className="space-y-4">
            <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50">{section.title}</h2>
            {section.items.length ? (
              <div className="grid gap-4">
                {section.items.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/dashboard/renter/bookings/${booking.id}`}
                    className="surface-card grid gap-5 rounded-[2rem] p-5 md:grid-cols-[220px_1fr] dark:bg-slate-900"
                  >
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                      {booking.vehicle.photos[0]?.url ? (
                        <img
                          src={booking.vehicle.photos[0].url}
                          alt={`${booking.vehicle.make} ${booking.vehicle.model}`}
                          className="h-40 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-40 items-center justify-center text-sm font-semibold text-slate-500 dark:text-slate-400">
                          {labels.noPhotosUploaded}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50">
                            {booking.vehicle.make} {booking.vehicle.model}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {formatDate(booking.startDate)} to {formatDate(booking.endDate)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge value={booking.status} />
                          <CashPaymentBadge
                            settled={
                              booking.status === BookingStatus.ACTIVE ||
                              booking.status === BookingStatus.COMPLETED
                            }
                          />
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <Info label={labels.daysLabel} value={String(booking.days)} />
                        <Info label={labels.totalPayable} value={`${booking.totalAmount.toLocaleString("en-US")} UZS`} />
                        <Info
                          label={locale === "uz" ? "Avtomobil shahri" : locale === "ru" ? "Город автомобиля" : "Vehicle city"}
                          value={booking.vehicle.city}
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title={
                  locale === "uz"
                    ? `${section.title} bo'limida bronlar yo'q`
                    : locale === "ru"
                      ? `Нет бронирований в разделе ${section.title.toLowerCase()}`
                      : `No ${section.title.toLowerCase()} bookings`
                }
                description={
                  locale === "uz"
                    ? "Egalar safarlaringizni tasdiqlashi, yakunlashi yoki bekor qilishi bilan bu bo'lim avtomatik yangilanadi."
                    : locale === "ru"
                      ? "Этот раздел обновится автоматически, когда владельцы подтвердят, завершат или отменят ваши поездки."
                      : "This section updates automatically as owners approve, complete, or cancel your trips."
                }
              />
            )}
          </section>
        ))}
      </div>
    </DashboardShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-2 break-words font-semibold text-slate-950 dark:text-slate-50">{value}</p>
    </div>
  );
}
