import { KycStatus, Role } from "@prisma/client";

import { BackButton } from "@/components/back-button";
import { EmptyState } from "@/components/empty-state";
import { VehicleForm } from "@/components/forms/vehicle-form";
import { requireRole } from "@/lib/auth";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function NewListingPage() {
  const [user, locale] = await Promise.all([requireRole(Role.OWNER), getCurrentLocale()]);
  const labels = getDictionary(locale);

  if (user.kycStatus !== KycStatus.APPROVED) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <EmptyState
          title="KYC approval required"
          description="Owners must complete and pass KYC before submitting active marketplace listings for review."
          action={<a href="/dashboard/kyc" className="btn-primary rounded-full px-5 py-3 text-sm font-semibold transition">Go to KYC</a>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton fallbackHref="/dashboard/owner/listings" label={labels.backToListings} />
      </div>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">Owner listing</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">Create a new vehicle listing</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Upload multiple photos, confirm OSAGO coverage, set pricing, and add unavailable date blocks before admin review.
        </p>
      </div>
      <VehicleForm mode="create" />
    </div>
  );
}
