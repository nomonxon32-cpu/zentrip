"use client";

import { useMemo, useState } from "react";
import { addMonths, format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookingType } from "@prisma/client";

import { DateRangePicker } from "@/components/date-range-picker";
import { PriceBreakdown } from "@/components/price-breakdown";
import { useLocale } from "@/components/providers";
import { monthlyDurationOptions } from "@/lib/constants";
import { calculateBookingPrice, calculateMonthlyBookingPrice, getVehicleMonthlyPrice } from "@/lib/pricing";

export function BookingCard({
  vehicleId,
  dailyPrice,
  monthlyPrice,
  depositAmount,
  disabledRanges,
  monthlyMode = false,
  initialDurationMonths = 1,
  initialStartDate,
  initialEndDate,
  initialStartTime,
  initialEndTime,
  initialLocation,
}: {
  vehicleId: string;
  dailyPrice: number;
  monthlyPrice?: number | null;
  depositAmount: number;
  disabledRanges: Array<{ from: Date; to: Date }>;
  monthlyMode?: boolean;
  initialDurationMonths?: number;
  initialStartDate?: string;
  initialEndDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  initialLocation?: string;
}) {
  const router = useRouter();
  const { locale, labels } = useLocale();
  const [dates, setDates] = useState<{ startDate?: string; endDate?: string }>({
    startDate: initialStartDate,
    endDate: initialEndDate,
  });
  const [pickupDate, setPickupDate] = useState(initialStartDate ?? "");
  const [durationMonths, setDurationMonths] = useState(initialDurationMonths);

  const monthlyEndDate = useMemo(() => {
    if (!pickupDate) {
      return undefined;
    }

    return addMonths(new Date(`${pickupDate}T00:00:00`), durationMonths);
  }, [durationMonths, pickupDate]);

  const summary = useMemo(() => {
    if (monthlyMode) {
      if (!pickupDate || !monthlyEndDate) {
        return null;
      }

      return calculateMonthlyBookingPrice({
        startDate: new Date(`${pickupDate}T00:00:00`),
        durationMonths,
        dailyPrice,
        monthlyPrice,
        depositAmount,
      });
    }

    if (!dates.startDate || !dates.endDate) {
      return null;
    }

    return calculateBookingPrice({
      startDate: new Date(dates.startDate),
      endDate: new Date(dates.endDate),
      dailyPrice,
      depositAmount,
    });
  }, [dailyPrice, dates.endDate, dates.startDate, depositAmount, durationMonths, monthlyEndDate, monthlyMode, monthlyPrice, pickupDate]);

  const monthlyLabels =
    locale === "uz"
      ? {
          title: "Oylik ijara",
          description: "Olish sanasi va davomiylikni tanlang.",
          pickupDate: "Olish sanasi",
          duration: "Davomiylik",
          returnDate: "Qaytarish sanasi",
          monthSuffix: "oy",
          action: "Oylik ijarani bron qilish",
        }
      : locale === "ru"
        ? {
            title: "Помесячная аренда",
            description: "Выберите дату получения и срок аренды.",
            pickupDate: "Дата получения",
            duration: "Срок",
            returnDate: "Дата возврата",
            monthSuffix: "мес.",
            action: "Забронировать помесячную аренду",
          }
        : {
            title: "Monthly rental",
            description: "Choose pick-up date and duration.",
            pickupDate: "Pick-up date",
            duration: "Duration",
            returnDate: "Return date",
            monthSuffix: "month",
            action: "Book monthly rental",
          };

  return (
    <div className="surface-card w-full overflow-hidden space-y-5 rounded-[2rem] p-6 dark:bg-slate-900">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Instant estimate</p>
          <p className="text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50">
            {monthlyMode ? monthlyLabels.title : "Book this car"}
          </p>
          {monthlyMode ? (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{monthlyLabels.description}</p>
          ) : null}
        </div>
      </div>
      {monthlyMode ? (
        <div className="surface-card space-y-4 rounded-[2rem] border p-5 dark:bg-slate-900">
          <div className="grid gap-4">
            <label className="space-y-2">
              <span className="theme-label text-sm font-semibold">{monthlyLabels.pickupDate}</span>
              <input
                type="date"
                value={pickupDate}
                onChange={(event) => setPickupDate(event.target.value)}
                className="input"
              />
            </label>
            <label className="space-y-2">
              <span className="theme-label text-sm font-semibold">{monthlyLabels.duration}</span>
              <select
                value={durationMonths}
                onChange={(event) => setDurationMonths(Number(event.target.value))}
                className="input"
              >
                {monthlyDurationOptions.map((months) => (
                  <option key={months} value={months}>
                    {months} {months === 1 ? monthlyLabels.monthSuffix : monthlyLabels.monthSuffix}
                  </option>
                ))}
              </select>
            </label>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-700 dark:bg-slate-950">
              <p className="theme-label text-sm font-semibold">{monthlyLabels.returnDate}</p>
              <p className="mt-2 text-lg font-black tracking-tight text-slate-950 dark:text-slate-50">
                {monthlyEndDate ? format(monthlyEndDate, "MMM dd, yyyy") : "--"}
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {getVehicleMonthlyPrice(dailyPrice, monthlyPrice).toLocaleString("en-US")} UZS/{monthlyLabels.monthSuffix}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <DateRangePicker
          disabledRanges={disabledRanges}
          initialStartDate={initialStartDate}
          initialEndDate={initialEndDate}
          onChange={setDates}
        />
      )}
      {summary ? <PriceBreakdown {...summary} /> : null}
      <button
        type="button"
        onClick={() => {
          const startDate = monthlyMode ? pickupDate : dates.startDate;
          const endDate = monthlyMode ? monthlyEndDate?.toISOString().slice(0, 10) : dates.endDate;
          if (!startDate || !endDate) {
            return;
          }
          const params = new URLSearchParams({
            fromDate: startDate,
            untilDate: endDate,
          });
          if (initialLocation) params.set("location", initialLocation);
          if (initialStartTime) params.set("fromTime", initialStartTime);
          if (initialEndTime) params.set("untilTime", initialEndTime);
          if (monthlyMode) {
            params.set("bookingType", BookingType.MONTHLY);
            params.set("durationMonths", String(durationMonths));
          }
          router.push(`/checkout/${vehicleId}?${params.toString()}`);
        }}
        disabled={!summary}
        className="btn-primary w-full rounded-2xl px-5 py-3 font-semibold transition"
      >
        {monthlyMode ? monthlyLabels.action : "Book now"}
      </button>
      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        {summary ? "Need owner details first? Message inside the booking after checkout." : "Select available travel dates to continue."}
      </p>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
        <p className="font-semibold">KYC approval is required before booking can be confirmed.</p>
        <Link href="/dashboard/kyc" className="mt-2 inline-flex text-sm font-semibold text-amber-900 underline underline-offset-4 transition hover:text-amber-700 dark:text-amber-200 dark:hover:text-amber-100">
          Complete KYC before booking
        </Link>
      </div>
    </div>
  );
}
