import { NextResponse } from "next/server";

import { getRoleHomePath, setAuthSession, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/http";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = loginSchema.parse(await request.json());
    const user = await db.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const valid = await verifyPassword(body.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await setAuthSession({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    return NextResponse.json({
      ok: true,
      redirectTo: user.isSuspended ? "/suspended" : getRoleHomePath(user.role),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
