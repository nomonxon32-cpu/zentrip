import { KycStatus, Role } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { getAccountSettingsCopy } from "@/lib/account-settings-copy";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/http";
import { getCurrentLocale } from "@/lib/i18n";
import { createNotification } from "@/lib/notifications";
import { profileSettingsSchema } from "@/lib/validators";

const NAME_CHANGE_KYC_REASON =
  "Full name changed in account settings. Please upload updated identity documents for a new KYC review.";

export async function PATCH(request: Request) {
  try {
    const [user, locale] = await Promise.all([requireApiUser(), getCurrentLocale()]);
    const copy = getAccountSettingsCopy(locale);
    const body = profileSettingsSchema.parse(await request.json());
    const nextName = body.name.trim();
    const nextPhone = body.phone.trim();
    const nextCity = body.city.trim();
    const shouldResetKyc = user.role !== Role.ADMIN && nextName !== user.name.trim();

    if (shouldResetKyc && body.confirmNameReset !== true) {
      return NextResponse.json(
        {
          error: copy.nameResetRequired,
          requiresNameResetConfirmation: true,
        },
        { status: 409 },
      );
    }

    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          name: nextName,
          phone: nextPhone,
          city: nextCity,
          ...(shouldResetKyc ? { kycStatus: KycStatus.NOT_SUBMITTED } : {}),
        },
      });

      if (shouldResetKyc) {
        await tx.kycDocument.updateMany({
          where: {
            userId: user.id,
            status: {
              in: [KycStatus.APPROVED, KycStatus.PENDING],
            },
          },
          data: {
            status: KycStatus.REJECTED,
            rejectionReason: NAME_CHANGE_KYC_REASON,
          },
        });
      }
    });

    if (shouldResetKyc) {
      const admins = await db.user.findMany({
        where: { role: Role.ADMIN },
        select: { id: true },
      });

      await Promise.all(
        admins.map((admin) =>
          createNotification({
            userId: admin.id,
            type: "KYC_REVIEW",
            title: "KYC resubmission required",
            message: `${nextName} changed their legal name and must upload new documents for review.`,
          }),
        ),
      );
    }

    return NextResponse.json({
      ok: true,
      kycReset: shouldResetKyc,
      message: shouldResetKyc ? copy.profileUpdatedAndKycReset : copy.profileUpdated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
