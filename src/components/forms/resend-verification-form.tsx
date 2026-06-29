"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useLocale } from "@/components/providers";

export function ResendVerificationForm({
  defaultEmail = "",
}: {
  defaultEmail?: string;
}) {
  const { labels } = useLocale();
  const [email, setEmail] = useState(defaultEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();

        try {
          setIsSubmitting(true);
          const response = await fetch("/api/auth/resend-verification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          const payload = (await response.json()) as { error?: string };

          if (!response.ok) {
            throw new Error(payload.error ?? labels.actionFailed);
          }

          toast.success(labels.verificationEmailResent);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : labels.actionFailed);
        } finally {
          setIsSubmitting(false);
        }
      }}
      className="space-y-4"
    >
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          {labels.email}
        </label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="input"
          placeholder="name@example.com"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full rounded-2xl px-5 py-3 font-semibold transition"
      >
        {isSubmitting ? labels.working : labels.resendVerificationEmail}
      </button>
    </form>
  );
}
