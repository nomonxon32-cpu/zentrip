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
    <aside className="surface-card space-y-3 rounded-[2rem] p-4 dark:bg-slate-900">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "block rounded-2xl px-4 py-3 text-sm font-semibold transition",
            currentPath === link.href
              ? "sidebar-link-active"
              : "sidebar-link",
          )}
        >
          {link.label}
        </Link>
      ))}
    </aside>
  );
}
