import { DocumentType, KycStatus, Role } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireApiRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/http";
import { createNotification } from "@/lib/notifications";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await requireApiRole(Role.ADMIN);

    const body = (await request.json()) as { action?: "APPROVE" | "REJECT"; rejectionReason?: string };
    if (!body.action) {
      return NextResponse.json({ error: "Action is required." }, { status: 400 });
    }

    const document = await db.kycDocument.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!document) {
      return NextResponse.json({ error: "KYC document not found." }, { status: 404 });
    }

    await db.kycDocument.update({
      where: { id },
      data: {
        status: body.action === "APPROVE" ? KycStatus.APPROVED : KycStatus.REJECTED,
        rejectionReason: body.action === "REJECT" ? body.rejectionReason ?? "Please upload a clearer document." : null,
      },
    });

    if (body.action === "REJECT") {
      await db.user.update({
        where: { id: document.userId },
        data: { kycStatus: KycStatus.REJECTED },
      });
    } else {
      const approvedDocs = await db.kycDocument.findMany({
        where: { userId: document.userId, status: KycStatus.APPROVED },
        select: { documentType: true },
      });
      const hasIdentityDoc = approvedDocs.some(
        (doc) => doc.documentType === DocumentType.PASSPORT || doc.documentType === DocumentType.ID_CARD,
      );
      const hasLicense = approvedDocs.some((doc) => doc.documentType === DocumentType.DRIVER_LICENSE);

      await db.user.update({
        where: { id: document.userId },
        data: {
          kycStatus: hasIdentityDoc && hasLicense ? KycStatus.APPROVED : KycStatus.PENDING,
        },
      });
    }

    await createNotification({
      userId: document.userId,
      type: "KYC_STATUS",
      title: body.action === "APPROVE" ? "KYC approved" : "KYC rejected",
      message:
        body.action === "APPROVE"
          ? "Your verification document was approved."
          : body.rejectionReason ?? "Your verification document was rejected.",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
