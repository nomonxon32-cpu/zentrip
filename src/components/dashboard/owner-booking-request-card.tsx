"use client";

import Link from "next/link";
import { BookingStatus } from "@prisma/client";

import { CashPaymentBadge } from "@/components/cash-payment-badge";
import { OwnerBookingActions } from "@/components/dashboard/owner-booking-actions";
import { useLocale } from "@/components/providers";
import { StatusBadge } from "@/components/status-badge";
import { getStatusLabel } from "@/lib/i18n-dictionary";
import type { OwnerBookingListRecord } from "@/lib/owner-bookings";
import { formatCurrency, formatDate } from "@/lib/utils";

export function OwnerBookingRequestCard({
  booking,
  compact = false,
}: {
  booking: OwnerBookingListRecord;
  compact?: boolean;
}) {
  const { locale, labels } = useLocale();
  const cover = booking.vehicle.photos[0]?.url;
  const dateRange = `${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}`;
  const paymentSettled =
    booking.status === BookingStatus.ACTIVE || booking.status === BookingStatus.COMPLETED;

  if (compact) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          {cover ? (
            <img
              src={cover}
              alt={`${booking.vehicle.make} ${booking.vehicle.model}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-4 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
              {labels.noPhotosUploaded}
            </div>
          )}
        </div>

        <div className="mt-4 min-w-0 space-y-3">
          <h3 className="truncate text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">
            {booking.vehicle.make} {booking.vehicle.model}
          </h3>

          <div className="space-y-2 text-sm">
            <InfoRow label={labels.renter} value={booking.renter.name} />
            <InfoRow label={labels.dates} value={dateRange} />
            <InfoRow label={labels.totalPayable} value={formatCurrency(booking.totalAmount)} />
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge value={booking.status} />
            <CashPaymentBadge settled={paymentSettled} />
          </div>

          <Link
            href={`/dashboard/owner/bookings/${booking.id}`}
            className="btn-primary inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition"
          >
            {labels.viewRequest}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="grid gap-5 md:grid-cols-[220px_1fr] md:items-start">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
          {cover ? (
            <img
              src={cover}
              alt={`${booking.vehicle.make} ${booking.vehicle.model}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-4 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
              {labels.noPhotosUploaded}
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-600">
                {booking.status === BookingStatus.PENDING_OWNER_APPROVAL ? labels.bookingRequests : labels.bookings}
              </p>
              <h3 className="mt-2 truncate text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50">
                {booking.vehicle.make} {booking.vehicle.model}
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {booking.vehicle.year} / {booking.vehicle.city}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge value={booking.status} />
              <CashPaymentBadge settled={paymentSettled} />
            </div>
          </div>

          <div className="grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
            <Info label={labels.renter} value={booking.renter.name} />
            <Info label={labels.fromDate} value={formatDate(booking.startDate)} />
            <Info label={labels.untilDate} value={formatDate(booking.endDate)} />
            <Info label={labels.daysLabel} value={`${booking.days} ${labels.daysLabel}`} />
            <Info label={labels.totalPayable} value={formatCurrency(booking.totalAmount)} />
          </div>

          <div className="grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2 xl:grid-cols-4">
            <Info label={labels.kycStatus} value={getStatusLabel(locale, booking.renter.kycStatus)} />
            <Info label={labels.paymentStatus} value={getStatusLabel(locale, booking.paymentStatus)} />
            <Info label={labels.email} value={booking.renter.email} />
            <Info label={labels.phone} value={booking.renter.phone} />
            <Info label={labels.city} value={booking.renter.city || labels.any} />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/dashboard/owner/bookings/${booking.id}`}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900 dark:hover:text-slate-50"
            >
              {labels.viewRequest}
            </Link>
            {booking.status === BookingStatus.PENDING_OWNER_APPROVAL ? (
              <OwnerBookingActions bookingId={booking.id} status={booking.status} compact={compact} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-2 break-words font-semibold text-slate-950 dark:text-slate-50">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
      <span className="shrink-0 text-slate-500 dark:text-slate-400">{label}</span>
      <span className="min-w-0 text-right font-semibold text-slate-950 dark:text-slate-50">{value}</span>
    </div>
  );
}
