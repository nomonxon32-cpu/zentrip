import { cookies } from "next/headers";

import { LOCALE_COOKIE } from "@/lib/constants";
import {
  getCategoryLabel,
  getDictionary,
  getDocumentTypeLabel,
  getFeatureLabel,
  getFuelTypeLabel,
  getPaymentMethodLabel,
  getRoleLabel,
  getStatusLabel,
  getTransmissionLabel,
} from "@/lib/i18n-dictionary";
import type { Locale } from "@/lib/i18n-dictionary";

export { getDictionary };
export {
  getCategoryLabel,
  getDocumentTypeLabel,
  getFeatureLabel,
  getFuelTypeLabel,
  getPaymentMethodLabel,
  getRoleLabel,
  getStatusLabel,
  getTransmissionLabel,
};
export type { Locale };

export async function getCurrentLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get(LOCALE_COOKIE)?.value;

  if (locale === "uz" || locale === "ru" || locale === "en") {
    return locale;
  }

  return "en";
}
