"use client";

import { type FormEvent, useState } from "react";
import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function CarNameSearch({
  placeholder,
}: {
  placeholder: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";

  return <CarNameSearchInner key={query} pathname={pathname} query={query} router={router} searchParams={searchParams} placeholder={placeholder} />;
}

function CarNameSearchInner({
  pathname,
  query,
  router,
  searchParams,
  placeholder,
}: {
  pathname: string;
  query: string;
  router: ReturnType<typeof useRouter>;
  searchParams: ReturnType<typeof useSearchParams>;
  placeholder: string;
}) {
  const [value, setValue] = useState(query);

  function pushSearch(nextValue: string) {
    const params = new URLSearchParams(searchParams.toString());
    const normalizedValue = nextValue.trim();

    if (normalizedValue) {
      params.set("q", normalizedValue);
    } else {
      params.delete("q");
    }

    const nextQuery = params.toString();
    router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    pushSearch(value);
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-[520px]">
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <Search className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
        <input
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        {value ? (
          <button
            type="button"
            onClick={() => {
              setValue("");
              pushSearch("");
            }}
            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-900 dark:hover:text-slate-200"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
        <button
          type="submit"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
          aria-label="Search by car name"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
