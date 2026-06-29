"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandLogo } from "@/components/brand-logo";
import { useLocale } from "@/components/providers";

export function Footer() {
  const pathname = usePathname();
  const { locale, labels } = useLocale();

  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 text-sm text-slate-600 dark:text-slate-400 sm:px-6 lg:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
        <div className="space-y-3">
          <Link href="/" aria-label="Zentrip home" className="inline-flex">
            <BrandLogo iconClassName="h-7 w-7" wordmarkClassName="text-lg" />
          </Link>
          <p className="max-w-md leading-6">
            {locale === "uz"
              ? "O'zbekiston bo'ylab shaxsiy avtomobil ijara bozori - shaxsni tekshirish, egasi tasdig'i va himoyalangan bozor tajribasi bilan."
              : locale === "ru"
                ? "Премиальный маркетплейс peer-to-peer аренды по Узбекистану с проверкой личности, одобрением владельцев и защитой на уровне платформы."
                : "Premium peer-to-peer rentals across Uzbekistan with identity checks, owner approvals, and marketplace-style protection."}
          </p>
        </div>
        <div className="space-y-3">
          <p className="font-semibold text-slate-950 dark:text-slate-50">
            {locale === "uz" ? "Marketplace" : locale === "ru" ? "Маркетплейс" : "Marketplace"}
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/search">{labels.browseCars}</Link>
            <Link href="/host">{labels.becomeHost}</Link>
            <Link href="/trust">{labels.trust}</Link>
          </div>
        </div>
        <div className="space-y-3">
          <p className="font-semibold text-slate-950 dark:text-slate-50">
            {locale === "uz" ? "Shaharlar" : locale === "ru" ? "Города" : "Cities"}
          </p>
          <div className="flex flex-col gap-2">
            <span>Tashkent</span>
            <span>Samarkand</span>
            <span>Bukhara</span>
            <span>Fergana</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
