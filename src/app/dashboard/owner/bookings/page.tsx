import { BookingStatus, Role } from "@prisma/client";

import { OwnerBookingRequestCard } from "@/components/dashboard/owner-booking-request-card";
import { DashboardShell } from "@/components/dashboard-shell";
import { EmptyState } from "@/components/empty-state";
import { requireRole } from "@/lib/auth";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";
import { getOwnerBookings } from "@/lib/owner-bookings";
import { getOwnerDashboardLinks } from "@/lib/owner-navigation";

export const dynamic = "force-dynamic";

export default async function OwnerBookingsPage() {
  const [user, locale] = await Promise.all([requireRole(Role.OWNER), getCurrentLocale()]);
  const labels = getDictionary(locale);
  const bookings = await getOwnerBookings(user.id);

  const groupedBookings = [
    {
      title:
        locale === "uz" ? "Tasdiq kutilmoqda" : locale === "ru" ? "Ожидают одобрения" : "Pending approval",
      description:
        locale === "uz"
          ? "Mock checkout to'langan va sizning qaroringizni kutayotgan so'rovlar."
          : locale === "ru"
            ? "Запросы, которые уже оплатили mock checkout и ждут вашего решения."
            : "Requests that already paid the mock checkout and need your decision.",
      items: bookings.filter((booking) => booking.status === BookingStatus.PENDING_OWNER_APPROVAL),
    },
    {
      title:
        locale === "uz" ? "Tasdiqlangan va faol" : locale === "ru" ? "Подтвержденные и активные" : "Confirmed and active",
      description:
        locale === "uz"
          ? "Tasdiqlangan va jarayondagi safarlar."
          : locale === "ru"
            ? "Одобренные поездки, которые запланированы или уже идут."
            : "Approved trips that are scheduled or currently in progress.",
      items: bookings.filter(
        (booking) =>
          booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.ACTIVE,
      ),
    },
    {
      title: labels.completedTrips,
      description:
        locale === "uz"
          ? "Yakunlangan safarlar va bo'shatilgan depozitlar."
          : locale === "ru"
            ? "Завершенные поездки и освобожденные депозиты."
            : "Finished trips and released deposits.",
      items: bookings.filter((booking) => booking.status === BookingStatus.COMPLETED),
    },
    {
      title:
        locale === "uz" ? "Rad etilgan va bekor qilingan" : locale === "ru" ? "Отклоненные и отмененные" : "Rejected and cancelled",
      description:
        locale === "uz"
          ? "Davom etmagan so'rovlar, nizoli safarlar va qaytarilgan mock to'lovlar."
          : locale === "ru"
            ? "Запросы, которые не состоялись, спорные поездки и возвраты mock платежей."
            : "Requests that did not proceed, disputed trips, and any refunded mock payments.",
      items: bookings.filter(
        (booking) =>
          booking.status === BookingStatus.REJECTED ||
          booking.status === BookingStatus.CANCELLED ||
          booking.status === BookingStatus.DISPUTED,
      ),
    },
  ];

  return (
    <DashboardShell
      title={labels.bookingRequests}
      description={
        locale === "uz"
          ? "Kiruvchi bron so'rovlarini ko'rib chiqing, safarlarni tasdiqlang va oldingi to'lov natijalarini kuzating."
          : locale === "ru"
            ? "Проверяйте входящие запросы, подтверждайте поездки и отслеживайте прошлые результаты оплат."
            : "Review incoming booking requests, confirm upcoming trips, and keep an eye on past payment outcomes."
      }
      links={getOwnerDashboardLinks("bookings", locale)}
    >
      <div className="space-y-8">
        {groupedBookings.map((section) => (
          <section key={section.title} className="space-y-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50">{section.title}</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{section.description}</p>
            </div>
            {section.items.length ? (
              <div className="grid gap-4">
                {section.items.map((booking) => (
                  <OwnerBookingRequestCard key={booking.id} booking={booking} compact={false} />
                ))}
              </div>
            ) : (
              <EmptyState
                title={`${labels.noResults}`}
                description={
                  locale === "uz"
                    ? "Ijarachilar so'rov yuborishi, safarni yakunlashi yoki bekor qilishi bilan bu bo'lim yangilanadi."
                    : locale === "ru"
                      ? "Раздел обновится автоматически, когда арендаторы будут отправлять, завершать или отменять поездки."
                      : "This section will update automatically as renters request, complete, or cancel trips."
                }
              />
            )}
          </section>
        ))}
      </div>
    </DashboardShell>
  );
}
