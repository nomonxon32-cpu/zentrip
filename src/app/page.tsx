import Link from "next/link";
import { Building2, MapPinned, Plane, Sparkles, Truck, WalletCards } from "lucide-react";

import { FeaturedVehiclesStrip } from "@/components/featured-vehicles-strip";
import { QuickFilterChips } from "@/components/quick-filter-chips";
import { SearchBar } from "@/components/search-bar";
import { getCurrentUser } from "@/lib/auth";
import { CITIES } from "@/lib/constants";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";
import { getCityBrowseSummary, getFeaturedVehicles } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [currentUser, locale] = await Promise.all([getCurrentUser(), getCurrentLocale()]);
  const labels = getDictionary(locale);
  const [featuredVehicles, cityBrowseSummary] = await Promise.all([
    getFeaturedVehicles({ city: "Tashkent", userId: currentUser?.id, limit: 6 }),
    getCityBrowseSummary(),
  ]);

  const quickFilters = [
    {
      key: "all",
      label: labels.quickAll,
      href: "/search",
      icon: <Sparkles className="h-4 w-4" />,
      active: true,
    },
    {
      key: "airports",
      label: labels.quickAirports,
      href: "/search?filter=airports",
      icon: <Plane className="h-4 w-4" />,
    },
    {
      key: "monthly",
      label: labels.quickMonthly,
      href: "/search?filter=monthly",
      icon: <WalletCards className="h-4 w-4" />,
    },
    {
      key: "nearby",
      label: labels.quickNearby,
      href: "/search?filter=nearby",
      icon: <MapPinned className="h-4 w-4" />,
    },
    {
      key: "delivered",
      label: labels.quickDelivered,
      href: "/search?filter=delivered",
      icon: <Truck className="h-4 w-4" />,
    },
    {
      key: "cities",
      label: labels.quickCities,
      href: "/search?filter=cities",
      icon: <Building2 className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      <section className="mx-auto w-full max-w-[1400px] px-4 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(135deg,#020617_0%,#0f172a_46%,#334155_100%)] px-6 py-8 text-white shadow-2xl shadow-slate-950/15 dark:border-slate-800 sm:px-10 sm:py-10 lg:px-14 lg:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_34%)]" />
          <div className="absolute -left-24 top-10 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl" />
          <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-white/8 blur-3xl" />

          <div className="relative mx-auto flex min-h-[360px] max-w-5xl flex-col items-center justify-center text-center sm:min-h-[390px] lg:min-h-[410px]">
            <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-tight text-white sm:text-6xl">
              {labels.heroTitle}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-100 sm:text-lg">
              {labels.heroSubtitle}
            </p>
          </div>

          <div className="relative z-10 mx-auto mt-2 max-w-6xl">
            <SearchBar
              whereLabel={labels.whereLabel}
              wherePlaceholder={labels.wherePlaceholder}
              fromDateLabel={labels.fromDate}
              fromTimeLabel={labels.time}
              untilDateLabel={labels.untilDate}
              untilTimeLabel={labels.time}
              searchLabel={labels.searchAction}
            />
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <QuickFilterChips items={quickFilters} />
        </div>
      </section>

      <section id="why-zentrip" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <FeaturedVehiclesStrip
          title={labels.newerCarsTitle}
          subtitle={labels.newerCarsSubtitle}
          viewAllHref="/search?location=Tashkent"
          ctaLabel={labels.exploreAll}
          vehicles={featuredVehicles}
          isAuthenticated={Boolean(currentUser)}
        />
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">
              {labels.cityDiscovery}
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">
              {labels.browseByCity}
            </h2>
          </div>
          <Link href="/search?filter=cities" className="text-sm font-semibold text-sky-600 dark:text-sky-400">
            {labels.viewCityResults}
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CITIES.map((city) => {
            const count = cityBrowseSummary.find((entry) => entry.city === city)?.count ?? 0;
            return (
              <Link
                key={city}
                href={`/search?location=${encodeURIComponent(city)}`}
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50">{city}</h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      {count} {count === 1 ? labels.liveListingSingular : labels.liveListingPlural}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                    {labels.browse}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
