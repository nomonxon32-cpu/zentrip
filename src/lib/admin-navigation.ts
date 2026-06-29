import type { Locale } from "@/lib/i18n-dictionary";
import { getDictionary } from "@/lib/i18n-dictionary";

export function getAdminNavigationLinks(locale: Locale) {
  const labels = getDictionary(locale);
  const kycReviews = locale === "uz" ? "KYC ko'rib chiqish" : locale === "ru" ? "Проверка KYC" : "KYC reviews";
  const analytics = locale === "uz" ? "Analitika" : locale === "ru" ? "Аналитика" : "Analytics";
  const settings = locale === "uz" ? "Sozlamalar" : locale === "ru" ? "Настройки" : "Settings";

  return [
    { href: "/admin", label: labels.overview },
    { href: "/admin/users", label: labels.users },
    { href: "/admin/listings", label: labels.listings },
    { href: "/admin/bookings", label: labels.bookings },
    { href: "/admin/kyc", label: kycReviews },
    { href: "/admin/analytics", label: analytics },
    { href: "/admin/settings", label: settings },
  ];
}
