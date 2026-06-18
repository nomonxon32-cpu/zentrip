import Link from "next/link";
import { Role } from "@prisma/client";

import { MarketingIcon } from "@/components/marketing-icon";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentLocale } from "@/lib/i18n";
import { getHostContent } from "@/lib/marketing";

export const dynamic = "force-dynamic";

export default async function HostLandingPage() {
  const [user, locale] = await Promise.all([getCurrentUser(), getCurrentLocale()]);
  const content = getHostContent(locale);
  const isOwner = user?.role === Role.OWNER;
  const primaryHref = isOwner ? "/dashboard/owner/listings/new" : "/register?role=OWNER";
  const primaryCtaLabel = isOwner ? content.ctaOwnerPrimary : content.ctaGuestPrimary;

  return (
    <div className="space-y-20 pb-24">
      {/* Hero */}
      <section className="mx-auto w-full max-w-[1400px] px-4 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(135deg,#020617_0%,#0f172a_46%,#334155_100%)] px-6 py-12 text-white shadow-2xl shadow-slate-950/15 dark:border-slate-800 sm:px-10 lg:px-14 lg:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_40%)]" />
          <div className="absolute -left-24 top-10 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl" />
          <div className="relative max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">{content.eyebrow}</p>
            <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              {content.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-100 sm:text-lg">{content.subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={primaryHref}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-slate-950/20 transition hover:bg-slate-100 sm:w-auto"
              >
                {primaryCtaLabel}
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-white/30 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10 sm:w-auto"
              >
                {content.secondaryCta}
              </Link>
            </div>
          </div>

          <div className="relative mt-12 grid gap-4 sm:grid-cols-3">
            {content.stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur">
                <p className="text-3xl font-black tracking-tight">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">{content.benefitsTitle}</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {content.benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="surface-card rounded-[1.75rem] p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10 dark:bg-slate-900"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
                <MarketingIcon name={benefit.icon} className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-950 dark:text-slate-50">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{benefit.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-10">
          <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">{content.stepsTitle}</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">{content.stepsSubtitle}</p>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {content.steps.map((step, index) => (
              <li key={step.title} className="relative">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white dark:bg-white dark:text-slate-950">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-base font-bold tracking-tight text-slate-950 dark:text-slate-50">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Control */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">{content.controlTitle}</h2>
        <p className="mt-2 max-w-2xl text-slate-500 dark:text-slate-400">{content.controlSubtitle}</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {content.controls.map((control) => (
            <div key={control.title} className="surface-subtle rounded-[1.75rem] p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-slate-50">
                <MarketingIcon name={control.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold tracking-tight text-slate-950 dark:text-slate-50">{control.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{control.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">{content.faqTitle}</h2>
        <div className="mt-6 space-y-3">
          {content.faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-slate-950 dark:text-slate-50">
                {faq.question}
                <span className="text-slate-400 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-5 rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#0f172a,#334155)] px-6 py-12 text-center text-white shadow-xl dark:border-slate-800 sm:px-10">
          <h2 className="max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">{content.finalTitle}</h2>
          <p className="max-w-xl text-slate-200">{content.finalSubtitle}</p>
          <Link
            href={primaryHref}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-slate-950 shadow-lg transition hover:bg-slate-100 sm:w-auto"
          >
            {primaryCtaLabel}
          </Link>
        </div>
      </section>
    </div>
  );
}
