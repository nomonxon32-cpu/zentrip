import { createHash, randomBytes } from "node:crypto";

import { addHours } from "date-fns";

import { APP_NAME } from "@/lib/constants";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { ApiError } from "@/lib/http";
import { absoluteUrl } from "@/lib/utils";

const EMAIL_VERIFICATION_TTL_HOURS = 24;
const RESEND_RATE_LIMIT_SECONDS = 60;

function hashVerificationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function isEmailVerified(user: { emailVerifiedAt: Date | null }) {
  return Boolean(user.emailVerifiedAt);
}

export async function createEmailVerificationToken(userId: string, options?: { enforceRateLimit?: boolean }) {
  if (options?.enforceRateLimit) {
    const latestToken = await db.emailVerificationToken.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    if (latestToken) {
      const elapsedSeconds = Math.floor((Date.now() - latestToken.createdAt.getTime()) / 1000);
      if (elapsedSeconds < RESEND_RATE_LIMIT_SECONDS) {
        throw new ApiError(
          429,
          `Please wait ${RESEND_RATE_LIMIT_SECONDS - elapsedSeconds} seconds before requesting another verification email.`,
        );
      }
    }
  }

  await db.emailVerificationToken.deleteMany({
    where: { userId },
  });

  const token = randomBytes(32).toString("hex");
  const expiresAt = addHours(new Date(), EMAIL_VERIFICATION_TTL_HOURS);

  await db.emailVerificationToken.create({
    data: {
      userId,
      tokenHash: hashVerificationToken(token),
      expiresAt,
    },
  });

  return {
    token,
    expiresAt,
    verificationUrl: absoluteUrl(`/verify-email?token=${encodeURIComponent(token)}`),
  };
}

export async function sendVerificationEmail(params: {
  email: string;
  name: string;
  verificationUrl: string;
  expiresAt: Date;
}) {
  const subject = `Verify your ${APP_NAME} email`;
  const expiresLabel = params.expiresAt.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const text = [
    `Hi ${params.name},`,
    "",
    `Welcome to ${APP_NAME}. Please verify your email to activate your account.`,
    "",
    `Verify email: ${params.verificationUrl}`,
    "",
    `This link expires on ${expiresLabel}.`,
  ].join("\n");
  const html = `
    <div style="background:#f8fafc;padding:32px 16px;font-family:Aptos,'Segoe UI',sans-serif;color:#0f172a;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;padding:32px;">
        <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#0284c7;">${APP_NAME}</p>
        <h1 style="margin:0 0 12px;font-size:28px;line-height:1.1;">Verify your email</h1>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#475569;">
          Hi ${escapeHtml(params.name)}, welcome to ${APP_NAME}. Verify your email to start managing trips, bookings, and listings.
        </p>
        <a
          href="${params.verificationUrl}"
          style="display:inline-block;border-radius:999px;background:#0f172a;padding:14px 22px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;"
        >
          Verify email
        </a>
        <p style="margin:24px 0 8px;font-size:13px;line-height:1.7;color:#64748b;">
          If the button does not work, copy and paste this link into your browser:
        </p>
        <p style="margin:0 0 12px;word-break:break-word;font-size:13px;line-height:1.7;color:#0284c7;">
          <a href="${params.verificationUrl}" style="color:#0284c7;">${params.verificationUrl}</a>
        </p>
        <p style="margin:0;font-size:13px;line-height:1.7;color:#64748b;">
          This verification link expires on ${expiresLabel}.
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to: params.email,
    subject,
    html,
    text,
  });
}

export async function consumeEmailVerificationToken(token: string) {
  const tokenHash = hashVerificationToken(token);
  const verificationRecord = await db.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  if (!verificationRecord) {
    return {
      status: "invalid" as const,
    };
  }

  if (verificationRecord.expiresAt < new Date()) {
    await db.emailVerificationToken.deleteMany({
      where: { userId: verificationRecord.userId },
    });

    return {
      status: "expired" as const,
      email: verificationRecord.user.email,
    };
  }

  await db.$transaction([
    db.user.update({
      where: { id: verificationRecord.userId },
      data: {
        emailVerifiedAt: new Date(),
      },
    }),
    db.emailVerificationToken.deleteMany({
      where: { userId: verificationRecord.userId },
    }),
  ]);

  return {
    status: "verified" as const,
    email: verificationRecord.user.email,
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
