"use client";

import Link from "next/link";
import { KycStatus, Role } from "@prisma/client";
import { ChevronDown, CircleUserRound, LogOut } from "lucide-react";

import { useLocale } from "@/components/providers";
import type { DropdownStats } from "@/lib/dropdown-stats";
import { getRoleLabel, getStatusLabel } from "@/lib/i18n-dictionary";
import { formatCurrency } from "@/lib/utils";

type UserMenuProps = {
  user: {
    id: string;
    name: string;
    role: Role;
    kycStatus: KycStatus;
  } | null;
  stats?: DropdownStats | null;
  labels: {
    login: string;
    register: string;
    dashboard: string;
    admin: string;
    logout: string;
  };
};

export function UserMenu({
  user,
  stats,
  labels,
  compact = false,
}: UserMenuProps & {
  compact?: boolean;
}) {
  const { locale, labels: localeLabels } = useLocale();
  const displayName = user?.role === Role.ADMIN ? `${localeLabels.appName} Admin` : user?.name;

  if (!user) {
    if (compact) {
      return (
        <Link
          href="/login"
          aria-label={labels.login}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-slate-700 dark:hover:bg-slate-900"
        >
          <CircleUserRound className="h-5 w-5" />
        </Link>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="rounded-full px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-100 dark:hover:bg-slate-900 dark:hover:text-slate-50"
        >
          {labels.login}
        </Link>
        <Link
          href="/register"
          className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold !text-white transition hover:bg-slate-800 hover:!text-white focus:!text-white active:!text-white dark:bg-slate-100 dark:!text-slate-950 dark:hover:bg-slate-200 dark:hover:!text-slate-950"
        >
          {labels.register}
        </Link>
      </div>
    );
  }

  return (
    <details className="group relative">
      <summary
        className={`flex cursor-pointer list-none items-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:border-sky-200 hover:shadow dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-slate-700 ${compact ? "justify-center p-3" : "gap-2 px-3 py-2 text-sm font-semibold"}`}
      >
        <CircleUserRound className="h-4 w-4 text-sky-600" />
        {!compact ? <span className="hidden sm:inline">{displayName}</span> : null}
        {!compact ? <ChevronDown className="h-4 w-4 transition group-open:rotate-180" /> : null}
      </summary>
      <div className="absolute right-0 top-14 z-40 w-80 max-w-[calc(100vw-1rem)] rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/30">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-black text-slate-950 dark:text-slate-50">{displayName}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {getRoleLabel(locale, user.role)}
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-200 dark:ring-slate-700">
              {user.role === Role.ADMIN ? getRoleLabel(locale, Role.ADMIN) : formatKycStatus(locale, user.kycStatus)}
            </span>
          </div>

          {stats ? (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {getStatItems(locale, stats).map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl bg-white px-3 py-3 ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-950 dark:text-slate-50">{item.value}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-3 space-y-1">
          {getMenuLinks(locale, user.role).map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-slate-900 dark:hover:text-slate-50"
            >
              {item.label}
            </Link>
          ))}
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-slate-900 dark:hover:text-slate-50"
            >
              <LogOut className="h-4 w-4" />
              {labels.logout}
            </button>
          </form>
        </div>
      </div>
    </details>
  );
}

function formatKycStatus(locale: "en" | "uz" | "ru", status: KycStatus) {
  if (status === KycStatus.NOT_SUBMITTED) {
    return getStatusLabel(locale, status);
  }

  return `KYC ${getStatusLabel(locale, status)}`;
}

function getStatItems(locale: "en" | "uz" | "ru", stats: DropdownStats) {
  const labels =
    locale === "uz"
      ? {
          totalSpent: "Jami xarajat",
          upcomingTrips: "Kutilayotgan safarlar",
          completedTrips: "Yakunlangan safarlar",
          savedCars: "Saqlangan avtomobillar",
          totalEarned: "Jami daromad",
          pendingRequests: "Kutilayotgan so'rovlar",
          activeListings: "Faol e'lonlar",
          pendingKyc: "Kutilayotgan KYC",
          pendingListings: "Kutilayotgan e'lonlar",
          openDisputes: "Ochiq nizolar",
          totalBookings: "Jami bronlar",
        }
      : locale === "ru"
        ? {
            totalSpent: "Всего потрачено",
            upcomingTrips: "Предстоящие поездки",
            completedTrips: "Завершенные поездки",
            savedCars: "Сохраненные авто",
            totalEarned: "Общий доход",
            pendingRequests: "Ожидающие запросы",
            activeListings: "Активные объявления",
            pendingKyc: "Ожидает KYC",
            pendingListings: "Ожидающие объявления",
            openDisputes: "Открытые споры",
            totalBookings: "Всего бронирований",
          }
        : {
            totalSpent: "Total spent",
            upcomingTrips: "Upcoming trips",
            completedTrips: "Completed trips",
            savedCars: "Saved cars",
            totalEarned: "Total earned",
            pendingRequests: "Pending requests",
            activeListings: "Active listings",
            pendingKyc: "Pending KYC",
            pendingListings: "Pending listings",
            openDisputes: "Open disputes",
            totalBookings: "Total bookings",
          };

  if ("totalSpent" in stats) {
    return [
      { label: labels.totalSpent, value: formatCurrency(stats.totalSpent) },
      { label: labels.upcomingTrips, value: String(stats.upcomingTrips) },
      { label: labels.completedTrips, value: String(stats.completedTrips) },
      { label: labels.savedCars, value: String(stats.savedCars) },
    ];
  }

  if ("totalEarned" in stats) {
    return [
      { label: labels.totalEarned, value: formatCurrency(stats.totalEarned) },
      { label: labels.pendingRequests, value: String(stats.pendingBookingRequests) },
      { label: labels.activeListings, value: String(stats.activeListings) },
      { label: labels.completedTrips, value: String(stats.completedTrips) },
    ];
  }

  return [
    { label: labels.pendingKyc, value: String(stats.pendingKyc) },
    { label: labels.pendingListings, value: String(stats.pendingListings) },
    { label: labels.openDisputes, value: String(stats.openDisputes) },
    { label: labels.totalBookings, value: String(stats.totalBookings) },
  ];
}

function getMenuLinks(locale: "en" | "uz" | "ru", role: Role) {
  const labels =
    locale === "uz"
      ? {
          adminManagement: "Admin boshqaruvi",
          kyc: "KYC",
          listings: "E'lonlar",
          bookings: "Bronlar",
          disputes: "Nizolar",
          ownerDashboard: "Egasi paneli",
          bookingRequests: "Bron so'rovlari",
          renterDashboard: "Ijarachi paneli",
          myBookings: "Bronlarim",
        }
      : locale === "ru"
        ? {
            adminManagement: "Админ-панель",
            kyc: "KYC",
            listings: "Объявления",
            bookings: "Бронирования",
            disputes: "Споры",
            ownerDashboard: "Кабинет владельца",
            bookingRequests: "Запросы на бронирование",
            renterDashboard: "Кабинет арендатора",
            myBookings: "Мои бронирования",
          }
        : {
            adminManagement: "Admin Management",
            kyc: "KYC",
            listings: "Listings",
            bookings: "Bookings",
            disputes: "Disputes",
            ownerDashboard: "Owner Dashboard",
            bookingRequests: "Booking Requests",
            renterDashboard: "Renter Dashboard",
            myBookings: "My Bookings",
          };

  if (role === Role.ADMIN) {
    return [
      { label: labels.adminManagement, href: "/admin" },
      { label: labels.kyc, href: "/admin/kyc" },
      { label: labels.listings, href: "/admin/listings" },
      { label: labels.bookings, href: "/admin/bookings" },
      { label: labels.disputes, href: "/admin/disputes" },
    ];
  }

  if (role === Role.OWNER) {
    return [
      { label: labels.ownerDashboard, href: "/dashboard/owner" },
      { label: labels.bookingRequests, href: "/dashboard/owner/bookings" },
      { label: labels.kyc, href: "/dashboard/kyc" },
    ];
  }

  return [
    { label: labels.renterDashboard, href: "/dashboard/renter" },
    { label: labels.myBookings, href: "/dashboard/renter/bookings" },
    { label: labels.kyc, href: "/dashboard/kyc" },
  ];
}
