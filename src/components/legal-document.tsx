import Link from "next/link";

import type { LegalDocumentContent } from "@/lib/legal";

export function LegalDocument({ content }: { content: LegalDocumentContent }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            {content.lastUpdatedLabel}: {content.lastUpdatedValue}
          </span>
        </div>
        <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl">
          {content.title}
        </h1>
        <p className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-900 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200">
          {content.draftNotice}
        </p>
        <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">{content.intro}</p>
      </div>

      <article className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-8">
        <div className="space-y-8">
          {content.sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50 sm:text-2xl">
                {section.title}
              </h2>
              <div className="mt-3 space-y-3">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                    {paragraph}
                  </p>
                ))}
              </div>
              {section.bullets?.length ? (
                <ul className="mt-4 space-y-3 pl-5 text-sm leading-7 text-slate-600 marker:text-slate-400 dark:text-slate-300 sm:text-base">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <section className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50 sm:text-2xl">
              {content.contactTitle}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
              {content.contactBody}
            </p>
            <Link
              href={`mailto:${content.contactEmail}`}
              className="mt-4 inline-flex text-sm font-semibold text-sky-600 transition hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300"
            >
              {content.contactLabel}: {content.contactEmail}
            </Link>
          </section>
        </div>
      </article>
    </div>
  );
}
