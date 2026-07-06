import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal-document";
import { getCurrentLocale } from "@/lib/i18n";
import { getTermsOfUseContent } from "@/lib/legal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Terms of Use | Zentrip",
};

export default async function TermsOfUsePage() {
  const locale = await getCurrentLocale();
  const content = getTermsOfUseContent(locale);

  return <LegalDocument content={content} />;
}
