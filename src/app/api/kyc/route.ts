import { KycStatus, Role } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/http";
import { getKycStatusForRole, isKycDocumentTypeAllowedForRole } from "@/lib/kyc";
import { createNotification } from "@/lib/notifications";
import { kycUploadSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();

    if (user.role !== Role.OWNER && user.role !== Role.RENTER) {
      return NextResponse.json({ error: "Only owners and renters can submit KYC." }, { status: 403 });
    }

    const body = kycUploadSchema.parse(await request.json());

    if (!isKycDocumentTypeAllowedForRole(user.role, body.documentType)) {
      return NextResponse.json({ error: "This document type is not used for your verification flow." }, { status: 400 });
    }

    await db.$transaction(async (tx) => {
      await tx.kycDocument.create({
        data: {
          userId: user.id,
          documentType: body.documentType,
          frontImageUrl: body.frontImageUrl,
          backImageUrl: body.backImageUrl ?? null,
          status: KycStatus.PENDING,
          rejectionReason: null,
        },
      });

      const documents = await tx.kycDocument.findMany({
        where: { userId: user.id },
        select: {
          documentType: true,
          status: true,
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: {
          kycStatus: getKycStatusForRole(user.role, documents),
        },
      });
    });

    const admins = await db.user.findMany({
      where: { role: Role.ADMIN },
      select: { id: true },
    });

    await Promise.all(
      admins.map((admin) =>
        createNotification({
          userId: admin.id,
          type: "KYC_REVIEW",
          title: "New KYC submission",
          message: `${user.name} submitted ${body.documentType.replaceAll("_", " ")} for verification.`,
        }),
      ),
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
