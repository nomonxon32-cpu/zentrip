import Link from "next/link";
import { Role } from "@prisma/client";

import { AdminShell } from "@/components/admin/admin-shell";
import { UserSuspendButton } from "@/components/admin/user-suspend-button";
import { DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentLocale, getDictionary, getRoleLabel } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole(Role.ADMIN);
  const [params, locale] = await Promise.all([searchParams, getCurrentLocale()]);
  const labels = getDictionary(locale);
  const q = typeof params.q === "string" ? params.q : "";
  const role = typeof params.role === "string" ? params.role : "";

  const users = await db.user.findMany({
    where: {
      role: role ? (role as Role) : undefined,
      OR: q
        ? [{ name: { contains: q } }, { email: { contains: q } }, { city: { contains: q } }]
        : undefined,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminShell
      currentPath="/admin/users"
      title={labels.users}
      description={
        locale === "uz"
          ? "Marketplace akkauntlarini qidiring, filtrlash, to'xtatish va ko'rib chiqing."
          : locale === "ru"
            ? "Ищите, фильтруйте, блокируйте и проверяйте аккаунты маркетплейса."
            : "Search, filter, suspend, and review marketplace accounts."
      }
    >
      <form className="surface-card grid gap-3 rounded-[2rem] p-5 dark:bg-slate-900 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_180px_auto] sm:p-6">
        <input name="q" defaultValue={q} placeholder={labels.searchUsers} className="input" />
        <select name="role" defaultValue={role} className="input sm:min-w-0">
          <option value="">{labels.allRoles}</option>
          {Object.values(Role).map((option) => (
            <option key={option} value={option}>
              {getRoleLabel(locale, option)}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-primary rounded-2xl px-5 py-3 font-semibold transition sm:col-span-2 xl:col-span-1">
          {labels.filter}
        </button>
      </form>

      {users.length ? (
        <>
          <div className="space-y-4 lg:hidden">
            {users.map((user) => (
              <div key={user.id} className="surface-card rounded-[2rem] p-5 dark:bg-slate-900">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-950 dark:text-slate-50">{user.name}</p>
                    <p className="mt-1 break-words text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{user.phone}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge value={user.role} />
                    <StatusBadge value={user.kycStatus} />
                    <StatusBadge value={user.isSuspended ? "SUSPENDED" : "ACTIVE"} />
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <InfoRow label={labels.city} value={user.city} />
                  <InfoRow label={labels.roleLabel} value={getRoleLabel(locale, user.role)} />
                </div>

                <div className="mt-4 grid gap-3">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="btn-secondary inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition"
                  >
                    {labels.view}
                  </Link>
                  <UserSuspendButton userId={user.id} isSuspended={user.isSuspended} />
                </div>
              </div>
            ))}
          </div>

          <div className="hidden lg:block">
            <DataTable
              columns={[labels.users, labels.roleLabel, labels.kyc, labels.city, labels.account, labels.actions]}
              rows={users.map((user) => [
                <div key={`${user.id}-user`} className="space-y-1">
                  <p className="font-semibold text-slate-950 dark:text-slate-50">{user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user.phone}</p>
                </div>,
                <StatusBadge key={`${user.id}-role`} value={user.role} />,
                <StatusBadge key={`${user.id}-kyc`} value={user.kycStatus} />,
                <span key={`${user.id}-city`} className="text-slate-700 dark:text-slate-300">{user.city}</span>,
                <StatusBadge key={`${user.id}-suspend`} value={user.isSuspended ? "SUSPENDED" : "ACTIVE"} />,
                <div key={`${user.id}-action`} className="flex flex-wrap gap-2">
                  <Link href={`/admin/users/${user.id}`} className="btn-secondary rounded-full px-4 py-2 text-sm font-semibold transition">
                    {labels.view}
                  </Link>
                  <UserSuspendButton userId={user.id} isSuspended={user.isSuspended} />
                </div>,
              ])}
            />
          </div>
        </>
      ) : (
        <EmptyState
          title={labels.noResults}
          description={
            locale === "uz"
              ? "Qidiruv yoki rol filtrlari bo'yicha foydalanuvchilar topilmadi."
              : locale === "ru"
                ? "По текущему поиску или фильтру ролей пользователи не найдены."
                : "No users matched the current search or role filter."
          }
        />
      )}
    </AdminShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-2 break-words font-semibold text-slate-950 dark:text-slate-50">{value}</p>
    </div>
  );
}
