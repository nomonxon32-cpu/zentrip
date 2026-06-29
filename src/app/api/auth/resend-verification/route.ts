import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Email verification is currently disabled." },
    { status: 410 },
  );
}
