import Link from "next/link";
import { Role } from "@prisma/client";

import { RegisterForm } from "@/components/forms/register-form";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, locale] = await Promise.all([searchParams, getCurrentLocale()]);
  const labels = getDictionary(locale);
  const defaultRole =
    typeof params.role === "string" && params.role.toUpperCase() === Role.OWNER
      ? Role.OWNER
      : Role.RENTER;

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 lg:px-8">
      <div className="space-y-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">{labels.createAccount}</p>
        <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl">{labels.registerHeading}</h1>
        <p className="text-base leading-8 text-slate-600 dark:text-slate-400">
          {labels.registerDescription}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {labels.alreadyHaveAccount}{" "}
          <Link href="/login" className="font-semibold text-sky-600 dark:text-sky-400">
            {labels.login}
          </Link>
          .
        </p>
      </div>
      <RegisterForm defaultRole={defaultRole as "OWNER" | "RENTER"} />
    </div>
  );
}
