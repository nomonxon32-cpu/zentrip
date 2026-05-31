"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { disputeSchema } from "@/lib/validators";

type DisputeValues = z.infer<typeof disputeSchema>;

export function DisputeForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DisputeValues>({
    resolver: zodResolver(disputeSchema),
    defaultValues: {
      bookingId,
      reason: "",
      description: "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        try {
          setIsSubmitting(true);
          const response = await fetch("/api/disputes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });
          const payload = (await response.json()) as { error?: string };
          if (!response.ok) {
            throw new Error(payload.error ?? "Could not open dispute.");
          }

          toast.success("Dispute opened");
          router.refresh();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Could not open dispute.");
        } finally {
          setIsSubmitting(false);
        }
      })}
      className="surface-card space-y-4 rounded-[2rem] p-5 dark:bg-slate-900"
    >
      <input type="hidden" {...register("bookingId")} />
      <div>
        <label className="theme-label mb-2 block text-sm font-semibold">Reason</label>
        <input {...register("reason")} className="input" />
        {errors.reason ? <p className="theme-error mt-2 text-sm">{errors.reason.message}</p> : null}
      </div>
      <div>
        <label className="theme-label mb-2 block text-sm font-semibold">Description</label>
        <textarea {...register("description")} rows={4} className="input min-h-28" />
        {errors.description ? <p className="theme-error mt-2 text-sm">{errors.description.message}</p> : null}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-danger rounded-2xl px-5 py-3 font-semibold transition"
      >
        {isSubmitting ? "Submitting..." : "Open dispute"}
      </button>
    </form>
  );
}
