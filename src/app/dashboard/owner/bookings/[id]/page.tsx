import { Role } from "@prisma/client";
import { notFound } from "next/navigation";

import { BackButton } from "@/components/back-button";
import { CashPaymentBadge } from "@/components/cash-payment-badge";
import { MessageThread } from "@/components/message-thread";
import { PriceBreakdown } from "@/components/price-breakdown";
import { DisputeForm } from "@/components/forms/dispute-form";
import { MessageForm } from "@/components/forms/message-form";
import { OwnerBookingActions } from "@/components/dashboard/owner-booking-actions";
import { StatusBadge } from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
import { getBookingPayableTotal } from "@/lib/booking-finance";
import { getCashPaymentDisplayLabel, getCashPaymentDisplayState } from "@/lib/booking-payment-display";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";
import { getOwnerBookingById } from "@/lib/owner-bookings";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OwnerBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [user, locale] = await Promise.all([requireRole(Role.OWNER), getCurrentLocale()]);
  const labels = getDictionary(locale);
  const { id } = await params;
  const booking = await getOwnerBookingById(user.id, id);

  if (!booking) {
    notFound();
  }

  const driverLicense = booking.renter.kycDocuments[0] ?? null;
  const vehicleCover = booking.vehicle.photos[0]?.url;
  const payableTotal = getBookingPayableTotal(booking);
  const cashPaymentState = getCashPaymentDisplayState({
    bookingStatus: booking.status,
    paymentStatus: booking.paymentStatus,
  });
  const cashPaymentLabel = getCashPaymentDisplayLabel(labels, cashPaymentState);
  const paymentMethodDescription =
    cashPaymentState === "NO_PAYMENT_DUE"
      ? labels.noPaymentDue
      : cashPaymentState === "CASH_PAYMENT_STATUS_UNKNOWN"
        ? labels.cashPaymentStatusUnknown
        : cashPaymentState === "CASH_AFTER_APPROVAL"
          ? labels.cashPaymentAfterApproval
          : cashPaymentState === "PAID_IN_CASH"
            ? labels.paidInCash
            : labels.payAtPickupDetail;

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-8 lg:px-8">
      <section className="min-w-0 space-y-6">
        <div>
          <BackButton fallbackHref="/dashboard/owner/bookings" label={labels.backToBookingRequests} />
        </div>
        <div className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">Booking request</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">
                {booking.vehicle.make} {booking.vehicle.model} {booking.vehicle.year}
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {formatDate(booking.startDate)} to {formatDate(booking.endDate)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge value={booking.status} />
              <CashPaymentBadge bookingStatus={booking.status} paymentStatus={booking.paymentStatus} />
            </div>
          </div>
          <div className="mt-6 grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2 xl:grid-cols-4">
            <Info label="Renter" value={booking.renter.name} />
            <Info label="Dates" value={`${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}`} />
            <Info label="Days" value={`${booking.days} days`} />
            <Info label="Total payable" value={formatCurrency(payableTotal)} />
          </div>
          {booking.cancellationReason ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300">
              <p className="font-semibold">Decision note</p>
              <p className="mt-2">{booking.cancellationReason}</p>
            </div>
          ) : null}
          <div className="mt-6">
            <OwnerBookingActions bookingId={booking.id} status={booking.status} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
            <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">Vehicle</h2>
            <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
              {vehicleCover ? (
                <img
                  src={vehicleCover}
                  alt={`${booking.vehicle.make} ${booking.vehicle.model}`}
                  className="h-56 w-full object-cover"
                />
              ) : (
                <div className="flex h-56 items-center justify-center text-sm font-semibold text-slate-500 dark:text-slate-400">
                  No vehicle photo
                </div>
              )}
            </div>
            <div className="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
              <Info label="Vehicle" value={`${booking.vehicle.make} ${booking.vehicle.model}`} />
              <Info label="Year" value={String(booking.vehicle.year)} />
              <Info label="City" value={booking.vehicle.city} />
              <Info label="Plate" value={booking.vehicle.plateNumber} />
            </div>
            <div className="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
              <Info label={labels.pickupLocation} value={booking.pickupLocation?.trim() || booking.vehicle.address} />
              <Info label={labels.ownerContact} value={`${booking.owner.name} · ${booking.owner.phone}`} />
            </div>
            {booking.vehicle.pickupInstructions ? (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <p className="font-semibold text-slate-950 dark:text-slate-50">{labels.pickupInstructionsLabel}</p>
                <p className="mt-2 leading-6">{booking.vehicle.pickupInstructions}</p>
              </div>
            ) : null}
            {booking.pickupNotes ? (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <p className="font-semibold text-slate-950 dark:text-slate-50">{labels.handoverNotes}</p>
                <p className="mt-2 leading-6">{booking.pickupNotes}</p>
              </div>
            ) : null}
          </div>

          <PriceBreakdown
            days={booking.days}
            dailyPrice={booking.dailyPrice}
            rentalAmount={booking.rentalAmount}
            serviceFee={booking.serviceFee}
            depositAmount={booking.depositAmount}
            deliveryFee={booking.deliveryFee}
            totalAmount={booking.totalAmount}
          />
        </div>

        <MessageThread
          messages={booking.messages}
          currentUserId={user.id}
          composer={<MessageForm receiverId={booking.renterId} bookingId={booking.id} />}
        />
      </section>

      <aside className="min-w-0 space-y-6">
        <div className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
          <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">Renter details</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
            <Info label="Full name" value={booking.renter.name} />
            <Info label="Email" value={booking.renter.email} />
            <Info label="Phone" value={booking.renter.phone} />
            <Info label="City" value={booking.renter.city} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <div>
              <StatusBadge value={booking.renter.kycStatus} />
            </div>
            <div>
              <CashPaymentBadge bookingStatus={booking.status} paymentStatus={booking.paymentStatus} />
            </div>
          </div>
        </div>

        <div className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">Driver license</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Visible only to the vehicle owner on this booking and admins handling verification.
              </p>
            </div>
            {driverLicense ? <StatusBadge value={driverLicense.status} /> : null}
          </div>
          {driverLicense ? (
            <div className="mt-5 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="theme-label mb-2 text-sm font-semibold">Front image</p>
                  <img
                    src={driverLicense.frontImageUrl}
                    alt={`${booking.renter.name} driver license front`}
                    className="h-48 w-full rounded-2xl object-cover"
                  />
                </div>
                {driverLicense.backImageUrl ? (
                  <div>
                    <p className="theme-label mb-2 text-sm font-semibold">Back image</p>
                    <img
                      src={driverLicense.backImageUrl}
                      alt={`${booking.renter.name} driver license back`}
                      className="h-48 w-full rounded-2xl object-cover"
                    />
                  </div>
                ) : (
                  <div className="surface-dashed rounded-2xl p-6 text-sm">
                    No back-side image uploaded
                  </div>
                )}
              </div>
              {driverLicense.rejectionReason ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  <p className="font-semibold">Verification note</p>
                  <p className="mt-2">{driverLicense.rejectionReason}</p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="surface-dashed mt-5 rounded-2xl p-6 text-sm">
              No driver license uploaded
            </div>
          )}
        </div>

        <div className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
          <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">{labels.paymentMethodLabel}</h2>
          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-slate-800">
            <div>
              <p className="font-semibold text-slate-950 dark:text-slate-50">{labels.cashPayment}</p>
              <p className="mt-1 text-slate-500 dark:text-slate-400">{paymentMethodDescription}</p>
            </div>
            <CashPaymentBadge bookingStatus={booking.status} paymentStatus={booking.paymentStatus} />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
            {labels.totalPayable}: {formatCurrency(payableTotal)}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            {cashPaymentLabel}
          </p>
        </div>

        <DisputeForm bookingId={booking.id} />
      </aside>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-2 font-semibold text-slate-950 dark:text-slate-50">{value}</p>
    </div>
  );
}
