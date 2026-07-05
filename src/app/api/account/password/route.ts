import { NextResponse } from "next/server";

import { hashPassword, requireApiUser, verifyPassword } from "@/lib/auth";
import { getAccountSettingsCopy } from "@/lib/account-settings-copy";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/http";
import { getCurrentLocale } from "@/lib/i18n";
import { passwordChangeSchema } from "@/lib/validators";

export async function PATCH(request: Request) {
  try {
    const [user, locale] = await Promise.all([requireApiUser(), getCurrentLocale()]);
    const copy = getAccountSettingsCopy(locale);
    const body = passwordChangeSchema.parse(await request.json());

    const passwordMatches = await verifyPassword(body.currentPassword, user.passwordHash);
    if (!passwordMatches) {
      return NextResponse.json({ error: copy.currentPasswordIncorrect }, { status: 400 });
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashPassword(body.newPassword),
      },
    });

    return NextResponse.json({
      ok: true,
      message: copy.passwordUpdated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
