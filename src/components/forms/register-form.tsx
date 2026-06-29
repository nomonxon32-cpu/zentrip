"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useLocale } from "@/components/providers";
import { CITIES } from "@/lib/constants";
import { registerSchema } from "@/lib/validators";

type RegisterValues = z.infer<typeof registerSchema>;
type RegisterResponse = {
  error?: string;
  redirectTo?: string;
  requiresVerification?: boolean;
  email?: string;
};

export function RegisterForm({
  defaultRole = Role.RENTER,
}: {
  defaultRole?: "OWNER" | "RENTER";
}) {
  const router = useRouter();
  const { labels } = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: defaultRole,
    },
  });

  const role = useWatch({ control, name: "role" });

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        try {
          setIsSubmitting(true);
          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });
          const payload = (await response.json()) as RegisterResponse;
          if (!response.ok) {
            throw new Error(payload.error ?? `${labels.registrationFailed}.`);
          }

          toast.success(
            payload.requiresVerification ? labels.verificationEmailSent : labels.accountCreated,
          );
          router.push(
            payload.redirectTo ??
              `/verify-email?email=${encodeURIComponent(payload.email ?? values.email)}&status=sent`,
          );
        } catch (error) {
          toast.error(error instanceof Error ? error.message : `${labels.registrationFailed}.`);
        } finally {
          setIsSubmitting(false);
        }
      })}
      className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6"
    >
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{labels.iWantToJoinAs}</label>
        <div className="grid grid-cols-2 gap-3">
          <label className={`rounded-2xl border px-4 py-3 ${role === Role.RENTER ? "border-slate-950 bg-slate-950 !text-white dark:border-slate-100 dark:bg-slate-100 dark:!text-slate-950" : "border-slate-200 dark:border-slate-700 dark:text-slate-200"}`}>
            <input {...register("role")} type="radio" value={Role.RENTER} className="hidden" />
            <span className="font-semibold">{labels.renter}</span>
          </label>
          <label className={`rounded-2xl border px-4 py-3 ${role === Role.OWNER ? "border-slate-950 bg-slate-950 !text-white dark:border-slate-100 dark:bg-slate-100 dark:!text-slate-950" : "border-slate-200 dark:border-slate-700 dark:text-slate-200"}`}>
            <input {...register("role")} type="radio" value={Role.OWNER} className="hidden" />
            <span className="font-semibold">{labels.owner}</span>
          </label>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <FormField label={labels.fullName} error={errors.name?.message}>
          <input {...register("name")} className="input" />
        </FormField>
        <FormField label={labels.phone} error={errors.phone?.message}>
          <input {...register("phone")} className="input" />
        </FormField>
        <FormField label={labels.email} error={errors.email?.message}>
          <input {...register("email")} type="email" className="input" />
        </FormField>
        <FormField label={labels.city} error={errors.city?.message}>
          <select {...register("city")} className="input">
            <option value="">{labels.selectCity}</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label={labels.password} error={errors.password?.message}>
        <input {...register("password")} type="password" className="input" />
      </FormField>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full rounded-2xl px-5 py-3 font-semibold transition"
      >
        {isSubmitting ? labels.creatingAccount : labels.createAccount}
      </button>
    </form>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
      {children}
      {error ? <p className="theme-error mt-2 text-sm">{error}</p> : null}
    </div>
  );
}
