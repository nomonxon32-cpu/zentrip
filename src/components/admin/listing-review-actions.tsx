"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { VehicleStatus } from "@prisma/client";
import { toast } from "sonner";

import { ApiActionButton } from "@/components/api-action-button";
import { useLocale } from "@/components/providers";
import { cn } from "@/lib/utils";

export function ListingReviewActions({
  listingId,
  status,
  publicHref,
}: {
  listingId: string;
  status: VehicleStatus;
  publicHref?: string;
}) {
  const router = useRouter();
  const { labels } = useLocale();
  const [reason, setReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  async function handleReject() {
    const normalizedReason = reason.trim();

    if (!normalizedReason) {
      toast.error(labels.rejectionReasonRequired);
      return;
    }

    try {
      setIsRejecting(true);
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REJECT",
          rejectionReason: normalizedReason,
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
  }

  if (status === VehicleStatus.PENDING_REVIEW) {
    return (
      <div className="space-y-3">
        <div className="grid gap-3 sm:flex sm:flex-wrap">
          <ApiActionButton
            endpoint={`/api/admin/listings/${listingId}`}
            payload={{ action: "APPROVE" }}
            label={labels.approve}
            successMessage={labels.listingApproved}
          />
        </div>
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder={labels.rejectionReason}
          rows={3}
          className="input text-sm"
        />
        <button
          type="button"
          disabled={isRejecting}
          onClick={handleReject}
          className="btn-danger w-full rounded-full px-4 py-2 text-sm font-semibold transition sm:w-auto"
        >
          {isRejecting ? labels.working : labels.reject}
        </button>
      </div>
    );
  }

  if (status === VehicleStatus.ACTIVE) {
    return (
      <div className="grid gap-3 sm:flex sm:flex-wrap">
        {publicHref ? (
          <Link
            href={publicHref}
            className={cn(
              "btn-secondary inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition sm:w-auto",
            )}
          >
            {labels.view}
          </Link>
        ) : null}
        <ApiActionButton
          endpoint={`/api/admin/listings/${listingId}`}
          payload={{ action: "DEACTIVATE" }}
          label={labels.deactivate}
          successMessage={labels.listingDeactivated}
          variant="outline"
        />
      </div>
    );
  }

  if (status === VehicleStatus.REJECTED) {
    return (
      <div className="grid gap-3 sm:flex sm:flex-wrap">
        <ApiActionButton
          endpoint={`/api/admin/listings/${listingId}`}
          payload={{ action: "APPROVE" }}
          label={labels.reconsider}
          successMessage={labels.listingApproved}
        />
      </div>
    );
  }

  if (status === VehicleStatus.INACTIVE) {
    return (
      <div className="grid gap-3 sm:flex sm:flex-wrap">
        <ApiActionButton
          endpoint={`/api/admin/listings/${listingId}`}
          payload={{ action: "APPROVE" }}
          label={labels.reactivate}
          successMessage={labels.listingApproved}
        />
      </div>
    );
  }

  return null;
}
