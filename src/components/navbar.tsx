import { Role } from "@prisma/client";

import { NavbarClient } from "@/components/navbar-client";
import { getCurrentUser } from "@/lib/auth";
import { getUserDropdownStats } from "@/lib/dropdown-stats";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";

export async function Navbar() {
  const [user, locale] = await Promise.all([getCurrentUser(), getCurrentLocale()]);
  const labels = getDictionary(locale);
  const hostHref =
    user?.role === Role.OWNER ? "/dashboard/owner/listings/new" : user?.role === Role.ADMIN ? "/admin" : "/host";
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
