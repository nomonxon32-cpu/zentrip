import { NavbarClient } from "@/components/navbar-client";
import { getCurrentUser } from "@/lib/auth";
import { getUserDropdownStats } from "@/lib/dropdown-stats";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";

export async function Navbar() {
  const [user, locale] = await Promise.all([getCurrentUser(), getCurrentLocale()]);
  const labels = getDictionary(locale);
  // Public "List your car" entry points route through the /host landing page so
  // owners and prospects see the partner value proposition before signing up.
  const hostHref = "/host";
  const dropdownStats = user ? await getUserDropdownStats(user) : null;
  const safeUser = user
    ? {
        id: user.id,
        name: user.name,
        role: user.role,
        kycStatus: user.kycStatus,
      }
    : null;

  return <NavbarClient user={safeUser} dropdownStats={dropdownStats} labels={labels} hostHref={hostHref} />;
}
