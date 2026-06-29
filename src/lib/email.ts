import { APP_NAME } from "@/lib/constants";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

function getEmailConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.EMAIL_FROM,
  };
}

export async function sendEmail({ to, subject, html, text }: EmailPayload) {
  const { apiKey, from } = getEmailConfig();

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Email delivery is not configured.");
    }

    console.info(`[${APP_NAME} email:dev] to=${to} subject="${subject}"`);
    console.info(text);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
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

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Email provider rejected the request (${response.status}): ${errorBody}`);
  }
}
