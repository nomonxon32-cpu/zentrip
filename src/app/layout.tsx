import type { Metadata } from "next";
import Script from "next/script";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Providers } from "@/components/providers";
import { APP_NAME } from "@/lib/constants";
import { getCurrentLocale } from "@/lib/i18n";

import "./globals.css";

export const metadata: Metadata = {
  title: APP_NAME,
  description: `${APP_NAME} is a premium peer-to-peer car rental marketplace MVP for Uzbekistan.`,
};

const themeBootstrapScript = `
  (function () {
    try {
      var stored = localStorage.getItem("zentrip-theme");
      var theme = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
      var resolved = theme === "system"
        ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : theme;
      document.documentElement.classList.toggle("dark", resolved === "dark");
      document.documentElement.dataset.theme = resolved;
    } catch (error) {}
  })();
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getCurrentLocale();

  return (
    <html lang={locale} className="h-full" suppressHydrationWarning>
      <head>
        <Script id="theme-bootstrap" strategy="beforeInteractive">
          {themeBootstrapScript}
        </Script>
      </head>
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)] antialiased">
        <Providers initialLocale={locale}>
          <div className="relative flex min-h-screen flex-col overflow-x-clip">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.12),transparent_60%)]" />
            <Navbar />
            <main className="relative flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
