import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

import { getRoleHomePath, hashPassword, setAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/http";
import { registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = registerSchema.parse(await request.json());

    const existingUser = await db.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email is already registered." }, { status: 409 });
    }

    const passwordHash = await hashPassword(body.password);
    const user = await db.user.create({
      data: {
        name: body.name,
        email: body.email.toLowerCase(),
        phone: body.phone,
        city: body.city,
        role: body.role === Role.OWNER ? Role.OWNER : Role.RENTER,
        passwordHash,
      },
    });

    await setAuthSession({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    return NextResponse.json({
      ok: true,
      redirectTo: getRoleHomePath(user.role),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
