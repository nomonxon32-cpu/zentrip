import Link from "next/link";
import { Role } from "@prisma/client";

import { AccountSettingsSection } from "@/components/account-settings-section";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireRole } from "@/lib/auth";
import { getCurrentLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [user, locale] = await Promise.all([requireRole(Role.ADMIN), getCurrentLocale()]);
  const title = locale === "uz" ? "Admin sozlamalari" : locale === "ru" ? "Настройки админа" : "Admin settings";
  const description =
    locale === "uz"
      ? "Admin profilingizni yangilang va platformadagi tezkor boshqaruv havolalariga qayting."
      : locale === "ru"
        ? "Обновляйте профиль администратора и быстро переходите к ключевым разделам управления платформой."
        : "Update your admin profile and keep the main moderation shortcuts within reach.";

  const cards = [
    {
      href: "/admin/users",
      title: locale === "uz" ? "Foydalanuvchilar" : locale === "ru" ? "Пользователи" : "Users",
      body:
        locale === "uz"
          ? "Hisoblar, rollar va cheklovlarni boshqaring."
          : locale === "ru"
            ? "Управляйте аккаунтами, ролями и ограничениями."
            : "Manage accounts, roles, and suspensions.",
    },
    {
      href: "/admin/kyc",
      title: "KYC",
      body:
        locale === "uz"
          ? "Tasdiqlanmagan hujjatlarni ko'rib chiqing."
          : locale === "ru"
            ? "Проверяйте ожидающие документы."
            : "Review pending verification documents.",
    },
    {
      href: "/admin/listings",
      title: locale === "uz" ? "E'lonlar" : locale === "ru" ? "Объявления" : "Listings",
      body:
        locale === "uz"
          ? "Yangi avtomobillarni tasdiqlang yoki rad eting."
          : locale === "ru"
            ? "Одобряйте или отклоняйте новые автомобили."
            : "Approve or reject new vehicle submissions.",
    },
    {
      href: "/admin/disputes",
      title: locale === "uz" ? "Nizolar" : locale === "ru" ? "Споры" : "Disputes",
      body:
        locale === "uz"
          ? "Ochiq muammolar va eskalatsiyalarni yoping."
          : locale === "ru"
            ? "Закрывайте открытые проблемы и эскалации."
            : "Resolve open issues and escalations quickly.",
    },
  ];

  return (
    <AdminShell currentPath="/admin/settings" title={title} description={description}>
      <AccountSettingsSection
        user={{
          name: user.name,
          email: user.email,
          phone: user.phone,
          city: user.city,
          role: user.role,
          kycStatus: user.kycStatus,
          isSuspended: user.isSuspended,
        }}
      />

      <div className="grid gap-5 md:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="surface-card rounded-[2rem] p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10 dark:bg-slate-900"
          >
            <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">{card.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{card.body}</p>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
