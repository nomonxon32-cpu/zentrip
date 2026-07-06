import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal-document";
import { getCurrentLocale } from "@/lib/i18n";
import { getPrivacyPolicyContent } from "@/lib/legal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy Policy | Zentrip",
};

export default async function PrivacyPolicyPage() {
  const locale = await getCurrentLocale();
  const content = getPrivacyPolicyContent(locale);

  return <LegalDocument content={content} />;
}
