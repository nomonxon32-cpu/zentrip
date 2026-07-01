"use client";

import { getBookingPayableTotal, getWaivedPlatformFee } from "@/lib/booking-finance";
import { useLocale } from "@/components/providers";
import { formatCurrency } from "@/lib/utils";

export function PriceBreakdown({
  days,
  dailyPrice,
  monthlyPrice,
  durationMonths,
  rentalAmount,
  serviceFee,
  depositAmount,
  deliveryFee = 0,
  totalAmount,
}: {
  days: number;
  dailyPrice: number;
  monthlyPrice?: number | null;
  durationMonths?: number | null;
  rentalAmount: number;
  serviceFee: number;
  depositAmount: number;
  deliveryFee?: number;
  totalAmount: number;
}) {
  const { locale, labels } = useLocale();
  const monthlyMode = Boolean(monthlyPrice && durationMonths);
  const waivedFee = getWaivedPlatformFee(serviceFee);
  const payableTotal = getBookingPayableTotal({
    rentalAmount,
    serviceFee,
    depositAmount,
    deliveryFee,
  });
  const rentalLineLabel = monthlyMode
    ? `${formatCurrency(monthlyPrice ?? dailyPrice)} x ${durationMonths} ${
        locale === "uz"
          ? "oy"
          : locale === "ru"
            ? durationMonths === 1
              ? "месяц"
              : "мес."
            : durationMonths === 1
              ? "month"
              : "months"
      }`
    : `${formatCurrency(dailyPrice)} x ${days} ${labels.daysLabel}`;

  return (
    <div className="surface-card space-y-4 rounded-[2rem] p-6 dark:bg-slate-900">
      <h3 className="text-lg font-black tracking-tight text-slate-950 dark:text-slate-50">{labels.priceBreakdown}</h3>
      <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
        <div className="flex items-center justify-between">
          <span>{rentalLineLabel}</span>
          <span className="font-semibold text-slate-950 dark:text-slate-50">{formatCurrency(rentalAmount)}</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-[70%]">
            <span>{labels.platformServiceFee}</span>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              {labels.platformFeeLaunchWaiverDescription}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
            <span className="font-semibold text-slate-400 line-through decoration-slate-400/90 dark:text-slate-500 dark:decoration-slate-500/90">
              {formatCurrency(waivedFee)}
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {labels.waivedForLaunch}
            </span>
          </div>
        </div>
        {deliveryFee > 0 ? (
          <div className="flex items-center justify-between">
            <span>{labels.deliveryFee}</span>
            <span className="font-semibold text-slate-950 dark:text-slate-50">{formatCurrency(deliveryFee)}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <span>{labels.refundableDepositHold}</span>
          <span className="font-semibold text-slate-950 dark:text-slate-50">{formatCurrency(depositAmount)}</span>
        </div>
      </div>
      <div className="border-t border-dashed border-slate-200 pt-4 dark:border-slate-800">
        <div className="flex items-center justify-between text-lg font-black tracking-tight text-slate-950 dark:text-slate-50">
          <span>{labels.totalPayable}</span>
          <span>{formatCurrency(payableTotal)}</span>
        </div>
      </div>
    </div>
  );
}
