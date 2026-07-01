import { BookingPaymentStatus, BookingStatus, Role } from "@prisma/client";

import { AdminShell } from "@/components/admin/admin-shell";
import { CashPaymentBadge } from "@/components/cash-payment-badge";
import { DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
import { getBookingPayableTotal } from "@/lib/booking-finance";
import { db } from "@/lib/db";
import { getCurrentLocale, getDictionary, getStatusLabel } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole(Role.ADMIN);
  const [params, locale] = await Promise.all([searchParams, getCurrentLocale()]);
  const labels = getDictionary(locale);
  const status = typeof params.status === "string" ? params.status : "";
  const paymentStatus = typeof params.paymentStatus === "string" ? params.paymentStatus : "";

  const bookings = await db.booking.findMany({
    where: {
      status: status ? (status as BookingStatus) : undefined,
      paymentStatus: paymentStatus ? (paymentStatus as BookingPaymentStatus) : undefined,
    },
    include: {
      renter: true,
      owner: true,
      vehicle: true,
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminShell
      currentPath="/admin/bookings"
      title={labels.bookings}
      description={labels.bookingsDescription}
    >
      <form className="surface-card grid gap-3 rounded-[2rem] p-5 dark:bg-slate-900 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_auto] sm:p-6">
        <select name="status" defaultValue={status} className="input sm:min-w-0">
          <option value="">{labels.allBookingStatuses}</option>
          {Object.values(BookingStatus).map((option) => (
            <option key={option} value={option}>
              {getStatusLabel(locale, option)}
            </option>
          ))}
        </select>
        <select name="paymentStatus" defaultValue={paymentStatus} className="input sm:min-w-0">
          <option value="">{labels.allPaymentStatuses}</option>
          {Object.values(BookingPaymentStatus).map((option) => (
            <option key={option} value={option}>
              {getStatusLabel(locale, option)}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-primary rounded-2xl px-5 py-3 font-semibold transition sm:col-span-2 xl:col-span-1">
          {labels.filter}
        </button>
      </form>

      {bookings.length ? (
        <>
          <div className="space-y-4 lg:hidden">
            {bookings.map((booking) => {
              const payableTotal = getBookingPayableTotal(booking);

              return (
                <div key={booking.id} className="surface-card rounded-[2rem] p-5 dark:bg-slate-900">
                  <div className="flex flex-col gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-950 dark:text-slate-50">
                        {booking.vehicle.make} {booking.vehicle.model}
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {booking.startDate.toDateString()} - {booking.endDate.toDateString()}
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

                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <InfoRow label={labels.renter} value={`${booking.renter.name} / ${booking.renter.email}`} />
                    <InfoRow label={labels.owner} value={`${booking.owner.name} / ${booking.owner.email}`} />
                    <InfoRow label={labels.paymentStatus} value={labels.cashPayment} />
                    <InfoRow label={labels.totalPayable} value={formatCurrency(payableTotal)} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden lg:block">
            <DataTable
              columns={[labels.vehicleDetails, labels.renter, labels.owner, labels.currentStatus, labels.paymentStatus, labels.totalPayable]}
              rows={bookings.map((booking) => {
                const payableTotal = getBookingPayableTotal(booking);

                return [
                  <div key={`${booking.id}-vehicle`} className="space-y-1">
                    <p className="font-semibold text-slate-950 dark:text-slate-50">
                      {booking.vehicle.make} {booking.vehicle.model}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{booking.startDate.toDateString()}</p>
                  </div>,
                  <div key={`${booking.id}-renter`}>
                    <p className="font-semibold text-slate-950 dark:text-slate-50">{booking.renter.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{booking.renter.email}</p>
                  </div>,
                  <div key={`${booking.id}-owner`}>
                    <p className="font-semibold text-slate-950 dark:text-slate-50">{booking.owner.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{booking.owner.email}</p>
                  </div>,
                  <StatusBadge key={`${booking.id}-status`} value={booking.status} />,
                  <CashPaymentBadge
                    key={`${booking.id}-payment-status`}
                    settled={
                      booking.status === BookingStatus.ACTIVE || booking.status === BookingStatus.COMPLETED
                    }
                  />,
                  <div key={`${booking.id}-amount`}>
                    <p className="font-semibold text-slate-950 dark:text-slate-50">{formatCurrency(payableTotal)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{labels.cashPayment}</p>
                  </div>,
                ];
              })}
            />
          </div>
        </>
      ) : (
        <EmptyState
          title={labels.noResults}
          description={
            locale === "uz"
              ? "Joriy holat yoki to'lov filtrlariga mos bronlar topilmadi."
              : locale === "ru"
                ? "По текущим фильтрам статуса или оплаты бронирования не найдены."
                : "No bookings matched the current status or payment filters."
          }
        />
      )}
    </AdminShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-2 break-words font-semibold text-slate-950 dark:text-slate-50">{value}</p>
    </div>
  );
}
