import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-5 px-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-600">403 Forbidden</p>
      <h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-slate-50">You do not have access to this area.</h1>
      <p className="text-base leading-8 text-slate-600 dark:text-slate-300">
        Admin tools are restricted, and dashboard sections redirect based on your account role.
      </p>
      <Link href="/" className="btn-primary rounded-full px-5 py-3 text-sm font-semibold transition">
        Return home
      </Link>
    </div>
  );
}
