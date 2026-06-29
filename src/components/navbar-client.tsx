"use client";

import Link from "next/link";
import { KycStatus, Role } from "@prisma/client";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import { BrandLogo } from "@/components/brand-logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/components/providers";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { getAdminNavigationLinks } from "@/lib/admin-navigation";
import type { DropdownStats } from "@/lib/dropdown-stats";
import { getOwnerDashboardLinks } from "@/lib/owner-navigation";
import { getRenterDashboardLinks } from "@/lib/renter-navigation";
import { cn } from "@/lib/utils";

type NavbarLabels = {
  appName: string;
  home: string;
  search: string;
  becomeHost: string;
  dashboard: string;
  admin: string;
  login: string;
  register: string;
  logout: string;
  trust: string;
  startHosting: string;
  hostBanner: string;
  whyChooseZentrip: string;
  peerToPeerRentals: string;
};

type NavUser = {
  id: string;
  name: string;
  role: Role;
  kycStatus: KycStatus;
} | null;

type NavbarProps = {
  user: NavUser;
  dropdownStats?: DropdownStats | null;
  labels: NavbarLabels;
  hostHref: string;
};

export function NavbarClient(props: NavbarProps) {
  const pathname = usePathname();
  const { locale } = useLocale();

  const roleLinks = getRoleTopLinks(props.user, pathname, locale, props.labels, props.hostHref);

  if (pathname === "/") {
    return <HomepageNavbar {...props} roleLinks={roleLinks} />;
  }

  return <DefaultNavbar {...props} roleLinks={roleLinks} />;
}

const menuLinkClass =
  "block whitespace-nowrap rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white";

function dashboardHref(user: NonNullable<NavUser>) {
  if (user.role === Role.ADMIN) return "/admin";
  if (user.role === Role.OWNER) return "/dashboard/owner";
  return "/dashboard/renter";
}

function homeHref(user: NavUser) {
  if (!user) return "/";
  if (user.role === Role.ADMIN) return "/admin";
  if (user.role === Role.OWNER) return "/dashboard/owner";
  return "/";
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getRoleTopLinks(
  user: NavUser,
  pathname: string,
  locale: "en" | "uz" | "ru",
  labels: Pick<NavbarLabels, "home" | "search" | "becomeHost" | "trust">,
  hostHref: string,
) {
  if (!user) {
    return [
      { href: "/", label: labels.home },
      { href: "/search", label: labels.search },
      { href: hostHref, label: labels.becomeHost },
      { href: "/trust", label: labels.trust },
    ].map((link) => ({ ...link, active: isActivePath(pathname, link.href) }));
  }

  if (user.role === Role.ADMIN) {
    return [
      ...getAdminNavigationLinks(locale),
      { href: "/admin/disputes", label: locale === "uz" ? "Nizolar" : locale === "ru" ? "Споры" : "Disputes" },
    ].map((link) => ({ ...link, active: isActivePath(pathname, link.href) }));
  }

  if (user.role === Role.OWNER) {
    return getOwnerDashboardLinks("overview", locale).map((link) => ({
      href: link.href,
      label: link.label,
      active: isActivePath(pathname, link.href),
    }));
  }

  return getRenterDashboardLinks("overview", locale).map((link) => ({
    href: link.href,
    label: link.label,
    active:
      link.href === "/search"
        ? pathname === "/search" || pathname.startsWith("/cars/") || pathname.startsWith("/checkout/")
        : isActivePath(pathname, link.href),
  }));
}

/**
 * The shared top-right action cluster. Rendered identically on every page so
 * the theme toggle, language switcher, and account menu never move position.
 *
 * - md and up: theme toggle + language switcher are inline in the header.
 * - below md: they collapse into the hamburger menu (with the nav links).
 *
 * `menuAlwaysVisible` keeps the hamburger on all widths (homepage, which has no
 * inline nav); otherwise it only shows below lg, alongside the inline nav.
 */
function NavActions({
  user,
  dropdownStats,
  labels,
  hostHref,
  showWhyChoose = false,
  menuAlwaysVisible = false,
  roleLinks,
}: NavbarProps & {
  showWhyChoose?: boolean;
  menuAlwaysVisible?: boolean;
  roleLinks: Array<{ href: string; label: string; active?: boolean }>;
}) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {showWhyChoose ? (
        <Link
          href="/#why-zentrip"
          className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900 lg:inline-flex"
        >
          {labels.whyChooseZentrip}
        </Link>
      ) : null}

      <div className="hidden items-center gap-2 sm:gap-3 md:flex">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      <UserMenu user={user} stats={dropdownStats} labels={labels} compact />

      <details className={cn("group relative", menuAlwaysVisible ? "" : "lg:hidden")}>
        <summary className="flex cursor-pointer list-none items-center justify-center rounded-full border border-slate-200 bg-white p-3 text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-slate-700 dark:hover:bg-slate-900">
          <Menu className="h-5 w-5" />
        </summary>
        <div className="absolute right-0 top-full z-40 mt-3 w-72 max-w-[calc(100vw-2rem)] rounded-3xl border border-slate-200 bg-white p-4 text-slate-950 shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:shadow-black/30">
          <div className="space-y-1">
            {roleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(menuLinkClass, link.active ? "bg-slate-950 !text-white dark:bg-white dark:!text-slate-950" : "")}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-200 pt-3 md:hidden dark:border-slate-800">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </details>
    </div>
  );
}

