import { Role } from "@prisma/client";
import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { BackButton } from "@/components/back-button";
import { StatusBadge } from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [, locale] = await Promise.all([requireRole(Role.ADMIN), getCurrentLocale()]);
  const labels = getDictionary(locale);
  const { id } = await params;
  const user = await db.user.findUnique({
    where: { id },
    include: {
      kycDocuments: {
        orderBy: { createdAt: "desc" },
      },
      ownedVehicles: {
        orderBy: { createdAt: "desc" },
      },
      bookingsAsRenter: {
        include: { vehicle: true },
        orderBy: { createdAt: "desc" },
      },
      bookingsAsOwner: {
        include: { vehicle: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <AdminShell
      currentPath="/admin/users"
      title={user.name}
      description="Full account context for moderation, support, and compliance review."
      backAction={<BackButton fallbackHref="/admin/users" label={labels.backToUsers} />}
    >
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <div className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
            <div className="flex flex-wrap gap-3">
              <StatusBadge value={user.role} />
              <StatusBadge value={user.kycStatus} />
              <StatusBadge value={user.isSuspended ? "SUSPENDED" : "ACTIVE"} />
            </div>
            <div className="mt-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-slate-950 dark:text-slate-50">{user.email}</p>
              <p>{user.phone}</p>
              <p>{user.city}</p>
              {user.bio ? <p>{user.bio}</p> : null}
            </div>
          </div>

          <div className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
            <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">KYC documents</h2>
            <div className="mt-4 space-y-3">
              {user.kycDocuments.length ? (
                user.kycDocuments.map((document) => (
                  <div key={document.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-950 dark:text-slate-50">{document.documentType.replaceAll("_", " ")}</p>
                      <StatusBadge value={document.status} />
                    </div>
                    {document.rejectionReason ? (
                      <p className="theme-error mt-2 text-sm">{document.rejectionReason}</p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No KYC submissions found.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
            <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">Owned vehicles</h2>
            <div className="mt-4 space-y-3">
              {user.ownedVehicles.length ? (
                user.ownedVehicles.map((vehicle) => (
                  <div key={vehicle.id} className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center dark:border-slate-700">
                    <div>
                      <p className="font-semibold text-slate-950 dark:text-slate-50">
                        {vehicle.make} {vehicle.model}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{vehicle.city}</p>
                    </div>
                    <StatusBadge value={vehicle.status} />
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No owned vehicles.</p>
              )}
            </div>
          </div>

          <div className="surface-card rounded-[2rem] p-6 dark:bg-slate-900">
            <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">Renter bookings</h2>
            <div className="mt-4 space-y-3">
              {user.bookingsAsRenter.length ? (
                user.bookingsAsRenter.map((booking) => (
                  <div key={booking.id} className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center dark:border-slate-700">
                    <div>
                      <p className="font-semibold text-slate-950 dark:text-slate-50">
                        {booking.vehicle.make} {booking.vehicle.model}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{booking.totalAmount.toLocaleString("en-US")} UZS</p>
                    </div>
                    <StatusBadge value={booking.status} />
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No renter bookings.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
