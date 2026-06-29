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

/**
 * Masks a vehicle plate number for public display. Keeps the leading region
 * code (e.g. "01") visible and hides the rest so the full plate is only ever
 * revealed to a renter after the owner approves a booking.
 */
export function maskPlateNumber(plate?: string | null) {
  const value = plate?.trim();
  if (!value) {
    return "•• ••• ••";
  }

  const region = value.slice(0, 2);
  return `${region} ••• ••`;
}

/**
 * Returns an approximate, privacy-safe location label for a listing. We expose
 * only the city plus (when present) the first address segment such as a
 * district, never the exact street address, before a booking is confirmed.
 */
export function approximateArea(city: string, address?: string | null) {
  const firstSegment = address?.split(",")[0]?.trim();
  if (firstSegment && firstSegment.toLowerCase() !== city.toLowerCase()) {
    // Avoid leaking precise data like house numbers from the first segment.
    const hasStreetNumber = /\d{1,4}/.test(firstSegment);
    if (!hasStreetNumber && firstSegment.length <= 28) {
      return `${firstSegment}, ${city}`;
    }
  }

  return city;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function absoluteUrl(path: string) {
  return new URL(path, getAppOrigin()).toString();
}

function getAppOrigin() {
  const nextPublicOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL);
  const nextAuthOrigin = normalizeOrigin(process.env.NEXTAUTH_URL);
  const vercelProductionOrigin = normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  const vercelRuntimeOrigin = normalizeOrigin(process.env.VERCEL_URL);

  const candidates =
    process.env.NODE_ENV === "production"
      ? [nextAuthOrigin, nextPublicOrigin, vercelProductionOrigin, vercelRuntimeOrigin].filter(
          (origin) => origin && !isLocalOrigin(origin),
        )
      : [nextPublicOrigin, nextAuthOrigin, vercelProductionOrigin, vercelRuntimeOrigin].filter(Boolean);

  return candidates[0] ?? "http://localhost:3000";
}

function normalizeOrigin(value?: string | null) {
  const source = value?.trim();
  if (!source) {
    return undefined;
  }

  const withProtocol = /^https?:\/\//i.test(source) ? source : `https://${source}`;

  try {
    return new URL(withProtocol).origin;
  } catch {
    return undefined;
  }
}

function isLocalOrigin(origin: string) {
  try {
    const hostname = new URL(origin).hostname.toLowerCase();
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}
