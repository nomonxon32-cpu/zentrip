"use client";

import Link from "next/link";

import { useLocale } from "@/components/providers";
import { cn } from "@/lib/utils";

export function AdminSidebar({ currentPath }: { currentPath: string }) {
  const { labels } = useLocale();
  const links = [
    { href: "/admin", label: labels.overview },
    { href: "/admin/users", label: labels.users },
    { href: "/admin/kyc", label: labels.kyc },
    { href: "/admin/listings", label: labels.listings },
    { href: "/admin/bookings", label: labels.bookings },
    { href: "/admin/disputes", label: labels.disputes },
  ];

  return (
    <aside className="surface-card h-fit rounded-[2rem] p-3 lg:p-4 dark:bg-slate-900">
      <div className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-3 lg:overflow-visible">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "block shrink-0 whitespace-nowrap rounded-2xl px-4 py-2.5 text-sm font-semibold transition lg:shrink lg:py-3",
              currentPath === link.href ? "sidebar-link-active" : "sidebar-link",
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
