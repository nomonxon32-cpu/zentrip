"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Mail, Send } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { useLocale } from "@/components/providers";
import { getLegalUi } from "@/lib/legal";

export function Footer() {
  const pathname = usePathname();
  const { locale, labels } = useLocale();
  const legal = getLegalUi(locale);

  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 text-sm text-slate-600 dark:text-slate-400 sm:px-6 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:px-8">
        <div className="space-y-3">
          <Link href="/" aria-label="Zentrip home" className="inline-flex">
            <BrandLogo iconClassName="h-7 w-7" wordmarkClassName="text-lg" />
          </Link>
          <p className="max-w-md leading-6">
            {locale === "uz"
              ? "O'zbekiston bo'ylab shaxsiy avtomobil ijara bozori - shaxsni tekshirish, egasi tasdig'i va himoyalangan bozor tajribasi bilan."
              : locale === "ru"
                ? "Премиальный peer-to-peer маркетплейс аренды по Узбекистану с проверкой личности, одобрением владельцев и защитой на уровне платформы."
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
            <Link href="/privacy-policy">{legal.privacyPolicy}</Link>
            <Link href="/terms-of-use">{legal.termsOfUse}</Link>
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
        <div className="space-y-4">
          <p className="font-semibold text-slate-950 dark:text-slate-50">
            {locale === "uz" ? "Aloqa va ijtimoiy tarmoqlar" : locale === "ru" ? "Контакты и соцсети" : "Contact & socials"}
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://www.instagram.com/zentrip_uz?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Zentrip Instagram"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-transparent bg-[linear-gradient(135deg,#feda75_0%,#fa7e1e_28%,#d62976_58%,#962fbf_82%,#4f5bd5_100%)] text-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:brightness-110 dark:ring-white/10"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://t.me/zentrip_uz"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Zentrip Telegram"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-transparent bg-sky-500 text-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:bg-sky-400 dark:bg-sky-500 dark:ring-white/10 dark:hover:bg-sky-400"
            >
              <Send className="h-5 w-5" />
            </a>
            <a
              href="mailto:zokirovnomonxon@icloud.com"
              aria-label="Email Zentrip"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-200 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-50"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
