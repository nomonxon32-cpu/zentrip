import { BookingStatus, Role } from "@prisma/client";
import { notFound } from "next/navigation";

import { BackButton } from "@/components/back-button";
import { CashPaymentBadge } from "@/components/cash-payment-badge";
import { MessageThread } from "@/components/message-thread";
import { PriceBreakdown } from "@/components/price-breakdown";
import { DisputeForm } from "@/components/forms/dispute-form";
import { MessageForm } from "@/components/forms/message-form";
import { ReviewForm } from "@/components/forms/review-form";
import { RenterBookingActions } from "@/components/dashboard/renter-booking-actions";
import { StatusBadge } from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
import { isSensitiveBookingDetailsVisible } from "@/lib/booking-visibility";
import { db } from "@/lib/db";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function RenterBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [user, locale] = await Promise.all([requireRole(Role.RENTER), getCurrentLocale()]);
  const labels = getDictionary(locale);
  const { id } = await params;
  const booking = await db.booking.findUnique({
    where: { id },
    include: {
      vehicle: {
        include: {
          photos: {
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
        },
      },
      owner: true,
      payments: true,
      messages: {
        include: {
          sender: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      disputes: {
        orderBy: { createdAt: "desc" },
      },
      reviews: true,
    },
  });

  if (!booking || booking.renterId !== user.id) {
    notFound();
  }

  const canRevealPickupDetails = isSensitiveBookingDetailsVisible(booking.status);
  const tripWindow =
    booking.startTime && booking.endTime
      ? `${formatDate(booking.startDate)} · ${booking.startTime} - ${booking.endTime}`
      : `${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}`;
  const pickupAddress = booking.pickupLocation?.trim() || booking.vehicle.address;

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
      <section className="space-y-6">
        <div>
          <BackButton fallbackHref="/dashboard/renter" label={labels.backToBookings} />
        </div>

        <div className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">Booking</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">
                {booking.vehicle.make} {booking.vehicle.model}
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{tripWindow}</p>
            </div>
            <StatusBadge value={booking.status} />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <CashPaymentBadge
              settled={
                booking.status === BookingStatus.ACTIVE || booking.status === BookingStatus.COMPLETED
              }
            />
            <RenterBookingActions bookingId={booking.id} status={booking.status} />
          </div>
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

        <MessageThread
          messages={booking.messages}
          currentUserId={user.id}
          composer={<MessageForm receiverId={booking.ownerId} bookingId={booking.id} />}
        />
      </section>

      <aside className="space-y-6">
        <div className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
          <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">Owner</h2>
          <p className="mt-4 font-semibold text-slate-950 dark:text-slate-50">{booking.owner.name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{booking.owner.city}</p>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            {canRevealPickupDetails ? booking.owner.phone : labels.pickupDetailsAfterApproval}
          </p>
        </div>

        <div className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
          <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">{labels.pickupDetails}</h2>
          {canRevealPickupDetails ? (
            <div className="mt-4 space-y-3">
              <DetailRow label={labels.pickupLocation} value={pickupAddress} />
              <DetailRow label={labels.plate} value={booking.vehicle.plateNumber} />
              <DetailRow label={labels.ownerContact} value={`${booking.owner.name} · ${booking.owner.phone}`} />
              <DetailRow label={labels.timeWindow} value={tripWindow} />
              <DetailRow label={labels.paymentMethodLabel} value={`${labels.cashPayment} · ${labels.payAtPickup}`} />
              <DetailRow label={labels.depositDueAtPickup} value={formatCurrency(booking.depositAmount)} />

              {booking.vehicle.pickupInstructions ? (
                <NoteBlock title={labels.pickupInstructionsLabel} body={booking.vehicle.pickupInstructions} />
              ) : null}

              {booking.pickupNotes ? (
                <NoteBlock title={labels.handoverNotes} body={booking.pickupNotes} />
              ) : null}

              {booking.returnNotes ? (
                <NoteBlock title={labels.handoverNotes} body={booking.returnNotes} />
              ) : null}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              {labels.pickupDetailsAfterApproval}
            </div>
          )}
        </div>

        {booking.status === BookingStatus.COMPLETED && !booking.reviews.length ? (
          <ReviewForm bookingId={booking.id} vehicleId={booking.vehicleId} receiverId={booking.ownerId} />
        ) : null}

        <DisputeForm bookingId={booking.id} />

        {booking.disputes.length ? (
          <div className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
            <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">Existing disputes</h2>
            <div className="mt-4 space-y-3">
              {booking.disputes.map((dispute) => (
                <div key={dispute.id} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                  <p className="font-semibold text-slate-950 dark:text-slate-50">{dispute.reason}</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{dispute.description}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{dispute.status}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
      <span className="shrink-0 text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <span className="min-w-0 text-right text-sm font-semibold text-slate-950 dark:text-slate-50">{value}</span>
    </div>
  );
}

function NoteBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p>
    </div>
  );
}
