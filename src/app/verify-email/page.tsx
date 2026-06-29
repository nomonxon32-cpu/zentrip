import Link from "next/link";
import { redirect } from "next/navigation";

import { ResendVerificationForm } from "@/components/forms/resend-verification-form";
import { consumeEmailVerificationToken } from "@/lib/email-verification";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";

type VerifyStatus = "sent" | "pending" | "resent" | "success" | "expired" | "invalid";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, locale] = await Promise.all([searchParams, getCurrentLocale()]);
  const labels = getDictionary(locale);
  const token = typeof params.token === "string" ? params.token : "";
  const email = typeof params.email === "string" ? params.email : "";

  if (token) {
    const result = await consumeEmailVerificationToken(token);
    const nextParams = new URLSearchParams();

    if (result.email) {
      nextParams.set("email", result.email);
    }

    nextParams.set(
      "status",
      result.status === "verified" ? "success" : result.status === "expired" ? "expired" : "invalid",
    );

    redirect(`/verify-email?${nextParams.toString()}`);
  }

  const status = normalizeStatus(typeof params.status === "string" ? params.status : "");
  const content = getContent(status, labels, email);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="surface-card overflow-hidden rounded-[2rem] p-6 sm:p-8 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">{labels.verifyEmail}</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl">
          {content.title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
          {content.description}
        </p>

        {email ? (
          <div className="mt-5 inline-flex max-w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
            <span className="truncate">{email}</span>
          </div>
        ) : null}

        {status === "success" ? (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="btn-primary inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition"
            >
              {labels.login}
            </Link>
            <Link
              href="/register"
              className="btn-secondary inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition"
            >
              {labels.register}
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
              <h2 className="text-lg font-black tracking-tight text-slate-950 dark:text-slate-50">
                {labels.resendVerificationEmail}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {labels.resendVerificationDescription}
              </p>
              <div className="mt-5">
                <ResendVerificationForm defaultEmail={email} />
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
              <h2 className="text-lg font-black tracking-tight text-slate-950 dark:text-slate-50">
                {labels.login}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {labels.verifyEmailBeforeSignIn}
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <Link
                  href="/login"
                  className="btn-primary inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition"
                >
                  {labels.login}
                </Link>
                <Link
                  href="/"
                  className="btn-secondary inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition"
                >
                  {labels.backToHome}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function normalizeStatus(status: string): VerifyStatus {
  if (
    status === "sent" ||
    status === "pending" ||
    status === "resent" ||
    status === "success" ||
    status === "expired"
  ) {
    return status;
  }

  return "invalid";
}

function getContent(
  status: VerifyStatus,
  labels: ReturnType<typeof getDictionary>,
  email: string,
) {
  if (status === "success") {
    return {
      title: labels.emailVerifiedTitle,
      description: labels.emailVerifiedDescription,
    };
  }

  if (status === "expired" || status === "invalid") {
    return {
      title: labels.verificationLinkExpiredTitle,
      description: labels.verificationLinkExpiredDescription,
    };
  }

  return {
    title: labels.verifyEmailHeading,
    description: email
      ? `${labels.verifyEmailDescription} ${labels.verificationEmailAddressPrefix} ${email}.`
      : labels.verifyEmailDescription,
  };
}
