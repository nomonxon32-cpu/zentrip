import Link from "next/link";

import { MarketingIcon } from "@/components/marketing-icon";
import { getCurrentLocale } from "@/lib/i18n";
import { getTrustContent } from "@/lib/marketing";

export const dynamic = "force-dynamic";

export default async function TrustPage() {
  const locale = await getCurrentLocale();
  const content = getTrustContent(locale);

  return (
    <div className="space-y-20 pb-24">
      {/* Hero */}
      <section className="mx-auto w-full max-w-[1400px] px-4 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-emerald-200 bg-[linear-gradient(135deg,#022c22_0%,#064e3b_45%,#047857_100%)] px-6 py-12 text-white shadow-2xl shadow-emerald-950/20 dark:border-emerald-900 sm:px-10 lg:px-14 lg:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.25),transparent_42%)]" />
          <div className="relative max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-50">
              <MarketingIcon name="shield" className="h-4 w-4" />
              {content.eyebrow}
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              {content.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-emerald-50 sm:text-lg">{content.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">{content.pillarsTitle}</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {content.pillars.map((pillar) => (
            <div key={pillar.title} className="surface-card rounded-[1.75rem] p-6 dark:bg-slate-900">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                <MarketingIcon name={pillar.icon} className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-950 dark:text-slate-50">{pillar.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{pillar.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Booking flow */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-10">
          <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">{content.flowTitle}</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">{content.flowSubtitle}</p>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {content.flow.map((step, index) => (
              <li key={step.title}>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-black text-white">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-base font-bold tracking-tight text-slate-950 dark:text-slate-50">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Privacy */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">{content.privacyTitle}</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {content.privacy.map((item) => (
            <div key={item.title} className="surface-subtle rounded-[1.75rem] p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm dark:bg-slate-950 dark:text-emerald-300">
                <MarketingIcon name={item.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold tracking-tight text-slate-950 dark:text-slate-50">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.body}</p>
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

      {/* CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-5 rounded-[2rem] border border-emerald-200 bg-[linear-gradient(135deg,#064e3b,#047857)] px-6 py-12 text-center text-white shadow-xl dark:border-emerald-900 sm:px-10">
          <h2 className="max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">{content.ctaTitle}</h2>
          <p className="max-w-xl text-emerald-50">{content.ctaSubtitle}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/search"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-emerald-700 shadow-lg transition hover:bg-emerald-50"
            >
              {content.ctaRenter}
            </Link>
            <Link
              href="/host"
              className="inline-flex items-center justify-center rounded-2xl border border-white/40 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              {content.ctaOwner}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
