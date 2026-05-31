"use client";

import { useState } from "react";
import { Clock3, MapPin, Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { CITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  location?: string;
  city?: string;
  fromDate?: string;
  startDate?: string;
  untilDate?: string;
  endDate?: string;
  fromTime?: string;
  untilTime?: string;
  compact?: boolean;
  whereLabel?: string;
  wherePlaceholder?: string;
  fromDateLabel?: string;
  fromTimeLabel?: string;
  untilDateLabel?: string;
  untilTimeLabel?: string;
  searchLabel?: string;
};

export function SearchBar({
  location,
  city,
  fromDate,
  startDate,
  untilDate,
  endDate,
  fromTime = "",
  untilTime = "",
  compact = false,
  whereLabel = "Where",
  wherePlaceholder = "Airport, hotel, address, city",
  fromDateLabel = "From date",
  fromTimeLabel = "From time",
  untilDateLabel = "Until date",
  untilTimeLabel = "Until time",
  searchLabel = "Search",
}: SearchBarProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    location: location ?? city ?? "",
    fromDate: fromDate ?? startDate ?? "",
    fromTime,
    untilDate: untilDate ?? endDate ?? "",
    untilTime,
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        const params = new URLSearchParams();
        if (form.location.trim()) params.set("location", form.location.trim());
        if (form.fromDate) params.set("fromDate", form.fromDate);
        if (form.fromTime) params.set("fromTime", form.fromTime);
        if (form.untilDate) params.set("untilDate", form.untilDate);
        if (form.untilTime) params.set("untilTime", form.untilTime);

        const query = params.toString();
        router.push(query ? `/search?${query}` : "/search");
      }}
      className={cn(
        "grid gap-2 rounded-[1.8rem] border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/10 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/30",
        compact
          ? "w-full"
          : "w-full max-w-6xl md:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,0.8fr)_auto]",
      )}
    >
      <FieldShell
        label={whereLabel}
        icon={<MapPin className="h-4 w-4 text-sky-600" />}
        className="md:border-r md:border-slate-200 md:rounded-none md:border-y-0 md:border-l-0 dark:md:border-slate-800"
      >
        <input
          name="location"
          list="home-search-cities"
          value={form.location}
          onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
          placeholder={wherePlaceholder}
          className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        <datalist id="home-search-cities">
          {CITIES.map((cityOption) => (
            <option key={cityOption} value={cityOption} />
          ))}
        </datalist>
      </FieldShell>

      <FieldShell label={fromDateLabel} className="md:border-r md:border-slate-200 md:rounded-none md:border-y-0 md:border-l-0 dark:md:border-slate-800">
        <input
          name="fromDate"
          type="date"
          value={form.fromDate}
          onChange={(event) => setForm((current) => ({ ...current, fromDate: event.target.value }))}
          className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none dark:text-slate-100"
        />
      </FieldShell>

      <FieldShell
        label={fromTimeLabel}
        icon={<Clock3 className="h-4 w-4 text-slate-400" />}
        className="md:border-r md:border-slate-200 md:rounded-none md:border-y-0 md:border-l-0 dark:md:border-slate-800"
      >
        <input
          name="fromTime"
          type="time"
          value={form.fromTime}
          onChange={(event) => setForm((current) => ({ ...current, fromTime: event.target.value }))}
          className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none dark:text-slate-100"
        />
      </FieldShell>

      <FieldShell label={untilDateLabel} className="md:border-r md:border-slate-200 md:rounded-none md:border-y-0 md:border-l-0 dark:md:border-slate-800">
        <input
          name="untilDate"
          type="date"
          value={form.untilDate}
          onChange={(event) => setForm((current) => ({ ...current, untilDate: event.target.value }))}
          className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none dark:text-slate-100"
        />
      </FieldShell>

      <FieldShell label={untilTimeLabel} icon={<Clock3 className="h-4 w-4 text-slate-400" />}>
        <input
          name="untilTime"
          type="time"
          value={form.untilTime}
          onChange={(event) => setForm((current) => ({ ...current, untilTime: event.target.value }))}
          className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none dark:text-slate-100"
        />
      </FieldShell>

      <button
        type="submit"
        className="inline-flex min-h-[68px] w-full items-center justify-center gap-2 rounded-[1.2rem] bg-slate-950 px-5 py-4 text-sm font-semibold !text-white transition hover:bg-slate-800 hover:!text-white dark:bg-white dark:!text-slate-950 dark:hover:bg-slate-200 dark:hover:!text-slate-950 md:min-h-0 md:w-[68px] md:px-0"
      >
        <Search className="h-4 w-4" />
        <span className="md:hidden">{searchLabel}</span>
      </button>
    </form>
  );
}

function FieldShell({
  label,
  icon,
  className,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("flex min-h-[72px] flex-col justify-center rounded-[1.2rem] border border-slate-200 px-4 py-3 md:min-h-[68px] md:border-0 dark:border-slate-800", className)}>
      <span className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
        {label}
      </span>
      <span className="flex items-center gap-2">{icon}{children}</span>
    </label>
  );
}
