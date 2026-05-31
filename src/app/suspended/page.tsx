import Link from "next/link";

export default function SuspendedPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-5 px-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Account suspended</p>
      <h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-slate-50">Your Zentrip account is currently suspended.</h1>
      <p className="text-base leading-8 text-slate-600 dark:text-slate-300">
        Marketplace access is paused by an administrator. Contact support or an admin to restore your account.
      </p>
      <Link href="/" className="btn-primary rounded-full px-5 py-3 text-sm font-semibold transition">
        Return home
      </Link>
    </div>
  );
}
