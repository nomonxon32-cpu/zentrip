import Link from "next/link";

import { LoginForm } from "@/components/forms/login-form";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";

export default async function LoginPage() {
  const locale = await getCurrentLocale();
  const labels = getDictionary(locale);

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <div className="space-y-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">{labels.welcomeBack}</p>
        <h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-slate-50">{labels.loginHeading}</h1>
        <p className="text-base leading-8 text-slate-600 dark:text-slate-400">
          {labels.loginDescription}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {labels.needAccount}{" "}
          <Link href="/register" className="font-semibold text-sky-600 dark:text-sky-400">
            {labels.registerHere}
          </Link>
          .
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
