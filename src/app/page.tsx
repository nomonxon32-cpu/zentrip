import Link from "next/link";
import { Role } from "@prisma/client";
import { ArrowRight, Building2, Check, Plane, Sparkles, Truck, WalletCards } from "lucide-react";
import { redirect } from "next/navigation";

import { FeaturedVehiclesStrip } from "@/components/featured-vehicles-strip";
import { QuickFilterChips } from "@/components/quick-filter-chips";
import { SearchBar } from "@/components/search-bar";
import { getCurrentUser, getRoleHomePath } from "@/lib/auth";
import { CITIES } from "@/lib/constants";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";
import { getPartnerBandContent } from "@/lib/marketing";
import { getCityBrowseSummary, getFeaturedVehicles } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [currentUser, locale] = await Promise.all([getCurrentUser(), getCurrentLocale()]);

  if (currentUser?.role === Role.ADMIN || currentUser?.role === Role.OWNER) {
    redirect(getRoleHomePath(currentUser.role));
  }

  const labels = getDictionary(locale);
  const partnerBand = getPartnerBandContent(locale);
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
    <div className="space-y-16 pb-16 sm:space-y-20 sm:pb-20">
      <section className="mx-auto w-full max-w-[1400px] px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pt-10">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(135deg,#020617_0%,#0f172a_46%,#334155_100%)] px-5 py-6 text-white shadow-2xl shadow-slate-950/15 dark:border-slate-800 sm:px-10 sm:py-10 lg:px-14 lg:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_34%)]" />
          <div className="absolute -left-24 top-10 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl" />
          <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-white/8 blur-3xl" />

          <div className="relative mx-auto flex min-h-[240px] max-w-5xl flex-col items-center justify-center text-center sm:min-h-[360px] lg:min-h-[410px]">
            <h1 className="max-w-3xl text-3xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {labels.heroTitle}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-100 sm:mt-5 sm:text-lg sm:leading-8">
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

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_55%,#334155_100%)] px-6 py-10 text-white shadow-xl shadow-slate-950/15 dark:border-slate-800 sm:px-10 lg:px-14 lg:py-14">
          <div className="absolute -right-20 -top-16 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">{partnerBand.eyebrow}</p>
              <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl">{partnerBand.title}</h2>
              <p className="mt-4 max-w-xl text-base leading-8 text-slate-200">{partnerBand.subtitle}</p>
              <ul className="mt-6 space-y-3">
                {partnerBand.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3 text-sm text-slate-100">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/host"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-slate-950/20 transition hover:bg-slate-100"
                >
                  {partnerBand.primaryCta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/host#how-it-works"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/30 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  {partnerBand.secondaryCta}
                </Link>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {partnerBand.stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur">
                  <p className="text-3xl font-black tracking-tight">{stat.value}</p>
                  <p className="mt-1 text-sm text-slate-200">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
