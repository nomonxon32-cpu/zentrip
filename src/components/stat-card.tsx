import { formatCurrency } from "@/lib/utils";

export function StatCard({
  label,
  value,
  accent = "sky",
  formatAsCurrency = false,
}: {
  label: string;
  value: number | string;
  accent?: "sky" | "emerald" | "slate";
  formatAsCurrency?: boolean;
}) {
  const accentClass =
    accent === "emerald"
      ? "from-emerald-500/10 to-emerald-50 dark:to-slate-900"
      : accent === "slate"
        ? "from-slate-500/10 to-slate-50 dark:to-slate-900"
        : "from-sky-500/10 to-sky-50 dark:to-slate-900";

  return (
    <div className={`rounded-[2rem] border border-slate-200 bg-gradient-to-br ${accentClass} p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900`}>
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">
        {typeof value === "number" && formatAsCurrency ? formatCurrency(value) : value}
      </p>
    </div>
  );
}
