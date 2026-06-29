"use client";

import { useState } from "react";
import { BookingStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ApiActionButton } from "@/components/api-action-button";
import { useLocale } from "@/components/providers";
import { cn } from "@/lib/utils";

export function OwnerBookingActions({
  bookingId,
  status,
  compact = false,
}: {
  bookingId: string;
  status: BookingStatus;
  compact?: boolean;
}) {
  const router = useRouter();
  const { labels } = useLocale();
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const canReview = status === BookingStatus.PENDING_OWNER_APPROVAL;

  return (
    <div className={cn("space-y-3", compact && "space-y-0")}>
      {canReview && !compact ? (
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            {labels.rejectionReason} ({labels.any.toLowerCase()})
          </label>
          <textarea
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            rows={3}
            className="input min-h-28 text-sm"
            placeholder={
              labels.rejectionReason === "Rad etish sababi"
                ? "Ijarachiga izoh qoldiring."
                : labels.rejectionReason === "Причина отклонения"
                  ? "Добавьте пояснение для арендатора."
                  : "Add context for the renter if you reject this request."
            }
          />
        </div>
      ) : null}
      <div className="grid gap-3 sm:flex sm:flex-wrap">
        {status === BookingStatus.PENDING_OWNER_APPROVAL ? (
        <>
          <ApiActionButton
            endpoint={`/api/bookings/${bookingId}`}
            payload={{ action: "APPROVE" }}
            label={labels.approve}
            successMessage={labels.bookingConfirmed}
          />
          <button
            type="button"
            disabled={isRejecting}
            onClick={async () => {
              try {
                setIsRejecting(true);
                const response = await fetch(`/api/bookings/${bookingId}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "REJECT",
                    reason:
                      rejectionReason.trim() ||
                      (labels.rejectionReason === "Rad etish sababi"
                        ? "Egasi so'rovni rad etdi."
                        : labels.rejectionReason === "Причина отклонения"
                          ? "Владелец отклонил запрос."
                          : "Owner rejected the request."),
                  }),
                });
                const payload = (await response.json()) as { error?: string };
                if (!response.ok) {
                  throw new Error(payload.error ?? `${labels.reject} failed.`);
                }
                toast.success(labels.reject);
                router.refresh();
              } catch (error) {
                toast.error(error instanceof Error ? error.message : `${labels.reject} failed.`);
              } finally {
                setIsRejecting(false);
              }
            }}
            className="btn-danger w-full rounded-full px-4 py-2 text-sm font-semibold transition sm:w-auto"
          >
            {isRejecting ? labels.working : labels.reject}
          </button>
        </>
        ) : null}
        {status === BookingStatus.CONFIRMED ? (
          <ApiActionButton
            endpoint={`/api/bookings/${bookingId}`}
            payload={{ action: "START" }}
            label={labels.search === "Qidiruv" ? "Safarni faol qilish" : labels.search === "Поиск" ? "Сделать поездку активной" : "Mark trip active"}
            successMessage={labels.search === "Qidiruv" ? "Safar faol qilindi" : labels.search === "Поиск" ? "Поездка переведена в активную" : "Trip marked active"}
          />
        ) : null}
        {status === BookingStatus.ACTIVE ? (
          <ApiActionButton
            endpoint={`/api/bookings/${bookingId}`}
            payload={{ action: "COMPLETE" }}
            label={labels.completedTrips}
            successMessage={labels.bookingConfirmed === "Bron tasdiqlandi" ? "Safar yakunlandi" : labels.bookingConfirmed === "Бронирование подтверждено" ? "Поездка завершена" : "Trip completed"}
          />
        ) : null}
      </div>
    </div>
  );
}
