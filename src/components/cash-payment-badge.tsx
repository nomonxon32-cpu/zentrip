"use client";

import { Banknote } from "lucide-react";

import { useLocale } from "@/components/providers";
import { cn } from "@/lib/utils";

/**
 * Cash-only payment indicator. The platform no longer accepts online payments,
 * so every booking is settled in cash at pickup. We render this instead of the
 * raw payment-status badge so "Paid" / "Refunded" never appears for cash trips.
 *
 * - `settled` (trip active or completed): shows "Cash payment".
 * - otherwise: shows "Pending cash payment".
 */
export function CashPaymentBadge({ settled = false }: { settled?: boolean }) {
  const { labels } = useLocale();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.16em]",
        settled
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
          : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
      )}
    >
      <Banknote className="h-3.5 w-3.5" />
      {settled ? labels.cashPayment : labels.pendingCashPayment}
    </span>
  );
}
