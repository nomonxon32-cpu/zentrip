import type { Locale } from "@/lib/i18n-dictionary";
import { getDictionary } from "@/lib/i18n-dictionary";

export type OwnerNavKey = "overview" | "listings" | "bookings" | "earnings" | "kyc";

export function getOwnerDashboardLinks(active: OwnerNavKey, locale: Locale) {
  const labels = getDictionary(locale);

  return [
    { label: labels.overview, href: "/dashboard/owner", active: active === "overview" },
    { label: labels.myListings, href: "/dashboard/owner/listings", active: active === "listings" },
    { label: labels.bookingRequests, href: "/dashboard/owner/bookings", active: active === "bookings" },
    { label: labels.earnings, href: "/dashboard/owner/earnings", active: active === "earnings" },
    { label: labels.kyc, href: "/dashboard/kyc", active: active === "kyc" },
  ];
}
