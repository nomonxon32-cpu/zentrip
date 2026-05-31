import Link from "next/link";

import { cn } from "@/lib/utils";

type QuickFilterChip = {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
};

export function QuickFilterChips({ items }: { items: QuickFilterChip[] }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="flex min-w-max gap-3">
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition",
              item.active
                ? "border-slate-950 bg-slate-950 !text-white hover:bg-slate-800 hover:!text-white dark:border-slate-100 dark:bg-slate-100 dark:!text-slate-950 dark:hover:bg-slate-200 dark:hover:!text-slate-950"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-50",
            )}
          >
            <span className="shrink-0">{item.icon}</span>
            <span className="whitespace-nowrap">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
