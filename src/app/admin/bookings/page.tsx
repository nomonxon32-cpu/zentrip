import { BookingPaymentStatus, BookingStatus, Role } from "@prisma/client";

import { AdminShell } from "@/components/admin/admin-shell";
import { CashPaymentBadge } from "@/components/cash-payment-badge";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
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
      <form className="surface-card grid gap-4 rounded-[2rem] p-5 dark:bg-slate-900 md:grid-cols-[1fr_1fr_auto]">
        <select name="status" defaultValue={status} className="input">
          <option value="">{labels.allBookingStatuses}</option>
          {Object.values(BookingStatus).map((option) => (
            <option key={option} value={option}>
              {getStatusLabel(locale, option)}
            </option>
          ))}
        </select>
        <select name="paymentStatus" defaultValue={paymentStatus} className="input">
          <option value="">{labels.allPaymentStatuses}</option>
          {Object.values(BookingPaymentStatus).map((option) => (
            <option key={option} value={option}>
              {getStatusLabel(locale, option)}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-primary rounded-2xl px-5 py-3 font-semibold transition">
          {labels.filter}
        </button>
      </form>

      <DataTable
        columns={[labels.vehicleDetails, labels.renter, labels.owner, labels.currentStatus, labels.paymentStatus, labels.totalPayable]}
        rows={bookings.map((booking) => [
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
            <p className="font-semibold text-slate-950 dark:text-slate-50">{formatCurrency(booking.totalAmount)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{labels.cashPayment}</p>
          </div>,
        ])}
      />
    </AdminShell>
  );
}
