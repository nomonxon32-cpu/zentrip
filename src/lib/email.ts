import { APP_NAME } from "@/lib/constants";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export class EmailConfigurationError extends Error {
  constructor(message = "Email service is not configured.") {
    super(message);
    this.name = "EmailConfigurationError";
  }
}

export class EmailDeliveryError extends Error {
  providerMessage?: string;

  constructor(message: string, providerMessage?: string) {
    super(message);
    this.name = "EmailDeliveryError";
    this.providerMessage = providerMessage;
  }
}

function getEmailConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY?.trim(),
    from: process.env.EMAIL_FROM?.trim(),
  };
}

function getEmailConfigStatus() {
  const { apiKey, from } = getEmailConfig();

  return {
    hasResendApiKey: Boolean(apiKey),
    hasEmailFrom: Boolean(from),
  };
}

async function readProviderError(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string; error?: string; name?: string }
      | null;

    if (payload?.message) {
      return payload.message;
    }

    if (payload?.error) {
      return payload.error;
    }

    if (payload?.name) {
      return payload.name;
    }

    if (payload) {
      return JSON.stringify(payload);
    }
  }

  const body = await response.text().catch(() => "");
  return body || `HTTP ${response.status}`;
}

export async function sendEmail({ to, subject, html, text }: EmailPayload) {
  const { apiKey, from } = getEmailConfig();
  const configStatus = getEmailConfigStatus();

  if (!apiKey || !from) {
    console.error(`[${APP_NAME} email] Email service is not configured.`, {
      ...configStatus,
      to,
      subject,
      environment: process.env.NODE_ENV ?? "unknown",
    });
    throw new EmailConfigurationError();
  }

  console.info(`[${APP_NAME} email] Sending email via Resend.`, {
    ...configStatus,
    to,
    subject,
  });

  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        text,
      }),
    });
  } catch (error) {
    console.error(`[${APP_NAME} email] Network error while contacting Resend.`, {
      ...configStatus,
      to,
      subject,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new EmailDeliveryError("We couldn't reach the email provider.");
  }

  if (!response.ok) {
    const providerError = await readProviderError(response);

    console.error(`[${APP_NAME} email] Resend rejected the email request.`, {
      ...configStatus,
      to,
      subject,
      status: response.status,
      providerError,
    });
    throw new EmailDeliveryError("We couldn't send the verification email right now.", providerError);
  }
}
