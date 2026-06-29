import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import {
  createEmailVerificationToken,
  isEmailVerified,
  sendVerificationEmail,
} from "@/lib/email-verification";
import { handleApiError } from "@/lib/http";

const resendSchema = z.object({
  email: z.email(),
});

export async function POST(request: Request) {
  try {
    const body = resendSchema.parse(await request.json());
    const email = body.email.toLowerCase();
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerifiedAt: true,
      },
    });

    if (!user || isEmailVerified(user)) {
      return NextResponse.json({ ok: true });
    }

    const verification = await createEmailVerificationToken(user.id, {
      enforceRateLimit: true,
    });

    await sendVerificationEmail({
      email: user.email,
      name: user.name,
      verificationUrl: verification.verificationUrl,
      expiresAt: verification.expiresAt,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
