"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  addMonths,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isAfter,
  isBefore,
  isSameDay,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type RangeState = {
  from?: Date;
  to?: Date;
};

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function DateRangePicker({
  disabledRanges = [],
  initialStartDate,
  initialEndDate,
  onChange,
}: {
  disabledRanges?: Array<{ from: Date; to: Date }>;
  initialStartDate?: string;
  initialEndDate?: string;
  onChange?: (value: { startDate?: string; endDate?: string }) => void;
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const initialFrom = useMemo(() => parseDateValue(initialStartDate), [initialStartDate]);
  const initialTo = useMemo(() => parseDateValue(initialEndDate), [initialEndDate]);

  const [range, setRange] = useState<RangeState>({
    from: initialFrom,
    to: initialTo,
  });
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(initialFrom ?? today));

  // Keep the latest onChange in a ref so the effect below only re-runs when the
  // selected range actually changes. Depending on `onChange` directly would loop
  // forever whenever a parent passes an inline callback (e.g. the checkout form).
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    onChangeRef.current?.({
      startDate: range.from ? format(range.from, "yyyy-MM-dd") : undefined,
      endDate: range.to ? format(range.to, "yyyy-MM-dd") : undefined,
    });
  }, [range]);

  const monthDays = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
      }),
    [currentMonth],
  );

  const leadingEmptyDays = useMemo(() => Array.from({ length: getDay(startOfMonth(currentMonth)) }), [currentMonth]);

  function isBlocked(date: Date) {
    const normalized = startOfDay(date);

    if (isBefore(normalized, today)) {
      return true;
    }

    if (
      range.from &&
      !range.to &&
      isAfter(normalized, range.from) &&
      differenceInCalendarDays(normalized, range.from) > 30
    ) {
      return true;
    }

    return disabledRanges.some((interval) =>
      isWithinInterval(normalized, {
        start: startOfDay(interval.from),
        end: startOfDay(interval.to),
      }),
    );
  }

  function hasBlockedDateBetween(start: Date, end: Date) {
    if (!isAfter(end, start)) {
      return false;
    }

    return eachDayOfInterval({ start, end }).some((day, index) => index > 0 && isBlocked(day));
  }

  function handleSelect(date: Date) {
    const normalized = startOfDay(date);
    if (isBlocked(normalized)) {
      return;
    }

    if (!range.from || range.to) {
      setRange({ from: normalized, to: undefined });
      return;
    }

    if (isSameDay(normalized, range.from)) {
      setRange({ from: normalized, to: undefined });
      return;
    }

    if (isBefore(normalized, range.from)) {
      setRange({ from: normalized, to: undefined });
      return;
    }

    if (hasBlockedDateBetween(range.from, normalized)) {
      setRange({ from: normalized, to: undefined });
      return;
    }

    setRange({ from: range.from, to: normalized });
  }

  return (
    <div className="surface-card w-full overflow-hidden rounded-[2rem] border p-3 sm:p-5 dark:bg-slate-900">
      <div className="rounded-3xl border border-slate-200 bg-white p-3 text-slate-950 sm:p-5 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setCurrentMonth((month) => subMonths(month, 1))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h3 className="text-base font-black tracking-tight text-slate-950 dark:text-slate-50">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <button
            type="button"
            onClick={() => setCurrentMonth((month) => addMonths(month, 1))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center sm:gap-2">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {label}
            </div>
          ))}

          {leadingEmptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square w-full" />
          ))}

          {monthDays.map((date) => {
            const blocked = isBlocked(date);
            const isStart = !!range.from && isSameDay(date, range.from);
            const isEnd = !!range.to && isSameDay(date, range.to);
            const isSelectedEdge = isStart || isEnd;
            const isRangeMiddle =
              !!range.from &&
              !!range.to &&
              isAfter(date, range.from) &&
              isBefore(date, range.to);
            const isToday = isSameDay(date, today);

            return (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => handleSelect(date)}
                disabled={blocked}
                className={cn(
                  "flex aspect-square w-full items-center justify-center rounded-xl text-sm font-semibold transition",
                  blocked &&
                    "cursor-not-allowed bg-transparent text-slate-300 opacity-60 dark:bg-transparent dark:text-slate-600",
                  !blocked &&
                    !isSelectedEdge &&
                    !isRangeMiddle &&
                    "bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50",
                  isSelectedEdge && "bg-slate-950 text-white dark:bg-white dark:text-slate-950",
                  isRangeMiddle && "bg-slate-200 text-slate-950 dark:bg-slate-700 dark:text-slate-100",
                  isToday &&
                    !isSelectedEdge &&
                    !isRangeMiddle &&
                    "border border-slate-400 dark:border-slate-500",
                )}
              >
                {format(date, "d")}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600 dark:text-slate-400">
        <span>Selected:</span>
        <span className="font-semibold text-slate-950 dark:text-slate-50">
          {range.from ? format(range.from, "MMM dd, yyyy") : "Start"}
        </span>
        <span>to</span>
        <span className="font-semibold text-slate-950 dark:text-slate-50">
          {range.to ? format(range.to, "MMM dd, yyyy") : "End"}
        </span>
      </div>
    </div>
  );
}

function parseDateValue(value?: string) {
  if (!value) {
    return undefined;
  }

  return startOfDay(new Date(`${value}T00:00:00`));
}
