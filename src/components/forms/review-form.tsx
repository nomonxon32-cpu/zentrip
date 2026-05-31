"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { reviewSchema } from "@/lib/validators";

type ReviewValues = z.infer<typeof reviewSchema>;

export function ReviewForm({
  bookingId,
  vehicleId,
  receiverId,
}: {
  bookingId: string;
  vehicleId: string;
  receiverId: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      bookingId,
      vehicleId,
      receiverId,
      rating: 5,
      comment: "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        try {
          setIsSubmitting(true);
          const response = await fetch("/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });
          const payload = (await response.json()) as { error?: string };
          if (!response.ok) {
            throw new Error(payload.error ?? "Could not submit review.");
          }

          toast.success("Review submitted");
          router.refresh();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Could not submit review.");
        } finally {
          setIsSubmitting(false);
        }
      })}
      className="surface-card space-y-4 rounded-[2rem] p-5 dark:bg-slate-900"
    >
      <input type="hidden" {...register("bookingId")} />
      <input type="hidden" {...register("vehicleId")} />
      <input type="hidden" {...register("receiverId")} />
      <div>
        <label className="theme-label mb-2 block text-sm font-semibold">Rating</label>
        <select {...register("rating", { valueAsNumber: true })} className="input">
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} stars
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="theme-label mb-2 block text-sm font-semibold">Comment</label>
        <textarea {...register("comment")} rows={4} className="input min-h-28" />
        {errors.comment ? <p className="theme-error mt-2 text-sm">{errors.comment.message}</p> : null}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary rounded-2xl px-5 py-3 font-semibold transition"
      >
        {isSubmitting ? "Submitting..." : "Leave review"}
      </button>
    </form>
  );
}
