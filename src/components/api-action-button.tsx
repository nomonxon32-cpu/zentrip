"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useLocale } from "@/components/providers";
import { cn } from "@/lib/utils";

export function ApiActionButton({
  endpoint,
  label,
  payload,
  method = "PATCH",
  successMessage,
  variant = "default",
}: {
  endpoint: string;
  label: string;
  payload?: Record<string, unknown>;
  method?: "PATCH" | "POST" | "PUT" | "DELETE";
  successMessage: string;
  variant?: "default" | "danger" | "outline";
}) {
  const router = useRouter();
  const { labels } = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <button
      type="button"
      disabled={isSubmitting}
      onClick={async () => {
        try {
          setIsSubmitting(true);
          const response = await fetch(endpoint, {
            method,
            headers: payload ? { "Content-Type": "application/json" } : undefined,
            body: payload ? JSON.stringify(payload) : undefined,
          });
          const result = (await response.json().catch(() => ({ ok: response.ok }))) as {
            error?: string;
          };
          if (!response.ok) {
            throw new Error(result.error ?? labels.actionFailed);
          }
          toast.success(successMessage);
          router.refresh();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : labels.actionFailed);
        } finally {
          setIsSubmitting(false);
        }
      }}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-semibold transition",
        variant === "danger"
          ? "btn-danger"
          : variant === "outline"
            ? "btn-secondary"
            : "btn-primary",
      )}
    >
      {isSubmitting ? labels.working : label}
    </button>
  );
}