function HomepageNavbar({
  user,
  dropdownStats,
  labels,
  hostHref,
  roleLinks,
}: NavbarProps & {
  roleLinks: Array<{ href: string; label: string; active?: boolean }>;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/95">
      <div className="border-b border-slate-200/70 px-4 py-2 text-center sm:px-6 lg:px-8 dark:border-slate-800/70">
        <Link
          href={hostHref}
          className="text-sm font-medium text-slate-950 underline decoration-slate-300 underline-offset-4 transition hover:decoration-slate-950 dark:text-slate-100 dark:decoration-slate-700 dark:hover:decoration-slate-100"
        >
          {labels.hostBanner}
        </Link>
      </div>

      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href={homeHref(user)} aria-label={`${labels.appName} home`} className="flex items-center">
          <BrandLogo iconClassName="h-8 w-8 sm:h-9 sm:w-9" wordmarkClassName="text-lg sm:text-xl" />
        </Link>

        <NavActions
          user={user}
          dropdownStats={dropdownStats}
          labels={labels}
          hostHref={hostHref}
          showWhyChoose
          menuAlwaysVisible
          roleLinks={roleLinks}
        />
      </div>
    </header>
  );
}

function DefaultNavbar({
  user,
  dropdownStats,
  labels,
  hostHref,
  roleLinks,
}: NavbarProps & {
  roleLinks: Array<{ href: string; label: string; active?: boolean }>;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-[rgba(248,250,252,0.9)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-[rgba(2,6,23,0.92)]">
      <div className="border-b border-slate-200/70 bg-slate-950 px-4 py-2 text-white sm:px-6 lg:px-8 dark:border-slate-800/70">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-2 text-sm sm:flex-row sm:items-center">
          <p className="font-medium text-slate-100">{labels.hostBanner}</p>
          <Link href={hostHref} className="font-semibold text-sky-300 transition hover:text-white">
            {labels.startHosting}
          </Link>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href={homeHref(user)} aria-label={`${labels.appName} home`} className="flex items-center">
          <BrandLogo iconClassName="h-8 w-8 sm:h-9 sm:w-9" wordmarkClassName="text-lg sm:text-xl" />
        </Link>

        <nav className="hidden items-center gap-4 text-sm font-semibold text-slate-700 dark:text-slate-200 xl:flex">
          {roleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3 py-2 transition hover:text-slate-950 dark:hover:text-slate-50",
                link.active ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <NavActions user={user} dropdownStats={dropdownStats} labels={labels} hostHref={hostHref} roleLinks={roleLinks} />
      </div>
    </header>
  );
}
