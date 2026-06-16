import Link from "next/link";
import { differenceInCalendarDays } from "date-fns";
import { Building2, MapPinned, Plane, Sparkles, Truck, WalletCards } from "lucide-react";

import { CarCard } from "@/components/car-card";
import { CarNameSearch } from "@/components/car-name-search";
import { EmptyState } from "@/components/empty-state";
import { FilterDisclosure } from "@/components/filter-disclosure";
import { QuickFilterChips } from "@/components/quick-filter-chips";
import {
  CITIES,
  categoryOptions,
  fuelTypeOptions,
  transmissionOptions,
} from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";
import {
  getCategoryLabel,
  getCurrentLocale,
  getDictionary,
  getFuelTypeLabel,
  getTransmissionLabel,
  type Locale,
} from "@/lib/i18n";
import { type SearchFilter, searchVehicles } from "@/lib/queries";
import { normalizeCityParam, parseDateParam } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [currentUser, locale] = await Promise.all([getCurrentUser(), getCurrentLocale()]);
  const labels = getDictionary(locale);

  const rawCity = asString(params.city);
  const rawLocation = asString(params.location) || rawCity;
  const rawStartDate = asString(params.startDate);
  const rawEndDate = asString(params.endDate);
  const rawFromDate = asString(params.fromDate) || rawStartDate;
  const rawUntilDate = asString(params.untilDate) || rawEndDate;
  const rawFromTime = asString(params.fromTime);
  const rawUntilTime = asString(params.untilTime);
  const q = asString(params.q).trim();
  const filter = normalizeFilter(asString(params.filter));
  const location = normalizeCityParam(rawLocation) ?? rawLocation;
  const parsedStartDate = parseDateParam(rawFromDate);
  const parsedEndDate = parseDateParam(rawUntilDate);
  const minPrice = asNumber(params.minPrice);
  const maxPrice = asNumber(params.maxPrice);
  const category = asString(params.category);
  const transmission = asString(params.transmission);
  const fuelType = asString(params.fuelType);
  const seats = asNumber(params.seats);
  const sort = (asString(params.sort) as "price-asc" | "price-desc" | "rating" | "newest") || "newest";
  const searchValidationMessage = getSearchValidationMessage(locale, {
    startDate: rawFromDate,
    endDate: rawUntilDate,
    parsedStartDate,
    parsedEndDate,
  });
  const startDate = searchValidationMessage ? undefined : parsedStartDate;
  const endDate = searchValidationMessage ? undefined : parsedEndDate;

  const vehicles = await searchVehicles({
    location,
    city: rawCity,
    q,
    startDate,
    endDate,
    minPrice,
    maxPrice,
    category,
    transmission,
    fuelType,
    seats,
    sort,
    filter,
    userId: currentUser?.id,
  });

  const filterChips = [
    {
      key: "all",
      label: labels.quickAll,
      href: buildSearchHref(params, { filter: "" }),
      icon: <Sparkles className="h-4 w-4" />,
      active: filter === "all",
    },
    {
      key: "airports",
      label: labels.quickAirports,
      href: buildSearchHref(params, { filter: "airports" }),
      icon: <Plane className="h-4 w-4" />,
      active: filter === "airports",
    },
    {
      key: "monthly",
      label: labels.quickMonthly,
      href: buildSearchHref(params, { filter: "monthly" }),
      icon: <WalletCards className="h-4 w-4" />,
      active: filter === "monthly",
    },
    {
      key: "nearby",
      label: labels.quickNearby,
      href: buildSearchHref(params, { filter: "nearby" }),
      icon: <MapPinned className="h-4 w-4" />,
      active: filter === "nearby",
    },
    {
      key: "delivered",
      label: labels.quickDelivered,
      href: buildSearchHref(params, { filter: "delivered" }),
      icon: <Truck className="h-4 w-4" />,
      active: filter === "delivered",
    },
    {
      key: "cities",
      label: labels.quickCities,
      href: buildSearchHref(params, { filter: "cities" }),
      icon: <Building2 className="h-4 w-4" />,
      active: filter === "cities",
    },
  ];

  const groupedVehicles = groupVehiclesByCity(vehicles);
  const resultHref = (vehicleId: string) => buildSearchHref(params, {}, `/cars/${vehicleId}`);
  const showMonthlyPricing = filter === "monthly";
  const carsFoundLabel =
    locale === "en"
      ? `${vehicles.length} ${vehicles.length === 1 ? labels.carsFoundSingular : labels.carsFoundPlural}`
      : `${vehicles.length} ${labels.carsFoundPlural}`;

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[290px_1fr] lg:px-8">
      <aside className="surface-card h-fit rounded-[2rem] p-4 sm:p-6 dark:bg-slate-900">
        <div className="hidden lg:block">
          <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50">{labels.searchCarsTitle}</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{labels.searchCarsDescription}</p>
        </div>
        <FilterDisclosure label={labels.filter}>
        <form className="space-y-4 lg:mt-6">
          <Field label={labels.whereLabel}>
            <input
              name="location"
              list="search-page-cities"
              defaultValue={location}
              placeholder={labels.wherePlaceholder}
              className="input"
            />
            <datalist id="search-page-cities">
              {CITIES.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={labels.fromDate}>
              <input name="fromDate" type="date" defaultValue={rawFromDate} className="input" />
            </Field>
            <Field label={labels.fromTime}>
              <input name="fromTime" type="time" defaultValue={rawFromTime} className="input" />
            </Field>
            <Field label={labels.untilDate}>
              <input name="untilDate" type="date" defaultValue={rawUntilDate} className="input" />
            </Field>
            <Field label={labels.untilTime}>
              <input name="untilTime" type="time" defaultValue={rawUntilTime} className="input" />
            </Field>
          </div>
          <input type="hidden" name="filter" value={filter === "all" ? "" : filter} />
          {q ? <input type="hidden" name="q" value={q} /> : null}
          <Field label={labels.minPrice}>
            <input name="minPrice" type="number" defaultValue={minPrice ?? ""} className="input" />
          </Field>
          <Field label={labels.maxPrice}>
            <input name="maxPrice" type="number" defaultValue={maxPrice ?? ""} className="input" />
          </Field>
          <Field label={labels.category}>
            <select name="category" defaultValue={category} className="input">
              <option value="">{labels.any}</option>
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {getCategoryLabel(locale, option)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={labels.transmission}>
            <select name="transmission" defaultValue={transmission} className="input">
              <option value="">{labels.any}</option>
              {transmissionOptions.map((option) => (
                <option key={option} value={option}>
                  {getTransmissionLabel(locale, option)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={labels.fuelType}>
            <select name="fuelType" defaultValue={fuelType} className="input">
              <option value="">{labels.any}</option>
              {fuelTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {getFuelTypeLabel(locale, option)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={labels.minimumSeats}>
            <input name="seats" type="number" defaultValue={seats ?? ""} className="input" />
          </Field>
          <Field label={labels.sortBy}>
            <select name="sort" defaultValue={sort} className="input">
              <option value="newest">{labels.newest}</option>
              <option value="price-asc">{labels.priceLowToHigh}</option>
              <option value="price-desc">{labels.priceHighToLow}</option>
              <option value="rating">{labels.highestRating}</option>
            </select>
          </Field>
          <button type="submit" className="btn-primary w-full rounded-2xl px-5 py-3 font-semibold transition">
            {labels.applyFilters}
          </button>
        </form>
        </FilterDisclosure>
      </aside>

      <section className="space-y-6">
        <div className="space-y-5">
          <div className="grid items-start gap-4 lg:grid-cols-[1fr_minmax(360px,520px)_160px] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">
                {labels.searchResults}
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">
                {carsFoundLabel}
              </h2>
              {searchValidationMessage ? (
                <p className="mt-2 text-sm font-medium text-amber-700 dark:text-amber-300">{searchValidationMessage}</p>
              ) : null}
              {!searchValidationMessage && startDate && endDate ? (
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {labels.activeCarsShown}
                </p>
              ) : null}
            </div>
            <div className="w-full">
              <CarNameSearch placeholder={labels.searchByCarName} />
            </div>
            <div className="flex lg:justify-end">
              <Link
                href="/"
                className="whitespace-nowrap text-sm font-semibold text-slate-950 transition hover:text-slate-700 dark:text-slate-50 dark:hover:text-slate-300"
              >
                {labels.backToHome}
              </Link>
            </div>
          </div>

          <QuickFilterChips items={filterChips} />
        </div>

        {vehicles.length ? (
          filter === "cities" ? (
            <div className="space-y-8">
              {groupedVehicles.map(([cityName, cityVehicles]) => (
                <section key={cityName} className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50">{cityName}</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {cityVehicles.length} {cityVehicles.length === 1 ? labels.liveListingSingular : labels.liveListingPlural}
                      </p>
                    </div>
                    <Link
                      href={buildSearchHref(params, { location: cityName, filter: "" })}
                      className="text-sm font-semibold text-sky-600 dark:text-sky-400"
                    >
                      {labels.seeOnly} {cityName}
                    </Link>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {cityVehicles.map((vehicle) => (
                      <CarCard
                        key={vehicle.id}
                        vehicle={vehicle}
                        href={resultHref(vehicle.id)}
                        isAuthenticated={Boolean(currentUser)}
                        showMonthlyPricing={showMonthlyPricing}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {vehicles.map((vehicle) => (
                <CarCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  href={resultHref(vehicle.id)}
                  isAuthenticated={Boolean(currentUser)}
                  showMonthlyPricing={showMonthlyPricing}
                />
              ))}
            </div>
          )
        ) : (
          <EmptyState
            title={labels.noMatchingCarsFound}
            description={
              searchValidationMessage
                ? labels.updateTripDates
                : q
                  ? labels.noCarsForSearch
                  : labels.broaderSearchPrompt
            }
            action={
              <Link
                href="/search"
                className="btn-primary inline-flex rounded-full px-5 py-3 text-sm font-semibold transition"
              >
                {labels.resetSearch}
              </Link>
            }
          />
        )}
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>
      {children}
    </label>
  );
}

function asString(value?: string | string[]) {
  return typeof value === "string" ? value : "";
}

function asNumber(value?: string | string[]) {
  const source = asString(value);
  if (!source) {
    return undefined;
  }
  const parsed = Number(source);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeFilter(value: string): SearchFilter {
  if (
    value === "airports" ||
    value === "monthly" ||
    value === "nearby" ||
    value === "delivered" ||
    value === "cities"
  ) {
    return value;
  }

  return "all";
}

function getSearchValidationMessage(
  locale: Locale,
  params: {
    startDate?: string;
    endDate?: string;
    parsedStartDate?: Date;
    parsedEndDate?: Date;
  },
) {
  const labels = getDictionary(locale);

  if (params.startDate && !params.parsedStartDate) {
    return labels.invalidStartDate;
  }

  if (params.endDate && !params.parsedEndDate) {
    return labels.invalidEndDate;
  }

  if (params.parsedStartDate && params.parsedEndDate && params.parsedEndDate <= params.parsedStartDate) {
    return labels.invalidDateRange;
  }

  if (
    params.parsedStartDate &&
    params.parsedEndDate &&
    differenceInCalendarDays(params.parsedEndDate, params.parsedStartDate) > 30
  ) {
    return labels.invalidTripLength;
  }

  return undefined;
}

function buildSearchHref(
  params: Record<string, string | string[] | undefined>,
  overrides: Record<string, string>,
  pathname = "/search",
) {
  const nextParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && value) {
      nextParams.set(key, value);
    }
  }

  for (const [key, value] of Object.entries(overrides)) {
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
  }

  const query = nextParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function groupVehiclesByCity<
  T extends {
    city: string;
  },
>(vehicles: T[]) {
  const grouped = vehicles.reduce<Record<string, T[]>>((summary, vehicle) => {
    summary[vehicle.city] = [...(summary[vehicle.city] ?? []), vehicle];
    return summary;
  }, {});

  return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
}
