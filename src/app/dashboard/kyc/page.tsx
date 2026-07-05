import type { ReactNode } from "react";
import { DocumentType, KycStatus, Role } from "@prisma/client";

import { BackButton } from "@/components/back-button";
import { KycForm } from "@/components/forms/kyc-form";
import { StatusBadge } from "@/components/status-badge";
import { requireMarketplaceUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentLocale, getDictionary, getDocumentTypeLabel } from "@/lib/i18n";
import {
  getDocumentGroupStatus,
  getOwnerOptionalDocumentState,
  identityDocumentTypes,
  renterDriverLicenseTypes,
} from "@/lib/kyc";

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
  const identityStatus = getDocumentGroupStatus(documents, identityDocumentTypes);
  const renterLicenseStatus =
    user.role === Role.RENTER ? getDocumentGroupStatus(documents, renterDriverLicenseTypes) : null;
  const ownerVehicleDocumentState =
    user.role === Role.OWNER ? getOwnerOptionalDocumentState(documents) : null;

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
            {user.role === Role.OWNER
              ? locale === "uz"
                ? "Egasi tasdig'i uchun shaxs hujjatingizni yuklang. Zarurat bo'lsa avtomobil ro'yxatdan o'tkazish hujjatini keyinroq qo'shishingiz mumkin."
                : locale === "ru"
                  ? "Загрузите документ, удостоверяющий личность, для проверки владельца. Документ о регистрации автомобиля можно добавить позже, если он понадобится."
                  : "Upload your identity document for owner verification. Vehicle registration can be added later if requested."
              : locale === "uz"
                ? "Avtomobil bron qilishingiz uchun shaxs hujjatingiz va haydovchilik guvohnomangizni yuklang."
                : locale === "ru"
                  ? "Загрузите документ, удостоверяющий личность, и водительское удостоверение, чтобы бронировать автомобили."
                  : "Upload your identity document and driver license so you can book vehicles."}
          </p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-black tracking-tight text-slate-950 dark:text-slate-50">{labels.currentStatus}</h2>
            <StatusBadge value={user.kycStatus} />
          </div>

          <div className="mt-5 space-y-3">
            <StatusRow
              label={locale === "uz" ? "Pasport yoki ID karta" : locale === "ru" ? "Паспорт или ID карта" : "Passport or ID card"}
              description={
                user.role === Role.OWNER
                  ? locale === "uz"
                    ? "Ega tasdig'i uchun talab qilinadi."
                    : locale === "ru"
                      ? "Требуется для подтверждения владельца."
                      : "Required for owner verification."
                  : locale === "uz"
                    ? "Bron qilish uchun talab qilinadi."
                    : locale === "ru"
                      ? "Требуется для бронирования."
                      : "Required before you can book."
              }
              badge={<StatusBadge value={identityStatus} />}
            />

            {user.role === Role.RENTER ? (
              <StatusRow
                label={getDocumentTypeLabel(locale, DocumentType.DRIVER_LICENSE)}
                description={
                  locale === "uz"
                    ? "Ijarachi tasdig'ini yakunlash uchun talab qilinadi."
                    : locale === "ru"
                      ? "Требуется для завершения проверки арендатора."
                      : "Required to complete renter verification."
                }
                badge={<StatusBadge value={renterLicenseStatus ?? KycStatus.NOT_SUBMITTED} />}
              />
            ) : null}

            {user.role === Role.OWNER ? (
              <StatusRow
                label={getDocumentTypeLabel(locale, DocumentType.VEHICLE_REGISTRATION, user.role)}
                description={
                  locale === "uz"
                    ? "Hozircha ixtiyoriy. Admin so'rasa keyinroq yuklashingiz mumkin."
                    : locale === "ru"
                      ? "Пока необязательно. Можно загрузить позже, если администратор попросит."
                      : "Optional for now. You can add it later if an admin requests it."
                }
                badge={<OptionalDocumentBadge locale={locale} value={ownerVehicleDocumentState ?? "NOT_UPLOADED"} />}
              />
            ) : null}
          </div>

          <div className="mt-6 space-y-3">
            {documents.length ? (
              documents.map((document) => (
                <div key={document.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950 dark:text-slate-50">
                        {getDocumentTypeLabel(locale, document.documentType, user.role)}
                      </p>
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
      <KycForm role={user.role} />
    </div>
  );
}

function StatusRow({
  label,
  description,
  badge,
}: {
  label: string;
  description: string;
  badge: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
      <div>
        <p className="font-semibold text-slate-950 dark:text-slate-50">{label}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <div>{badge}</div>
    </div>
  );
}

function OptionalDocumentBadge({
  locale,
  value,
}: {
  locale: "en" | "uz" | "ru";
  value: "UPLOADED" | "NOT_UPLOADED" | "PENDING" | "REJECTED";
}) {
  const label =
    value === "UPLOADED"
      ? locale === "uz"
        ? "Yuklangan"
        : locale === "ru"
          ? "Загружено"
          : "Uploaded"
      : value === "NOT_UPLOADED"
        ? locale === "uz"
          ? "Yuklanmagan"
          : locale === "ru"
            ? "Не загружено"
            : "Not uploaded"
        : value === "PENDING"
          ? locale === "uz"
            ? "Ko'rib chiqilmoqda"
            : locale === "ru"
              ? "На проверке"
              : "Pending"
          : locale === "uz"
            ? "Rad etilgan"
            : locale === "ru"
              ? "Отклонено"
              : "Rejected";

  const tone =
    value === "UPLOADED"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
      : value === "PENDING"
        ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
        : value === "REJECTED"
          ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300"
          : "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${tone}`}>
      {label}
    </span>
  );
}
