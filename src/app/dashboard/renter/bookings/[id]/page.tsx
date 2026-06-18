import { BookingStatus, Role } from "@prisma/client";
import { notFound } from "next/navigation";

import { BackButton } from "@/components/back-button";
import { CashPaymentBadge } from "@/components/cash-payment-badge";
import { MessageThread } from "@/components/message-thread";
import { PriceBreakdown } from "@/components/price-breakdown";
import { ReviewForm } from "@/components/forms/review-form";
import { DisputeForm } from "@/components/forms/dispute-form";
import { MessageForm } from "@/components/forms/message-form";
import { RenterBookingActions } from "@/components/dashboard/renter-booking-actions";
import { StatusBadge } from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";

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
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {booking.startDate.toDateString()} to {booking.endDate.toDateString()}
              </p>
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
          <p className="text-sm text-slate-500 dark:text-slate-400">{booking.owner.phone}</p>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            {labels.paymentMethodLabel}: {labels.cashPayment} · {labels.payAtPickup}
          </p>
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
