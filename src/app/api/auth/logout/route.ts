import { NextResponse } from "next/server";

import { clearAuthSession } from "@/lib/auth";

export async function POST(request: Request) {
  await clearAuthSession();
  return NextResponse.redirect(new URL("/", request.url));
}
