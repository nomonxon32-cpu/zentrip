import Link from "next/link";

import { cn } from "@/lib/utils";

export function DashboardShell({
  title,
  description,
  links,
  backAction,
  children,
}: {
  title: string;
  description: string;
  links: Array<{ label: string; href: string; active?: boolean }>;
  backAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8 lg:px-8">
      <aside className="surface-card h-fit overflow-hidden rounded-[2rem] p-3 lg:p-4 dark:bg-slate-900">
        <div className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-3 lg:overflow-visible">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "block shrink-0 whitespace-nowrap rounded-2xl px-4 py-2.5 text-sm font-semibold transition lg:shrink lg:py-3",
                link.active ? "sidebar-link-active" : "sidebar-link",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </aside>
      <section className="min-w-0 space-y-6">
        {backAction ? <div>{backAction}</div> : null}
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        {children}
      </section>
    </div>
  );
}
