"use client";

import { Globe } from "lucide-react";

import { useLocale } from "@/components/providers";

const LOCALE_CODES: Record<"en" | "uz" | "ru", string> = {
  en: "EN",
  uz: "UZ",
  ru: "RU",
};

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, labels } = useLocale();

  return (
    <label
      className={`inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900 ${className}`}
    >
      <Globe className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
      <span className="sr-only">{labels.language}</span>
      <select
        value={locale}
        onChange={(event) => void setLocale(event.target.value as typeof locale)}
        aria-label={labels.language}
        className="cursor-pointer appearance-none bg-transparent pr-1 uppercase tracking-wide outline-none"
      >
        <option value="en">{LOCALE_CODES.en}</option>
        <option value="uz">{LOCALE_CODES.uz}</option>
        <option value="ru">{LOCALE_CODES.ru}</option>
      </select>
    </label>
  );
}
