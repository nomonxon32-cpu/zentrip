"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useLocale } from "@/components/providers";
import { loginSchema } from "@/lib/validators";

type LoginValues = z.infer<typeof loginSchema>;
type LoginResponse = {
  error?: string;
  redirectTo?: string;
};

export function LoginForm() {
  const router = useRouter();
  const { labels } = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        try {
          setIsSubmitting(true);
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });
          const payload = (await response.json()) as LoginResponse;

          if (!response.ok) {
            throw new Error(payload.error ?? `${labels.loginFailed}.`);
          }

          toast.success(labels.signedInSuccess);
          router.push(payload.redirectTo ?? "/");
          router.refresh();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : labels.loginFailed);
        } finally {
          setIsSubmitting(false);
        }
      })}
      className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6"
    >
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">{labels.email}</label>
        <input
          {...register("email")}
          type="email"
          className="input"
        />
        {errors.email ? <p className="theme-error mt-2 text-sm">{errors.email.message}</p> : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">{labels.password}</label>
        <input
          {...register("password")}
          type="password"
          className="input"
        />
        {errors.password ? <p className="theme-error mt-2 text-sm">{errors.password.message}</p> : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full rounded-2xl px-5 py-3 font-semibold transition"
      >
        {isSubmitting ? labels.signingIn : labels.login}
      </button>
    </form>
  );
}
