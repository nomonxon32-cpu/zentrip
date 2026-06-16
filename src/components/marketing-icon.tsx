import {
  BarChart3,
  CalendarRange,
  CarFront,
  Gauge,
  Handshake,
  Headset,
  Lock,
  Phone,
  ShieldCheck,
  Users,
  WalletCards,
  BadgeCheck,
  type LucideIcon,
} from "lucide-react";

import type { IconKey } from "@/lib/marketing";

const iconMap: Record<IconKey, LucideIcon> = {
  wallet: WalletCards,
  calendar: CalendarRange,
  shield: ShieldCheck,
  users: Users,
  chart: BarChart3,
  phone: Phone,
  verified: BadgeCheck,
  lock: Lock,
  handshake: Handshake,
  headset: Headset,
  car: CarFront,
  gauge: Gauge,
};

export function MarketingIcon({ name, className }: { name: IconKey; className?: string }) {
  const Icon = iconMap[name] ?? ShieldCheck;
  return <Icon className={className} />;
}
