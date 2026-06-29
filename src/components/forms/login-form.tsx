"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
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
  code?: string;
  email?: string;
};

export function LoginForm() {
  const router = useRouter();
  const { labels } = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
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
            if (payload.code === "EMAIL_NOT_VERIFIED") {
              setPendingVerificationEmail(payload.email ?? values.email);
            }
            throw new Error(payload.error ?? `${labels.loginFailed}.`);
          }

          setPendingVerificationEmail("");
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

      {pendingVerificationEmail ? (
        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          <p className="font-semibold">{labels.verifyEmailBeforeSignIn}</p>
          <p className="mt-2 break-words text-amber-700 dark:text-amber-200">{pendingVerificationEmail}</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={isResending}
              onClick={async () => {
                try {
                  setIsResending(true);
                  const response = await fetch("/api/auth/resend-verification", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: pendingVerificationEmail }),
                  });
                  const payload = (await response.json()) as { error?: string };

                  if (!response.ok) {
                    throw new Error(payload.error ?? labels.actionFailed);
                  }

                  toast.success(labels.verificationEmailResent);
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : labels.actionFailed);
                } finally {
                  setIsResending(false);
                }
              }}
              className="btn-primary inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition"
            >
              {isResending ? labels.working : labels.resendVerificationEmail}
            </button>
            <Link
              href={`/verify-email?email=${encodeURIComponent(pendingVerificationEmail)}&status=pending`}
              className="btn-secondary inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition"
            >
              {labels.verifyEmail}
            </Link>
          </div>
        </div>
      ) : null}
    </form>
  );
}
