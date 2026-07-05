import { NextResponse } from "next/server";

import { requireApiUser, setAuthSession } from "@/lib/auth";
import { getAccountSettingsCopy } from "@/lib/account-settings-copy";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/http";
import { getCurrentLocale } from "@/lib/i18n";
import { emailSettingsSchema } from "@/lib/validators";

export async function PATCH(request: Request) {
  try {
    const [user, locale] = await Promise.all([requireApiUser(), getCurrentLocale()]);
    const copy = getAccountSettingsCopy(locale);
    const body = emailSettingsSchema.parse(await request.json());
    const nextEmail = body.email.trim().toLowerCase();

    const existingUser = await db.user.findUnique({
      where: { email: nextEmail },
      select: { id: true },
    });

    if (existingUser && existingUser.id !== user.id) {
      return NextResponse.json({ error: copy.emailAlreadyInUse }, { status: 409 });
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        email: nextEmail,
        emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
      },
      select: {
        id: true,
        role: true,
        email: true,
      },
    });

    await setAuthSession({
      userId: updatedUser.id,
      role: updatedUser.role,
      email: updatedUser.email,
    });

    return NextResponse.json({
      ok: true,
      message: copy.emailUpdated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
