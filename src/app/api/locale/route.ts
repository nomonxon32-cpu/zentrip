import { NextResponse } from "next/server";

import { LOCALE_COOKIE } from "@/lib/constants";

export async function POST(request: Request) {
  const body = (await request.json()) as { locale?: "en" | "uz" | "ru" };
  const locale = body.locale === "uz" || body.locale === "ru" ? body.locale : "en";
  const response = NextResponse.json({ ok: true });
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}
