import { cn } from "@/lib/utils";

/**
 * Single source of truth for the Zentrip brand lockup.
 *
 * The "Z" mark is an inline SVG (crisp at any size, transparent background, so
 * it reads cleanly on both light and dark headers). The wordmark uses theme
 * text colors so it stays high-contrast in light and dark mode.
 *
 * Replaces the old generic car icon everywhere. Wrap in a <Link href="/"> for
 * clickable header logos.
 */
export function BrandLogo({
  className,
  iconClassName,
  wordmarkClassName,
  showWordmark = true,
}: {
  className?: string;
  iconClassName?: string;
  wordmarkClassName?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <ZentripMark className={cn("h-9 w-9 shrink-0", iconClassName)} />
      {showWordmark ? (
        <span
          className={cn(
            "text-xl font-black tracking-tight text-slate-950 dark:text-slate-50",
            wordmarkClassName,
          )}
        >
          Zentrip
        </span>
      ) : null}
    </span>
  );
}

export function ZentripMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Zentrip"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="zentrip-mark-gradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA" />
          <stop offset="0.55" stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <path
        d="M12 12 H52 V22 L30 42 H52 V52 H12 V42 L34 22 H12 Z"
        fill="url(#zentrip-mark-gradient)"
        stroke="url(#zentrip-mark-gradient)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
