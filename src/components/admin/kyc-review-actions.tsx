"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ApiActionButton } from "@/components/api-action-button";
import { useLocale } from "@/components/providers";

export function KycReviewActions({ documentId }: { documentId: string }) {
  const router = useRouter();
  const { labels } = useLocale();
  const [reason, setReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:flex sm:flex-wrap">
        <ApiActionButton
          endpoint={`/api/admin/kyc/${documentId}`}
          payload={{ action: "APPROVE" }}
          label={labels.approve}
          successMessage={labels.kycApproved}
        />
      </div>
      <textarea
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder={labels.rejectionReason}
        className="input text-sm"
      />
      <button
        type="button"
        disabled={isRejecting}
        onClick={async () => {
          try {
            setIsRejecting(true);
            const response = await fetch(`/api/admin/kyc/${documentId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "REJECT",
                rejectionReason: reason,
              }),
            });
            const payload = (await response.json()) as { error?: string };
            if (!response.ok) {
              throw new Error(payload.error ?? labels.kycRejectionFailed);
            }
            toast.success(labels.kycRejected);
            setReason("");
            router.refresh();
          } catch (error) {
            toast.error(error instanceof Error ? error.message : labels.kycRejectionFailed);
          } finally {
            setIsRejecting(false);
          }
        }}
        className="btn-danger w-full rounded-full px-4 py-2 text-sm font-semibold transition sm:w-auto"
      >
        {isRejecting ? labels.working : labels.reject}
      </button>
    </div>
  );
}
