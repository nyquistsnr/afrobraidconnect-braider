import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { InlineScript } from "@/components/theme/inline-script";
import { AppToastContainer } from "@/components/toast-container";
import { QueryProvider } from "@/lib/query-provider";
import { themeInitScript } from "@/lib/theme";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Afrobraid Connect",
  description: "Connecting clients with professional hair braiders.",
};

// This layout is intentionally static (no dynamic segment, no dynamic
// APIs) so it never remounts on navigation — including switching the
// [lang] segment below. That's what lets language switching stay a soft,
// client-side transition instead of a full page reload: the <html>/<head>/
// theme-init <script> here stay put across it.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <InlineScript html={themeInitScript} />
      </head>
      <body className="min-h-full flex flex-col">
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <SessionProvider>
          <ThemeProvider>
            <QueryProvider>
              {children}
              <AppToastContainer />
            </QueryProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
