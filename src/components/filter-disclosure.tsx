"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Mobile-friendly wrapper for the search filter panel. On small screens the
 * filters collapse behind a toggle button so results are visible immediately;
 * on large screens (lg+) the panel is always shown as a sidebar.
 */
export function FilterDisclosure({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 lg:hidden dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
      >
        <SlidersHorizontal className="h-4 w-4" />
        {label}
      </button>
      <div className={cn("mt-4 lg:mt-0 lg:block", open ? "block" : "hidden")}>{children}</div>
    </div>
  );
}
