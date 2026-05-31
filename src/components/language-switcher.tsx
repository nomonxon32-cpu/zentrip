"use client";

import { Globe } from "lucide-react";

import { useLocale } from "@/components/providers";

export function LanguageSwitcher() {
  const { locale, setLocale, labels } = useLocale();

  return (
    <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 dark:text-slate-200">
      <Globe className="h-4 w-4 text-sky-600" />
      <span className="hidden sm:inline">{labels.language}</span>
      <select
        value={locale}
        onChange={(event) => void setLocale(event.target.value as typeof locale)}
        className="bg-transparent outline-none"
      >
        <option value="en">{labels.languageEnglish}</option>
        <option value="uz">{labels.languageUzbek}</option>
        <option value="ru">{labels.languageRussian}</option>
      </select>
    </label>
  );
}
