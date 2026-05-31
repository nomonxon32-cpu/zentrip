"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ApiActionButton } from "@/components/api-action-button";
import { useLocale } from "@/components/providers";

export function ListingReviewActions({ listingId }: { listingId: string }) {
  const router = useRouter();
  const { labels } = useLocale();
  const [reason, setReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <ApiActionButton
          endpoint={`/api/admin/listings/${listingId}`}
          payload={{ action: "APPROVE" }}
          label={labels.approve}
          successMessage={labels.listingApproved}
        />
        <ApiActionButton
          endpoint={`/api/admin/listings/${listingId}`}
          payload={{ action: "DEACTIVATE" }}
          label={labels.deactivate}
          successMessage={labels.listingDeactivated}
          variant="outline"
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
            const response = await fetch(`/api/admin/listings/${listingId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "REJECT",
                rejectionReason: reason,
              }),
            });
            const payload = (await response.json()) as { error?: string };
            if (!response.ok) {
              throw new Error(payload.error ?? labels.listingRejectionFailed);
            }
            toast.success(labels.listingRejected);
            setReason("");
            router.refresh();
          } catch (error) {
            toast.error(error instanceof Error ? error.message : labels.listingRejectionFailed);
          } finally {
            setIsRejecting(false);
          }
        }}
        className="btn-danger rounded-full px-4 py-2 text-sm font-semibold transition"
      >
        {isRejecting ? labels.working : labels.reject}
      </button>
    </div>
  );
}
