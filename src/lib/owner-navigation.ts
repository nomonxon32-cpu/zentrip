import type { Locale } from "@/lib/i18n-dictionary";
import { getDictionary } from "@/lib/i18n-dictionary";

export type OwnerNavKey = "overview" | "listings" | "bookings" | "earnings" | "kyc" | "settings";

function getSettingsLabel(locale: Locale) {
  if (locale === "uz") return "Sozlamalar";
  if (locale === "ru") return "Настройки";
  return "Settings";
}

export function getOwnerDashboardLinks(active: OwnerNavKey, locale: Locale) {
  const labels = getDictionary(locale);

  return [
    { label: labels.dashboard, href: "/dashboard/owner", active: active === "overview" },
    { label: labels.listings, href: "/dashboard/owner/listings", active: active === "listings" },
    { label: labels.bookingRequests, href: "/dashboard/owner/bookings", active: active === "bookings" },
    { label: labels.earnings, href: "/dashboard/owner/earnings", active: active === "earnings" },
    { label: labels.kyc, href: "/dashboard/kyc", active: active === "kyc" },
    { label: getSettingsLabel(locale), href: "/dashboard/settings", active: active === "settings" },
  ];
}
