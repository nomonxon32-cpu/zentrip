import Link from "next/link";
import { Role } from "@prisma/client";

import { AccountSettingsSection } from "@/components/account-settings-section";
import { DashboardShell } from "@/components/dashboard-shell";
import { getRoleHomePath, requireMarketplaceUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";
import { getOwnerDashboardLinks } from "@/lib/owner-navigation";
import { getRenterDashboardLinks } from "@/lib/renter-navigation";

export const dynamic = "force-dynamic";

export default async function DashboardSettingsPage() {
  const [user, locale] = await Promise.all([requireMarketplaceUser(), getCurrentLocale()]);
  const labels = getDictionary(locale);
  const bookingsCountPromise =
    user.role === Role.RENTER
      ? db.booking.count({ where: { renterId: user.id } })
      : db.booking.count({ where: { ownerId: user.id } });
  const listingsCountPromise =
    user.role === Role.OWNER ? db.vehicle.count({ where: { ownerId: user.id } }) : Promise.resolve(0);

  const [bookingsCount, listingsCount] = await Promise.all([bookingsCountPromise, listingsCountPromise]);
  const title = locale === "uz" ? "Hisob sozlamalari" : locale === "ru" ? "Настройки аккаунта" : "Account settings";
  const description =
    locale === "uz"
      ? "Profil ma'lumotlarini yangilang, xavfsizlik sozlamalarini boshqaring va hisob holatini kuzating."
      : locale === "ru"
        ? "Обновляйте данные профиля, управляйте безопасностью и следите за статусом аккаунта."
        : "Update your profile, manage account security, and keep an eye on your verification status.";
  const links =
    user.role === Role.OWNER
      ? getOwnerDashboardLinks("settings", locale)
      : getRenterDashboardLinks("settings", locale);

  return (
    <DashboardShell title={title} description={description} links={links}>
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

      <section className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
        <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">{labels.quickActions}</h2>
        <div className="mt-5 grid gap-4">
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              {locale === "uz" ? "Asosiy manzil" : locale === "ru" ? "Основной раздел" : "Primary workspace"}
            </p>
            <p className="mt-2 text-lg font-black tracking-tight text-slate-950 dark:text-slate-50">
              {user.role === Role.OWNER ? labels.ownerDashboard : labels.renterDashboard}
            </p>
            <Link href={getRoleHomePath(user.role)} className="mt-4 inline-flex text-sm font-semibold text-sky-600 dark:text-sky-400">
              {labels.backToDashboard}
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Info
              label={user.role === Role.OWNER ? labels.listings : labels.myBookings}
              value={String(user.role === Role.OWNER ? listingsCount : bookingsCount)}
            />
            <Info label={labels.bookings} value={String(bookingsCount)} />
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/kyc" className="btn-primary rounded-full px-4 py-2 text-sm font-semibold transition">
              {labels.updateKyc}
            </Link>
            {user.role === Role.OWNER ? (
              <Link href="/dashboard/owner/listings/new" className="btn-secondary rounded-full px-4 py-2 text-sm font-semibold transition">
                {labels.addNewCar}
              </Link>
            ) : (
              <Link href="/search" className="btn-secondary rounded-full px-4 py-2 text-sm font-semibold transition">
                {labels.browseCars}
              </Link>
            )}
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-2 break-words font-semibold text-slate-950 dark:text-slate-50">{value}</p>
    </div>
  );
}
