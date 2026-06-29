"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookingType, PaymentMethod } from "@prisma/client";
import { addMonths, format } from "date-fns";
import { Banknote } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { DateRangePicker } from "@/components/date-range-picker";
import { PriceBreakdown } from "@/components/price-breakdown";
import { useLocale } from "@/components/providers";
import { monthlyDurationOptions } from "@/lib/constants";
import { calculateBookingPrice, calculateMonthlyBookingPrice, getVehicleMonthlyPrice } from "@/lib/pricing";
import { bookingSchema } from "@/lib/validators";

type CheckoutValues = z.input<typeof bookingSchema>;

export function CheckoutForm({
  vehicleId,
  dailyPrice,
  monthlyPrice,
  depositAmount,
  monthlyMode,
  deliveryAvailable,
  deliveryFee,
  airportPickupAvailable,
  pickupInstructions,
  pickupLocation,
  initialStartDate,
  initialEndDate,
  initialDurationMonths,
  initialStartTime,
  initialEndTime,
  disabledRanges,
}: {
  vehicleId: string;
  dailyPrice: number;
  monthlyPrice?: number | null;
  depositAmount: number;
  monthlyMode: boolean;
  deliveryAvailable: boolean;
  deliveryFee: number;
  airportPickupAvailable: boolean;
  pickupInstructions?: string;
  pickupLocation?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  initialDurationMonths?: number;
  initialStartTime?: string;
  initialEndTime?: string;
  disabledRanges: Array<{ from: Date; to: Date }>;
}) {
  const router = useRouter();
  const { locale, labels } = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      vehicleId,
      bookingType: monthlyMode ? BookingType.MONTHLY : BookingType.DAILY,
      durationMonths: monthlyMode ? initialDurationMonths ?? 1 : null,
      monthlyPrice: monthlyMode ? monthlyPrice ?? null : null,
      startDate: initialStartDate ?? "",
      endDate: initialEndDate ?? "",
      pickupLocation: pickupLocation ?? "",
      startTime: initialStartTime ?? "10:00",
      endTime: initialEndTime ?? "18:00",
      deliveryFee: deliveryAvailable ? deliveryFee : 0,
      paymentMethod: PaymentMethod.CASH,
      pickupNotes: "",
    },
  });

  const startDate = useWatch({ control, name: "startDate" });
  const endDate = useWatch({ control, name: "endDate" });
  const durationMonths = useWatch({ control, name: "durationMonths" }) ?? 1;
  const selectedPickupLocation = useWatch({ control, name: "pickupLocation" });
  const startTime = useWatch({ control, name: "startTime" });
  const endTime = useWatch({ control, name: "endTime" });

  const effectiveDeliveryFee = deliveryAvailable && selectedPickupLocation?.trim() ? deliveryFee : 0;
  const effectiveMonthlyPrice = useMemo(() => getVehicleMonthlyPrice(dailyPrice, monthlyPrice), [dailyPrice, monthlyPrice]);
  const computedMonthlyEndDate = useMemo(() => {
    if (!monthlyMode || !startDate) {
      return undefined;
    }

    return addMonths(new Date(`${startDate}T00:00:00`), durationMonths);
  }, [durationMonths, monthlyMode, startDate]);

  useEffect(() => {
    if (!monthlyMode) {
      return;
    }

    setValue("bookingType", BookingType.MONTHLY, { shouldValidate: false });
    setValue("monthlyPrice", effectiveMonthlyPrice, { shouldValidate: false });
    setValue("endDate", computedMonthlyEndDate ? format(computedMonthlyEndDate, "yyyy-MM-dd") : "", {
      shouldValidate: true,
    });
  }, [computedMonthlyEndDate, effectiveMonthlyPrice, monthlyMode, setValue]);

  const summary =
    monthlyMode && startDate && computedMonthlyEndDate
      ? calculateMonthlyBookingPrice({
          startDate: new Date(`${startDate}T00:00:00`),
          durationMonths,
          dailyPrice,
          monthlyPrice: effectiveMonthlyPrice,
          depositAmount,
          deliveryFee: effectiveDeliveryFee,
        })
      : startDate && endDate
        ? calculateBookingPrice({
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            dailyPrice,
            depositAmount,
            deliveryFee: effectiveDeliveryFee,
          })
        : null;

  const monthlyLabels =
    locale === "uz"
      ? {
          tripDatesHelp: "Olish sanasi va oylik davomiylikni tanlang. Qaytarish sanasi avtomatik hisoblanadi.",
          pickupDate: "Olish sanasi",
          duration: "Davomiylik",
          returnDate: "Qaytarish sanasi",
          months: "oy",
          monthlyPrice: "Oylik narx",
        }
      : locale === "ru"
        ? {
            tripDatesHelp: "Выберите дату получения и срок аренды в месяцах. Дата возврата рассчитывается автоматически.",
            pickupDate: "Дата получения",
            duration: "Срок",
            returnDate: "Дата возврата",
            months: "мес.",
            monthlyPrice: "Цена за месяц",
          }
        : {
            tripDatesHelp: "Choose a pick-up date and monthly duration. The return date is calculated automatically.",
            pickupDate: "Pick-up date",
            duration: "Duration",
            returnDate: "Return date",
            months: "months",
            monthlyPrice: "Monthly price",
          };

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        try {
          setIsSubmitting(true);
          const payload = monthlyMode
            ? {
                ...values,
                bookingType: BookingType.MONTHLY,
                durationMonths,
                monthlyPrice: effectiveMonthlyPrice,
                endDate: computedMonthlyEndDate ? format(computedMonthlyEndDate, "yyyy-MM-dd") : values.endDate,
              }
            : values;
          const response = await fetch("/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const payloadJson = (await response.json()) as { error?: string; bookingId?: string };
          if (!response.ok || !payloadJson.bookingId) {
            throw new Error(payloadJson.error ?? labels.bookingFailed);
          }

          toast.success(labels.bookingRequestSent);
          router.push(`/booking-confirmed/${payloadJson.bookingId}`);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : labels.bookingFailed);
        } finally {
          setIsSubmitting(false);
        }
      })}
      className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]"
    >
      <div className="min-w-0 space-y-6">
        <div className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
          <h3 className="text-lg font-black tracking-tight text-slate-950 dark:text-slate-50">{labels.tripDates}</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {monthlyMode
              ? monthlyLabels.tripDatesHelp
              : locale === "uz"
                ? "Band qilingan va bloklangan sanalar avtomatik o'chiriladi."
                : locale === "ru"
                  ? "Забронированные и заблокированные даты отключаются автоматически."
                  : "Booked and blocked dates are disabled automatically."}
          </p>
          <div className="mt-5">
            {monthlyMode ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {monthlyLabels.pickupDate}
                  </label>
                  <input {...register("startDate")} type="date" className="input" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {monthlyLabels.duration}
                  </label>
                  <select {...register("durationMonths", { valueAsNumber: true })} className="input">
                    {monthlyDurationOptions.map((months) => (
                      <option key={months} value={months}>
                        {months} {locale === "en" ? (months === 1 ? "month" : "months") : monthlyLabels.months}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-700 dark:bg-slate-950 sm:col-span-2">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{monthlyLabels.returnDate}</p>
                  <p className="mt-2 text-lg font-black tracking-tight text-slate-950 dark:text-slate-50">
                    {computedMonthlyEndDate ? format(computedMonthlyEndDate, "MMM dd, yyyy") : "--"}
                  </p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {monthlyLabels.monthlyPrice}: {effectiveMonthlyPrice.toLocaleString("en-US")} UZS/{locale === "en" ? "month" : monthlyLabels.months}
                  </p>
                </div>
              </div>
            ) : (
              <DateRangePicker
                disabledRanges={disabledRanges}
                initialStartDate={startDate}
                initialEndDate={endDate}
                onChange={({ startDate: nextStartDate, endDate: nextEndDate }) => {
                  setValue("startDate", nextStartDate ?? "", { shouldValidate: true });
                  setValue("endDate", nextEndDate ?? "", { shouldValidate: true });
                }}
              />
            )}
          </div>
          {errors.startDate ? <p className="mt-3 text-sm text-rose-600">{errors.startDate.message}</p> : null}
          {errors.endDate ? <p className="mt-2 text-sm text-rose-600">{errors.endDate.message}</p> : null}
          {errors.durationMonths ? <p className="mt-2 text-sm text-rose-600">{errors.durationMonths.message}</p> : null}
        </div>

        <div className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
          <h3 className="text-lg font-black tracking-tight text-slate-950 dark:text-slate-50">{labels.pickupDetails}</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">{labels.pickupLocation}</label>
              <input
                {...register("pickupLocation")}
                className="input"
                placeholder={labels.wherePlaceholder}
              />
            </div>
            {!monthlyMode ? (
              <>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">{labels.fromTime}</label>
                  <input {...register("startTime")} type="time" className="input" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">{labels.untilTime}</label>
                  <input {...register("endTime")} type="time" className="input" />
                </div>
              </>
            ) : null}
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-500 dark:text-slate-400">
            {airportPickupAvailable ? (
              <span className="rounded-full bg-sky-50 px-3 py-2 font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
                {labels.airportPickupAvailable}
              </span>
            ) : null}
            {deliveryAvailable ? (
              <span className="rounded-full bg-emerald-50 px-3 py-2 font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                {labels.deliveryAvailable}
                {deliveryFee > 0 ? ` ${locale === "uz" ? "dan boshlab" : locale === "ru" ? "от" : "from"} ${deliveryFee.toLocaleString("en-US")} UZS` : ""}
              </span>
            ) : null}
          </div>
          {pickupInstructions ? (
            <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">{pickupInstructions}</p>
          ) : null}
        </div>

        <div className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
          <h3 className="text-lg font-black tracking-tight text-slate-950 dark:text-slate-50">
            {labels.paymentMethodLabel}
          </h3>
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
              <Banknote className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-emerald-900 dark:text-emerald-200">{labels.cashPayment}</p>
              <p className="mt-1 text-sm leading-6 text-emerald-800/80 dark:text-emerald-300/80">
                {labels.payAtPickupDetail}
              </p>
            </div>
          </div>
          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              {locale === "uz" ? "Olish bo'yicha izohlar" : locale === "ru" ? "Примечания к получению" : "Pickup notes"}
            </label>
            <textarea
              {...register("pickupNotes")}
              rows={4}
              className="input min-h-28"
              placeholder={locale === "uz" ? "Ixtiyoriy izoh" : locale === "ru" ? "Необязательная заметка" : "Optional pickup notes"}
            />
          </div>
        </div>
      </div>

      <div className="min-w-0 space-y-6">
        {summary ? (
          <div className="space-y-6">
            <div className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
              <h3 className="text-lg font-black tracking-tight text-slate-950 dark:text-slate-50">{labels.tripSummary}</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <span>{labels.pickupLocation}</span>
                  <span className="font-semibold text-slate-950 dark:text-slate-50">
                    {selectedPickupLocation?.trim() ||
                      (locale === "uz" ? "E'lon shahri" : locale === "ru" ? "Город из объявления" : "Use listing city")}
                  </span>
                </div>
                <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <span>{labels.tripDates}</span>
                  <span className="font-semibold text-slate-950 dark:text-slate-50">
                    {monthlyMode
                      ? `${durationMonths} ${locale === "en" ? (durationMonths === 1 ? "month" : "months") : monthlyLabels.months}`
                      : `${startTime || "10:00"} / ${endTime || "18:00"}`}
                  </span>
                </div>
                {monthlyMode && computedMonthlyEndDate ? (
                  <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <span>{monthlyLabels.returnDate}</span>
                    <span className="font-semibold text-slate-950 dark:text-slate-50">
                      {format(computedMonthlyEndDate, "MMM dd, yyyy")}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
            <PriceBreakdown {...summary} />
          </div>
        ) : (
          <div className="surface-card rounded-[2rem] p-6 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            {locale === "uz"
              ? "To'liq narxni ko'rish uchun sanalarni tanlang."
              : locale === "ru"
                ? "Выберите даты, чтобы увидеть полную стоимость."
                : "Select dates to see the full pricing breakdown."}
          </div>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !summary}
          className="btn-primary w-full rounded-2xl px-5 py-3 font-semibold transition"
        >
          {isSubmitting ? labels.confirmingBooking : labels.confirmBooking}
        </button>
      </div>
    </form>
  );
}
