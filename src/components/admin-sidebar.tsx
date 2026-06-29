"use client";

import Link from "next/link";

import { useLocale } from "@/components/providers";
import { getAdminNavigationLinks } from "@/lib/admin-navigation";
import { cn } from "@/lib/utils";

function isActiveLink(currentPath: string, href: string) {
  if (href === "/admin") {
    return currentPath === "/admin";
  }

  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function AdminSidebar({ currentPath }: { currentPath: string }) {
  const { locale, labels } = useLocale();
  const links = [
    ...getAdminNavigationLinks(locale),
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
              isActiveLink(currentPath, link.href) ? "sidebar-link-active" : "sidebar-link",
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
