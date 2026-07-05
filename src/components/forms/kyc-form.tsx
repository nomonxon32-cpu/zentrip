"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { DocumentType, Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { UploadBox } from "@/components/upload-box";
import { useLocale } from "@/components/providers";
import { getDocumentTypeLabel } from "@/lib/i18n-dictionary";
import { kycUploadSchema } from "@/lib/validators";

type KycValues = z.infer<typeof kycUploadSchema>;

export function KycForm({ role }: { role: Role }) {
  const router = useRouter();
  const { locale, labels } = useLocale();
  const isOwner = role === Role.OWNER;
  const [identityType, setIdentityType] = useState<DocumentType>(DocumentType.PASSPORT);
  const [identityFront, setIdentityFront] = useState<string[]>([]);
  const [identityBack, setIdentityBack] = useState<string[]>([]);
  const [secondaryFront, setSecondaryFront] = useState<string[]>([]);
  const [secondaryBack, setSecondaryBack] = useState<string[]>([]);
  const [submittingSection, setSubmittingSection] = useState<"identity" | "secondary" | null>(null);

  const secondaryType = isOwner ? DocumentType.VEHICLE_REGISTRATION : DocumentType.DRIVER_LICENSE;

  async function submitDocument(
    section: "identity" | "secondary",
    values: KycValues,
    onSuccess: () => void,
  ) {
    const parsed = kycUploadSchema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? labels.actionFailed);
      return;
    }

    try {
      setSubmittingSection(section);
      const response = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? labels.actionFailed);
      }

      toast.success(labels.uploadDocuments);
      onSuccess();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : labels.actionFailed);
    } finally {
      setSubmittingSection(null);
    }
  }

  return (
    <div className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div>
        <h2 className="text-lg font-black tracking-tight text-slate-950 dark:text-slate-50">{labels.uploadDocuments}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {isOwner
            ? locale === "uz"
              ? "Ega sifatida tasdiqlanish uchun shaxs hujjatingizni yuklang. Zarurat tug'ilsa avtomobil ro'yxatdan o'tkazish hujjatini keyinroq qo'shishingiz mumkin."
              : locale === "ru"
                ? "Загрузите документ, удостоверяющий личность, для проверки владельца. Документ о регистрации автомобиля можно добавить позже, если его попросят."
                : "Upload your identity document for owner verification. Vehicle registration can be added later if requested."
            : locale === "uz"
              ? "Avtomobil bron qilishingiz uchun shaxs hujjatingiz va haydovchilik guvohnomangizni yuklang."
              : locale === "ru"
                ? "Загрузите документ, удостоверяющий личность, и водительское удостоверение, чтобы бронировать автомобили."
                : "Upload your identity document and driver license so you can book vehicles."}
        </p>
      </div>

      <KycSection
        title={locale === "uz" ? "Pasport yoki ID karta" : locale === "ru" ? "Паспорт или ID карта" : "Passport or ID card"}
        description={
          isOwner
            ? locale === "uz"
              ? "Bu hujjat egasi tasdig'i uchun majburiy."
              : locale === "ru"
                ? "Этот документ обязателен для подтверждения владельца."
                : "This document is required for owner verification."
            : locale === "uz"
              ? "Bu hujjat ijarachi tasdig'i uchun majburiy."
              : locale === "ru"
                ? "Этот документ обязателен для проверки арендатора."
                : "This document is required for renter verification."
        }
        badgeLabel={locale === "uz" ? "Majburiy" : locale === "ru" ? "Обязательно" : "Required"}
        badgeTone="required"
      >
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">{labels.documentType}</label>
          <select
            value={identityType}
            onChange={(event) => setIdentityType(event.target.value as DocumentType)}
            className="input"
          >
            <option value={DocumentType.PASSPORT}>{getDocumentTypeLabel(locale, DocumentType.PASSPORT)}</option>
            <option value={DocumentType.ID_CARD}>{getDocumentTypeLabel(locale, DocumentType.ID_CARD)}</option>
          </select>
        </div>

        <UploadBox
          label={locale === "uz" ? "Old tomoni" : locale === "ru" ? "Лицевая сторона" : "Front image"}
          folder="kyc"
          value={identityFront}
          onChange={setIdentityFront}
        />

        <UploadBox
          label={
            locale === "uz"
              ? "Orqa tomoni (ixtiyoriy)"
              : locale === "ru"
                ? "Оборотная сторона (необязательно)"
                : "Back image (optional)"
          }
          folder="kyc"
          value={identityBack}
          onChange={setIdentityBack}
        />

        <button
          type="button"
          disabled={submittingSection === "identity" || !identityFront[0]}
          onClick={() =>
            void submitDocument(
              "identity",
              {
                documentType: identityType,
                frontImageUrl: identityFront[0] ?? "",
                backImageUrl: identityBack[0] ?? null,
              },
              () => {
                setIdentityFront([]);
                setIdentityBack([]);
              },
            )
          }
          className="btn-primary w-full rounded-2xl px-5 py-3 font-semibold transition"
        >
          {submittingSection === "identity"
            ? labels.working
            : locale === "uz"
              ? "Shaxs hujjatini yuborish"
              : locale === "ru"
                ? "Отправить документ личности"
                : "Submit identity document"}
        </button>
      </KycSection>

      <KycSection
        title={getDocumentTypeLabel(locale, secondaryType, role)}
        description={
          isOwner
            ? locale === "uz"
              ? "Hozircha ixtiyoriy. Admin so'rasa avtomobil egalik yoki ro'yxatdan o'tkazish hujjatini qo'shishingiz mumkin."
              : locale === "ru"
                ? "Пока необязательно. Если администратор запросит, добавьте документ о собственности или регистрации автомобиля."
                : "Optional for now. Add your vehicle ownership or registration document if requested by an admin."
            : locale === "uz"
              ? "Bu hujjat ijarachi tasdig'i uchun majburiy."
              : locale === "ru"
                ? "Этот документ обязателен для проверки арендатора."
                : "This document is required for renter verification."
        }
        badgeLabel={
          isOwner
            ? locale === "uz"
              ? "Ixtiyoriy"
              : locale === "ru"
                ? "Необязательно"
                : "Optional"
            : locale === "uz"
              ? "Majburiy"
              : locale === "ru"
                ? "Обязательно"
                : "Required"
        }
        badgeTone={isOwner ? "optional" : "required"}
      >
        <UploadBox
          label={locale === "uz" ? "Old tomoni" : locale === "ru" ? "Лицевая сторона" : "Front image"}
          folder="kyc"
          value={secondaryFront}
          onChange={setSecondaryFront}
        />

        <UploadBox
          label={
            locale === "uz"
              ? "Orqa tomoni (ixtiyoriy)"
              : locale === "ru"
                ? "Оборотная сторона (необязательно)"
                : "Back image (optional)"
          }
          folder="kyc"
          value={secondaryBack}
          onChange={setSecondaryBack}
        />

        <button
          type="button"
          disabled={submittingSection === "secondary" || !secondaryFront[0]}
          onClick={() =>
            void submitDocument(
              "secondary",
              {
                documentType: secondaryType,
                frontImageUrl: secondaryFront[0] ?? "",
                backImageUrl: secondaryBack[0] ?? null,
              },
              () => {
                setSecondaryFront([]);
                setSecondaryBack([]);
              },
            )
          }
          className="btn-secondary w-full rounded-2xl px-5 py-3 font-semibold transition"
        >
          {submittingSection === "secondary"
            ? labels.working
            : isOwner
              ? locale === "uz"
                ? "Avtomobil hujjatini yuborish"
                : locale === "ru"
                  ? "Отправить документ на автомобиль"
                  : "Submit vehicle document"
              : locale === "uz"
                ? "Haydovchilik guvohnomasini yuborish"
                : locale === "ru"
                  ? "Отправить водительское удостоверение"
                  : "Submit driver license"}
        </button>
      </KycSection>
    </div>
  );
}

function KycSection({
  title,
  description,
  badgeLabel,
  badgeTone,
  children,
}: {
  title: string;
  description: string;
  badgeLabel: string;
  badgeTone: "required" | "optional";
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-black tracking-tight text-slate-950 dark:text-slate-50">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <span
          className={
            badgeTone === "required"
              ? "inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
              : "inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
          }
        >
          {badgeLabel}
        </span>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}
