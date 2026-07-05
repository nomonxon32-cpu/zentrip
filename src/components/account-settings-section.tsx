"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Role, type KycStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { StatusBadge } from "@/components/status-badge";
import { useLocale } from "@/components/providers";
import { CITIES } from "@/lib/constants";
import { getRoleLabel } from "@/lib/i18n-dictionary";
import { getAccountSettingsCopy } from "@/lib/account-settings-copy";
import { emailSettingsSchema, passwordChangeSchema, profileSettingsSchema } from "@/lib/validators";

type ProfileValues = z.infer<typeof profileSettingsSchema>;
type EmailValues = z.infer<typeof emailSettingsSchema>;
type PasswordValues = z.infer<typeof passwordChangeSchema>;

type ApiResponse = {
  error?: string;
  message?: string;
  kycReset?: boolean;
  requiresNameResetConfirmation?: boolean;
};

type SettingsUser = {
  name: string;
  email: string;
  phone: string;
  city: string;
  role: Role;
  kycStatus: KycStatus;
  isSuspended: boolean;
};

export function AccountSettingsSection({ user }: { user: SettingsUser }) {
  const router = useRouter();
  const { locale, labels } = useLocale();
  const copy = getAccountSettingsCopy(locale);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showNameResetConfirm, setShowNameResetConfirm] = useState(false);

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      name: user.name,
      phone: user.phone,
      city: user.city,
      confirmNameReset: false,
    },
  });
  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      email: user.email,
    },
  });
  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const watchedName = useWatch({
    control: profileForm.control,
    name: "name",
  });
  const isNameResetEligible = user.role !== Role.ADMIN;
  const hasNameChanged = isNameResetEligible && (watchedName?.trim() ?? "") !== user.name.trim();
  const cityOptions = useMemo(
    () => (CITIES.includes(user.city) ? CITIES : [user.city, ...CITIES]),
    [user.city],
  );

  useEffect(() => {
    if (!hasNameChanged) {
      setShowNameResetConfirm(false);
    }
  }, [hasNameChanged]);

  async function saveProfile(values: ProfileValues, confirmNameReset: boolean) {
    try {
      setIsSavingProfile(true);
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          confirmNameReset,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        if (payload.requiresNameResetConfirmation) {
          setShowNameResetConfirm(true);
          return;
        }

        throw new Error(payload.error ?? labels.actionFailed);
      }

      toast.success(payload.message ?? copy.profileUpdated);
      profileForm.reset({
        name: values.name.trim(),
        phone: values.phone.trim(),
        city: values.city.trim(),
        confirmNameReset: false,
      });
      setShowNameResetConfirm(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : labels.actionFailed);
    } finally {
      setIsSavingProfile(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.12fr)_minmax(280px,0.88fr)]">
      <div className="space-y-6">
        <form
          onSubmit={profileForm.handleSubmit(async (values) => {
            if (hasNameChanged && !showNameResetConfirm) {
              setShowNameResetConfirm(true);
              return;
            }

            await saveProfile(values, hasNameChanged);
          })}
          className="surface-card rounded-[2rem] p-6 dark:bg-slate-900"
        >
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">{copy.profileTitle}</h2>
            <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">{copy.profileDescription}</p>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <SettingsField label={labels.fullName} error={profileForm.formState.errors.name?.message}>
              <input {...profileForm.register("name")} className="input" />
              {isNameResetEligible ? (
                <p className="mt-2 text-xs leading-5 text-amber-700 dark:text-amber-300">{copy.nameResetNote}</p>
              ) : null}
            </SettingsField>

            <SettingsField label={labels.phone} error={profileForm.formState.errors.phone?.message}>
              <input {...profileForm.register("phone")} className="input" />
            </SettingsField>

            <SettingsField label={labels.city} error={profileForm.formState.errors.city?.message}>
              <select {...profileForm.register("city")} className="input">
                {cityOptions.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </SettingsField>
          </div>

          {showNameResetConfirm && hasNameChanged ? (
            <div className="mt-5 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/50">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">{copy.nameResetWarning}</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={isSavingProfile}
                  onClick={() => {
                    void profileForm.handleSubmit(async (values) => saveProfile(values, true))();
                  }}
                  className="btn-primary w-full rounded-2xl px-5 py-3 font-semibold transition sm:w-auto"
                >
                  {isSavingProfile ? labels.working : copy.updateNameAndResetKyc}
                </button>
                <button
                  type="button"
                  disabled={isSavingProfile}
                  onClick={() => {
                    setShowNameResetConfirm(false);
                    profileForm.resetField("name", { defaultValue: user.name });
                  }}
                  className="btn-secondary w-full rounded-2xl px-5 py-3 font-semibold transition sm:w-auto"
                >
                  {copy.cancelNameReset}
                </button>
              </div>
            </div>
          ) : null}

          <div className="mt-6">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="btn-primary w-full rounded-2xl px-5 py-3 font-semibold transition sm:w-auto"
            >
              {isSavingProfile ? labels.working : copy.saveProfile}
            </button>
          </div>
        </form>

        <form
          onSubmit={emailForm.handleSubmit(async (values) => {
            try {
              setIsSavingEmail(true);
              const response = await fetch("/api/account/email", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
              });
              const payload = (await response.json().catch(() => ({}))) as ApiResponse;

              if (!response.ok) {
                throw new Error(payload.error ?? labels.actionFailed);
              }

              toast.success(payload.message ?? copy.emailUpdated);
              emailForm.reset({ email: values.email.trim().toLowerCase() });
              router.refresh();
            } catch (error) {
              toast.error(error instanceof Error ? error.message : labels.actionFailed);
            } finally {
              setIsSavingEmail(false);
            }
          })}
          className="surface-card rounded-[2rem] p-6 dark:bg-slate-900"
        >
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">{copy.emailTitle}</h2>
            <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">{copy.emailDescription}</p>
          </div>
          <div className="mt-5 max-w-xl">
            <SettingsField label={labels.email} error={emailForm.formState.errors.email?.message}>
              <input {...emailForm.register("email")} type="email" className="input" />
            </SettingsField>
          </div>
          <div className="mt-6">
            <button
              type="submit"
              disabled={isSavingEmail}
              className="btn-primary w-full rounded-2xl px-5 py-3 font-semibold transition sm:w-auto"
            >
              {isSavingEmail ? labels.working : copy.updateEmail}
            </button>
          </div>
        </form>

        <form
          onSubmit={passwordForm.handleSubmit(async (values) => {
            try {
              setIsSavingPassword(true);
              const response = await fetch("/api/account/password", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
              });
              const payload = (await response.json().catch(() => ({}))) as ApiResponse;

              if (!response.ok) {
                throw new Error(payload.error ?? labels.actionFailed);
              }

              toast.success(payload.message ?? copy.passwordUpdated);
              passwordForm.reset({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              });
              router.refresh();
            } catch (error) {
              toast.error(error instanceof Error ? error.message : labels.actionFailed);
            } finally {
              setIsSavingPassword(false);
            }
          })}
          className="surface-card rounded-[2rem] p-6 dark:bg-slate-900"
        >
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">{copy.securityTitle}</h2>
            <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">{copy.securityDescription}</p>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <SettingsField label={copy.currentPassword} error={passwordForm.formState.errors.currentPassword?.message}>
              <input {...passwordForm.register("currentPassword")} type="password" className="input" />
            </SettingsField>
            <div className="hidden md:block" />
            <SettingsField label={copy.newPassword} error={passwordForm.formState.errors.newPassword?.message}>
              <input {...passwordForm.register("newPassword")} type="password" className="input" />
            </SettingsField>
            <SettingsField label={copy.confirmPassword} error={passwordForm.formState.errors.confirmPassword?.message}>
              <input {...passwordForm.register("confirmPassword")} type="password" className="input" />
            </SettingsField>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isSavingPassword}
              className="btn-primary w-full rounded-2xl px-5 py-3 font-semibold transition sm:w-auto"
            >
              {isSavingPassword ? labels.working : copy.changePassword}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        <section className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">{copy.statusTitle}</h2>
            <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">{copy.statusDescription}</p>
          </div>

          <div className="mt-5 space-y-4">
            <StatusLine
              label={labels.roleLabel}
              value={<span className="font-semibold text-slate-950 dark:text-slate-50">{getRoleLabel(locale, user.role)}</span>}
            />
            <StatusLine label={labels.kycStatus} value={<StatusBadge value={user.kycStatus} />} />
            <StatusLine
              label={copy.accountStatus}
              value={<StatusBadge value={user.isSuspended ? "SUSPENDED" : "ACTIVE"} />}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function SettingsField({
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

function StatusLine({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{label}</p>
      <div className="mt-2">{value}</div>
    </div>
  );
}
