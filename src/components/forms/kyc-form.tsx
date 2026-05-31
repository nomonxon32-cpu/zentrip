"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { DocumentType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { UploadBox } from "@/components/upload-box";
import { useLocale } from "@/components/providers";
import { getDocumentTypeLabel } from "@/lib/i18n-dictionary";
import { kycUploadSchema } from "@/lib/validators";

type KycValues = z.infer<typeof kycUploadSchema>;

export function KycForm() {
  const router = useRouter();
  const { locale, labels } = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<KycValues>({
    resolver: zodResolver(kycUploadSchema),
    defaultValues: {
      documentType: DocumentType.PASSPORT,
      frontImageUrl: "",
      backImageUrl: null,
    },
  });

  const frontImageUrl = useWatch({ control, name: "frontImageUrl" });
  const backImageUrl = useWatch({ control, name: "backImageUrl" });

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        try {
          setIsSubmitting(true);
          const response = await fetch("/api/kyc", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });
          const payload = (await response.json()) as { error?: string };
          if (!response.ok) {
            throw new Error(payload.error ?? labels.actionFailed);
          }

          toast.success(labels.uploadDocuments);
          router.refresh();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : labels.actionFailed);
        } finally {
          setIsSubmitting(false);
        }
      })}
      className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950"
    >
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">{labels.documentType}</label>
        <select {...register("documentType")} className="input">
          <option value={DocumentType.PASSPORT}>{getDocumentTypeLabel(locale, DocumentType.PASSPORT)}</option>
          <option value={DocumentType.ID_CARD}>{getDocumentTypeLabel(locale, DocumentType.ID_CARD)}</option>
          <option value={DocumentType.DRIVER_LICENSE}>{getDocumentTypeLabel(locale, DocumentType.DRIVER_LICENSE)}</option>
        </select>
        {errors.documentType ? <p className="theme-error mt-2 text-sm">{errors.documentType.message}</p> : null}
      </div>

      <UploadBox
        label={locale === "uz" ? "Old tomoni" : locale === "ru" ? "Лицевая сторона" : "Front image"}
        folder="kyc"
        value={frontImageUrl ? [frontImageUrl] : []}
        onChange={(urls) => setValue("frontImageUrl", urls[0] ?? "", { shouldValidate: true })}
      />
      {errors.frontImageUrl ? <p className="theme-error -mt-2 text-sm">{errors.frontImageUrl.message}</p> : null}

      <UploadBox
        label={locale === "uz" ? "Orqa tomoni (ixtiyoriy)" : locale === "ru" ? "Оборотная сторона (необязательно)" : "Back image (optional)"}
        folder="kyc"
        value={backImageUrl ? [backImageUrl] : []}
        onChange={(urls) => setValue("backImageUrl", urls[0] ?? null, { shouldValidate: true })}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full rounded-2xl px-5 py-3 font-semibold transition"
      >
        {isSubmitting ? labels.working : labels.uploadDocuments}
      </button>
    </form>
  );
}
