import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/auth";
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

    await db.user.create({
      data: {
        name: body.name,
        email: body.email.toLowerCase(),
        phone: body.phone,
        city: body.city,
        role: body.role === Role.OWNER ? Role.OWNER : Role.RENTER,
        passwordHash: await hashPassword(body.password),
        emailVerifiedAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      redirectTo: "/login",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
