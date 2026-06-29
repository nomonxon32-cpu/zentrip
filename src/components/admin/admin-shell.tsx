import { AdminSidebar } from "@/components/admin-sidebar";

export function AdminShell({
  currentPath,
  title,
  description,
  backAction,
  children,
}: {
  currentPath: string;
  title: string;
  description: string;
  backAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8 lg:px-8">
      <AdminSidebar currentPath={currentPath} />
      <section className="min-w-0 space-y-6">
        {backAction ? <div>{backAction}</div> : null}
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        {children}
      </section>
    </div>
  );
}
