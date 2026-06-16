"use client";

import Link from "next/link";
import { Sparkles, Star, Users } from "lucide-react";

import { FavoriteButton } from "@/components/favorite-button";
import { useLocale } from "@/components/providers";
import { StatusBadge } from "@/components/status-badge";
import {
  getCategoryLabel,
  getFeatureLabel,
  getFuelTypeLabel,
  getTransmissionLabel,
} from "@/lib/i18n-dictionary";
import { getVehicleMonthlyPrice } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";

type CarCardProps = {
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    city: string;
    category: string;
    transmission: string;
    fuelType: string;
    seats: number;
    dailyPrice: number;
    monthlyPrice?: number | null;
    depositAmount: number;
    status: string;
    airportPickupAvailable: boolean;
    deliveryAvailable: boolean;
    monthlyAvailable: boolean;
    instantBook: boolean;
    photos: Array<{ url: string }>;
    averageRating?: number;
    reviewCount?: number;
    owner: {
      name: string;
      city: string;
    };
    isAvailable?: boolean;
    isFavorited?: boolean;
  };
  href?: string;
  isAuthenticated?: boolean;
  showMonthlyPricing?: boolean;
};

export function CarCard({
  vehicle,
  href = `/cars/${vehicle.id}`,
  isAuthenticated = false,
  showMonthlyPricing = false,
}: CarCardProps) {
  const { locale, labels } = useLocale();
  const cover = vehicle.photos[0]?.url ?? "/cars/default-car.jpg";
  const useMonthlyPrice = showMonthlyPricing && vehicle.monthlyAvailable;
  const displayPrice = useMonthlyPrice
    ? getVehicleMonthlyPrice(vehicle.dailyPrice, vehicle.monthlyPrice)
    : vehicle.dailyPrice;
  const priceSuffix =
    useMonthlyPrice
      ? locale === "uz"
        ? "oyiga"
        : locale === "ru"
          ? "в месяц"
          : "per month"
      : labels.perDay;

  return (
    <div className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-900">
        <Link href={href} className="absolute inset-0 z-0" aria-label={`${vehicle.make} ${vehicle.model}`} />
        <img
          src={cover}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute left-4 top-4 z-10">
          <StatusBadge value={vehicle.isAvailable === false ? "UNAVAILABLE" : vehicle.status} />
        </div>
        <div className="absolute right-4 top-4 z-10">
          <FavoriteButton
            vehicleId={vehicle.id}
            initialFavorite={vehicle.isFavorited}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>

      <div className="space-y-4 p-5">
        <Link href={href} className="block space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-black tracking-tight text-slate-950 dark:text-slate-50">
                {vehicle.make} {vehicle.model}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {vehicle.year} / {vehicle.city}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-slate-950 dark:text-slate-50">{formatCurrency(displayPrice)}</p>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{priceSuffix}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
              {getCategoryLabel(locale, vehicle.category)}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
              {getTransmissionLabel(locale, vehicle.transmission)}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
              {getFuelTypeLabel(locale, vehicle.fuelType)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
              <Users className="h-3 w-3" /> {vehicle.seats} {labels.seats}
            </span>
            {vehicle.deliveryAvailable ? <FeatureBadge label={getFeatureLabel(locale, "delivery")} /> : null}
            {vehicle.airportPickupAvailable ? <FeatureBadge label={getFeatureLabel(locale, "airportPickup")} /> : null}
            {vehicle.monthlyAvailable ? <FeatureBadge label={getFeatureLabel(locale, "monthly")} /> : null}
            {vehicle.instantBook ? <FeatureBadge label={getFeatureLabel(locale, "instant")} /> : null}
          </div>

          <div className="flex items-center justify-between text-sm">
            {vehicle.reviewCount && vehicle.reviewCount > 0 ? (
              <div className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold">{vehicle.averageRating?.toFixed(1)}</span>
                <span className="text-slate-400 dark:text-slate-500">({vehicle.reviewCount})</span>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                <Sparkles className="h-3 w-3" />
                {labels.newLabel}
              </span>
            )}
            <p className="text-slate-500 dark:text-slate-400">
              {labels.deposit} {formatCurrency(vehicle.depositAmount)}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

function FeatureBadge({ label }: { label: string }) {
  return <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700 dark:bg-sky-950 dark:text-sky-300">{label}</span>;
}
