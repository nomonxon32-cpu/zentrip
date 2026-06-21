"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";

import { useLocale } from "@/components/providers";
import type { Locale } from "@/lib/i18n-dictionary";
import { cn } from "@/lib/utils";

const LANGUAGES: Array<{ value: Locale; code: string; label: string }> = [
  { value: "en", code: "EN", label: "English" },
  { value: "uz", code: "UZ", label: "O'zbekcha" },
  { value: "ru", code: "RU", label: "Русский" },
];

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, labels } = useLocale();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((language) => language.value === locale) ?? LANGUAGES[0];

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleSelect(next: Locale) {
    setOpen(false);
    if (next !== locale) {
      void setLocale(next);
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={labels.language}
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold shadow-sm transition",
          "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50",
          "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-slate-700 dark:hover:bg-slate-900",
          open && "border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900",
        )}
      >
        <Globe className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
        <span className="tracking-wide">{current.code}</span>
        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open ? (
      <div
        role="listbox"
        aria-label={labels.language}
        className={cn(
          "animate-dropdown absolute right-0 top-[calc(100%+0.5rem)] z-50 w-52 rounded-2xl border p-1.5 shadow-2xl",
          "border-slate-200/80 bg-white/90 shadow-slate-900/10 backdrop-blur-xl",
          "dark:border-white/10 dark:bg-slate-900/90 dark:shadow-black/40",
        )}
      >
        {LANGUAGES.map((language) => {
          const active = language.value === locale;
          return (
            <button
              key={language.value}
              type="button"
              role="option"
              aria-selected={active}
              onClick={() => handleSelect(language.value)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
                active
                  ? "bg-sky-50 text-slate-950 dark:bg-sky-500/10 dark:text-white"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-white/5 dark:hover:text-white",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold tracking-wide",
                  active
                    ? "bg-sky-600 text-white dark:bg-sky-500"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                )}
              >
                {language.code}
              </span>
              <span className="flex-1">{language.label}</span>
              {active ? <Check className="h-4 w-4 text-sky-600 dark:text-sky-400" /> : null}
            </button>
          );
        })}
      </div>
      ) : null}
    </div>
  );
}
