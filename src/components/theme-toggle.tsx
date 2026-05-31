"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

import { useLocale, useThemeMode } from "@/components/providers";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { labels } = useLocale();
  const { theme, setTheme } = useThemeMode();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="inline-flex h-11 w-[7.5rem] items-center justify-center rounded-full border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-950"
        aria-hidden="true"
      />
    );
  }

  const options = [
    { value: "light" as const, label: labels.light, icon: Sun },
    { value: "dark" as const, label: labels.dark, icon: Moon },
    { value: "system" as const, label: labels.system, icon: Monitor },
  ];

  return (
    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      {options.map((option) => {
        const Icon = option.icon;
        const active = theme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition",
              active
                ? "bg-slate-950 !text-white dark:bg-slate-100 dark:!text-slate-950"
                : "hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-50",
            )}
            title={`${labels.theme}: ${option.label}`}
            aria-label={`${labels.theme}: ${option.label}`}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
