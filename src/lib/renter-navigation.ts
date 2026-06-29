import type { Locale } from "@/lib/i18n-dictionary";
import { getDictionary } from "@/lib/i18n-dictionary";

export type RenterNavKey = "overview" | "bookings" | "kyc" | "settings" | "browse";

function getTripsLabel(locale: Locale) {
  if (locale === "uz") return "Safarlar";
  if (locale === "ru") return "Поездки";
  return "Trips";
}

function getSettingsLabel(locale: Locale) {
  if (locale === "uz") return "Sozlamalar";
  if (locale === "ru") return "Настройки";
  return "Settings";
}

export function getRenterDashboardLinks(active: RenterNavKey, locale: Locale) {
  const labels = getDictionary(locale);

  return [
    { label: labels.browseCars, href: "/search", active: active === "browse" },
    { label: labels.myBookings, href: "/dashboard/renter/bookings", active: active === "bookings" },
    { label: getTripsLabel(locale), href: "/dashboard/renter", active: active === "overview" },
    { label: labels.kyc, href: "/dashboard/kyc", active: active === "kyc" },
    { label: getSettingsLabel(locale), href: "/dashboard/settings", active: active === "settings" },
  ];
}
