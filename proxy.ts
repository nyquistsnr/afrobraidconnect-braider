import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, hasLocale, locales, type Locale } from "@/lib/i18n";

function getPreferredLocale(request: NextRequest): Locale {
  const header = request.headers.get("accept-language");
  if (!header) return defaultLocale;

  const preferred = header
    .split(",")
    .map((part) => {
      const [rawLocale, rawQuality] = part.trim().split(";q=");
      return {
        locale: rawLocale.toLowerCase(),
        quality: rawQuality ? parseFloat(rawQuality) : 1,
      };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { locale } of preferred) {
    const base = locale.split("-")[0];
    if (hasLocale(base)) return base;
  }

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (pathnameHasLocale) return;

  const locale = getPreferredLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
