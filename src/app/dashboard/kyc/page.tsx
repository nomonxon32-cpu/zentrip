import { Role } from "@prisma/client";

import { BackButton } from "@/components/back-button";
import { StatusBadge } from "@/components/status-badge";
import { KycForm } from "@/components/forms/kyc-form";
import { requireMarketplaceUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentLocale, getDictionary, getDocumentTypeLabel } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function KycPage() {
  const [user, locale] = await Promise.all([requireMarketplaceUser(), getCurrentLocale()]);
  const labels = getDictionary(locale);
  const documents = await db.kycDocument.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const kycFallbackHref =
    user.role === Role.OWNER ? "/dashboard/owner" : user.role === Role.ADMIN ? "/admin" : "/dashboard/renter";
  const kycBackLabel = user.role === Role.ADMIN ? labels.backToAdmin : labels.backToDashboard;

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <section className="space-y-6">
        <div>
          <BackButton fallbackHref={kycFallbackHref} label={kycBackLabel} />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">{labels.verification}</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">{labels.kycPageTitle}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {labels.kycPageDescription}
          </p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-black tracking-tight text-slate-950 dark:text-slate-50">{labels.currentStatus}</h2>
            <StatusBadge value={user.kycStatus} />
          </div>
          <div className="mt-5 space-y-3">
            {documents.length ? (
              documents.map((document) => (
                <div key={document.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950 dark:text-slate-50">{getDocumentTypeLabel(locale, document.documentType)}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{document.createdAt.toDateString()}</p>
                    </div>
                    <StatusBadge value={document.status} />
                  </div>
                  {document.rejectionReason ? (
                    <p className="mt-3 text-sm text-rose-600">{labels.rejectionReason}: {document.rejectionReason}</p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">{labels.noResults}</p>
            )}
          </div>
        </div>
      </section>
      <KycForm />
    </div>
  );
}
