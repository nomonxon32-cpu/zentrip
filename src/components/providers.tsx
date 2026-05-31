"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "sonner";

import { dictionaries, type Locale } from "@/lib/i18n-dictionary";
import { THEME_STORAGE_KEY } from "@/lib/constants";

type Dictionary = (typeof dictionaries)[keyof typeof dictionaries];
type ThemeMode = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
  labels: Dictionary;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

type ThemeContextValue = {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

function getStoredThemeMode() {
  if (typeof window === "undefined") {
    return "system" as ThemeMode;
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isThemeMode(savedTheme) ? savedTheme : "system";
}

function resolveTheme(theme: ThemeMode) {
  if (theme === "system" && typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return theme === "dark" ? "dark" : "light";
}

export function Providers({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [theme, setThemeState] = useState<ThemeMode>(() => getStoredThemeMode());
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(getStoredThemeMode()));
  const router = useRouter();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const nextResolvedTheme = resolveTheme(theme);
      document.documentElement.classList.toggle("dark", nextResolvedTheme === "dark");
      document.documentElement.dataset.theme = nextResolvedTheme;
      setResolvedTheme(nextResolvedTheme);
    };

    applyTheme();
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    mediaQuery.addEventListener("change", applyTheme);

    return () => {
      mediaQuery.removeEventListener("change", applyTheme);
    };
  }, [theme]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      labels: dictionaries[locale],
      setLocale: async (nextLocale) => {
        setLocaleState(nextLocale);
        await fetch("/api/locale", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale: nextLocale }),
        });
        router.refresh();
      },
    }),
    [locale, router],
  );

  const themeValue = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme: setThemeState,
    }),
    [resolvedTheme, theme],
  );

  return (
    <ThemeContext.Provider value={themeValue}>
      <LocaleContext.Provider value={value}>
        {children}
        <Toaster position="top-right" richColors />
      </LocaleContext.Provider>
    </ThemeContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used inside Providers.");
  }

  return context;
}

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeMode must be used inside Providers.");
  }

  return context;
}
