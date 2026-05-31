"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { messageSchema } from "@/lib/validators";

type MessageValues = z.infer<typeof messageSchema>;

export function MessageForm({
  receiverId,
  bookingId,
}: {
  receiverId: string;
  bookingId?: string | null;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MessageValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      receiverId,
      bookingId,
      content: "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        try {
          setIsSubmitting(true);
          const response = await fetch("/api/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });
          const payload = (await response.json()) as { error?: string };
          if (!response.ok) {
            throw new Error(payload.error ?? "Could not send message.");
          }

          reset({ receiverId, bookingId, content: "" });
          toast.success("Message sent");
          router.refresh();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Could not send message.");
        } finally {
          setIsSubmitting(false);
        }
      })}
      className="space-y-3"
    >
      <input type="hidden" {...register("receiverId")} />
      <input type="hidden" {...register("bookingId")} />
      <textarea
        {...register("content")}
        rows={3}
        className="input min-h-24"
        placeholder="Send a message"
      />
      {errors.content ? <p className="theme-error text-sm">{errors.content.message}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary rounded-2xl px-5 py-3 font-semibold transition"
      >
        {isSubmitting ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
