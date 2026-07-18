"use client";

import { BookingPaymentStatus, BookingStatus } from "@prisma/client";
import { Banknote } from "lucide-react";

import { useLocale } from "@/components/providers";
import {
  getCashPaymentDisplayLabel,
  getCashPaymentDisplayState,
  getCashPaymentDisplayTone,
} from "@/lib/booking-payment-display";
import { cn } from "@/lib/utils";

/**
 * Cash-only payment indicator. The platform no longer accepts online payments,
 * so every booking is settled in cash at pickup. We render this instead of the
 * raw payment-status badge so "Paid" / "Refunded" never appears for cash trips.
 *
 * Booking status takes priority over the stored paymentStatus so cancelled or
 * rejected trips never continue to look like cash is still due.
 */
export function CashPaymentBadge({
  bookingStatus,
  paymentStatus,
}: {
  bookingStatus?: BookingStatus | "APPROVED" | "PENDING" | "CANCELED" | "EXPIRED" | null;
  paymentStatus?: BookingPaymentStatus | null;
}) {
  const { labels } = useLocale();
  const state = getCashPaymentDisplayState({ bookingStatus, paymentStatus });
  const tone = getCashPaymentDisplayTone(state);
  const badgeLabel = getCashPaymentDisplayLabel(labels, state);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.16em]",
        tone === "settled"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
          : tone === "pending"
            ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
            : "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
      )}
    >
      <Banknote className="h-3.5 w-3.5" />
      {badgeLabel}
    </span>
  );
}
