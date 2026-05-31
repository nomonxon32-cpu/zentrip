import { Role } from "@prisma/client";

import { AdminShell } from "@/components/admin/admin-shell";
import { DisputeActions } from "@/components/admin/dispute-actions";
import { StatusBadge } from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AdminDisputesPage() {
  await requireRole(Role.ADMIN);
  const locale = await getCurrentLocale();
  const labels = getDictionary(locale);
  const disputes = await db.dispute.findMany({
    include: {
      booking: {
        include: {
          vehicle: true,
        },
      },
      openedBy: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminShell
      currentPath="/admin/disputes"
      title={labels.disputes}
      description={labels.disputesDescription}
    >
      <div className="grid gap-6">
        {disputes.map((dispute) => (
          <div key={dispute.id} className="surface-card grid gap-6 rounded-[2rem] p-6 dark:bg-slate-900 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-3">
              <StatusBadge value={dispute.status} />
              <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50">{dispute.reason}</h2>
              <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{dispute.description}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {labels.openedBy} {dispute.openedBy.name} - {dispute.booking.vehicle.make} {dispute.booking.vehicle.model}
              </p>
            </div>
            <DisputeActions disputeId={dispute.id} />
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
