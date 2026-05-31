import Link from "next/link";

import { CarCard } from "@/components/car-card";

type VehicleCardProps = Parameters<typeof CarCard>[0]["vehicle"];

export function FeaturedVehiclesStrip({
  title,
  subtitle,
  viewAllHref,
  ctaLabel = "Explore all",
  vehicles,
  isAuthenticated = false,
}: {
  title: string;
  subtitle: string;
  viewAllHref: string;
  ctaLabel?: string;
  vehicles: VehicleCardProps[];
  isAuthenticated?: boolean;
}) {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">{title}</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <Link href={viewAllHref} className="text-sm font-semibold text-sky-600 dark:text-sky-400">
          {ctaLabel}
        </Link>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-5">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="w-[300px] shrink-0 sm:w-[320px]">
              <CarCard vehicle={vehicle} isAuthenticated={isAuthenticated} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
