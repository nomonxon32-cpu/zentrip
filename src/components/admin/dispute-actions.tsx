"use client";

import { useState } from "react";
import { DisputeStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useLocale } from "@/components/providers";
import { getStatusLabel } from "@/lib/i18n-dictionary";

export function DisputeActions({ disputeId }: { disputeId: string }) {
  const router = useRouter();
  const { locale, labels } = useLocale();
  const [status, setStatus] = useState<DisputeStatus>(DisputeStatus.UNDER_REVIEW);
  const [adminNote, setAdminNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="space-y-3">
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value as DisputeStatus)}
        className="input text-sm"
      >
        {Object.values(DisputeStatus).map((option) => (
          <option key={option} value={option}>
            {getStatusLabel(locale, option)}
          </option>
        ))}
      </select>
      <textarea
        value={adminNote}
        onChange={(event) => setAdminNote(event.target.value)}
        className="input text-sm"
        placeholder={labels.adminNote}
      />
      <button
        type="button"
        disabled={isSubmitting}
        onClick={async () => {
          try {
            setIsSubmitting(true);
            const response = await fetch(`/api/admin/disputes/${disputeId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status, adminNote }),
            });
            const payload = (await response.json()) as { error?: string };
            if (!response.ok) {
              throw new Error(payload.error ?? labels.disputeUpdateFailed);
            }
            toast.success(labels.disputeUpdated);
            router.refresh();
          } catch (error) {
            toast.error(error instanceof Error ? error.message : labels.disputeUpdateFailed);
          } finally {
            setIsSubmitting(false);
          }
        }}
        className="btn-primary rounded-full px-4 py-2 text-sm font-semibold transition"
      >
        {isSubmitting ? labels.working : labels.save}
      </button>
    </div>
  );
}
