import { Role } from "@prisma/client";

import { AdminShell } from "@/components/admin/admin-shell";
import { KycReviewActions } from "@/components/admin/kyc-review-actions";
import { StatusBadge } from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentLocale, getDictionary, getDocumentTypeLabel } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AdminKycPage() {
  await requireRole(Role.ADMIN);
  const locale = await getCurrentLocale();
  const labels = getDictionary(locale);
  const documents = await db.kycDocument.findMany({
    where: {
      status: "PENDING",
    },
    include: {
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminShell
      currentPath="/admin/kyc"
      title={labels.kycModeration}
      description={labels.kycModerationDescription}
    >
      <div className="grid gap-6">
        {documents.length ? (
          documents.map((document) => (
            <div key={document.id} className="surface-card grid gap-6 rounded-[2rem] p-5 dark:bg-slate-900 sm:p-6 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-4">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-slate-50">{document.user.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{document.user.email}</p>
                  </div>
                  <StatusBadge value={document.status} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <PreviewCard url={document.frontImageUrl} pdfLabel={labels.pdfUploaded} />
                  {document.backImageUrl ? <PreviewCard url={document.backImageUrl} pdfLabel={labels.pdfUploaded} /> : null}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{labels.documentType}</p>
                  <p className="mt-2 text-lg font-black tracking-tight text-slate-950 dark:text-slate-50">
                    {getDocumentTypeLabel(locale, document.documentType, document.user.role)}
                  </p>
                </div>
                <KycReviewActions documentId={document.id} />
              </div>
            </div>
          ))
        ) : (
          <div className="surface-card rounded-[2rem] p-6 text-center dark:bg-slate-900 sm:p-10">
            <p className="text-sm text-slate-500 dark:text-slate-400">{labels.noPendingKyc}</p>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

function PreviewCard({ url, pdfLabel }: { url: string; pdfLabel: string }) {
  const isPdf = url.split("?")[0].toLowerCase().endsWith(".pdf");
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      {isPdf ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-52 items-center justify-center font-semibold text-sky-600 underline underline-offset-4 dark:text-sky-400"
        >
          {pdfLabel}
        </a>
      ) : (
        <div className="relative h-52">
          <img src={url} alt="KYC document" className="h-full w-full object-cover" />
        </div>
      )}
    </div>
  );
}
