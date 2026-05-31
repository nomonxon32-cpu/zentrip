import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

import { CITIES, CURRENCY } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(amount) + ` ${CURRENCY}`;
}

export function formatDate(value: Date | string, pattern = "dd MMM yyyy") {
  return format(typeof value === "string" ? new Date(value) : value, pattern);
}

export function parseDateParam(value?: string | null) {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function normalizeCityParam(value?: string | null) {
  const source = value?.trim();
  if (!source) {
    return undefined;
  }

  const matchedCity = CITIES.find((city) => city.toLowerCase() === source.toLowerCase());
  return matchedCity ?? source;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function absoluteUrl(path: string) {
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return new URL(path, origin).toString();
}
