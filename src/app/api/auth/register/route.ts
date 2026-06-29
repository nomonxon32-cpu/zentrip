import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  createEmailVerificationToken,
  isEmailVerified,
  sendVerificationEmail,
} from "@/lib/email-verification";
import { ApiError, handleApiError } from "@/lib/http";
import { registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = registerSchema.parse(await request.json());

    const existingUser = await db.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });

    if (existingUser) {
      if (!isEmailVerified(existingUser)) {
        return NextResponse.json(
          {
            error: "This email is already registered but still waiting for verification.",
            code: "EMAIL_NOT_VERIFIED",
            redirectTo: `/verify-email?email=${encodeURIComponent(existingUser.email)}&status=pending`,
          },
          { status: 409 },
        );
      }

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

    try {
      const verification = await createEmailVerificationToken(user.id);
      await sendVerificationEmail({
        email: user.email,
        name: user.name,
        verificationUrl: verification.verificationUrl,
        expiresAt: verification.expiresAt,
      });
    } catch (error) {
      await db.emailVerificationToken.deleteMany({
        where: { userId: user.id },
      });
      await db.user.delete({
        where: { id: user.id },
      });

      if (error instanceof Error) {
        throw new ApiError(500, error.message.includes("verification")
          ? error.message
          : "We couldn't send the verification email. Please try again.");
      }

      throw new ApiError(500, "We couldn't send the verification email. Please try again.");
    }

    return NextResponse.json({
      ok: true,
      requiresVerification: true,
      email: user.email,
      redirectTo: `/verify-email?email=${encodeURIComponent(user.email)}&status=sent`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
