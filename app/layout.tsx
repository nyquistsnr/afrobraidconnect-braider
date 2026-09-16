import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import Script from "next/script";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { InlineScript } from "@/components/theme/inline-script";
import { AppToastContainer } from "@/components/toast-container";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import { QueryProvider } from "@/lib/query-provider";
import { themeInitScript } from "@/lib/theme";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "Afrobraid Connect";
const description = "Connecting clients with professional hair braiders.";
const socialImage = "/favicon_io/android-chrome-512x512.png";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title,
  description,
  applicationName: title,
  icons: {
    icon: [
      { url: "/favicon_io/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon_io/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon_io/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon_io/apple-touch-icon.png",
  },
  openGraph: {
    title,
    description,
    siteName: title,
    images: [{ url: socialImage, width: 512, height: 512, alt: title }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: [socialImage],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#b9713f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${roboto.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <InlineScript html={themeInitScript} />
      </head>
      <body className="min-h-full flex flex-col">
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
        <SessionProvider>
          <ThemeProvider>
            <QueryProvider>
              {children}
              <AppToastContainer />
            </QueryProvider>
          </ThemeProvider>
        </SessionProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
