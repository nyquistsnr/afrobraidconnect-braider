"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { locales, localeNames, type Locale } from "@/lib/i18n";

export function LanguageSwitcher({ lang }: { lang: Locale }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function switchTo(nextLang: Locale) {
    setOpen(false);
    const segments = pathname.split("/");
    segments[1] = nextLang;
    router.push(segments.join("/") || "/");
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-neutral-600 hover:bg-border/40 dark:text-neutral-400"
      >
        <GlobeIcon className="size-4" />
        <span className="font-medium uppercase">{lang}</span>
        <ChevronDownIcon
          className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute bottom-full right-0 mb-2 w-36 overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-lg"
        >
          {locales.map((locale) => (
            <li key={locale}>
              <button
                type="button"
                role="option"
                aria-selected={locale === lang}
                onClick={() => switchTo(locale)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-border/40 ${
                  locale === lang
                    ? "font-semibold text-brand"
                    : "text-foreground"
                }`}
              >
                {localeNames[locale]}
                <span className="text-xs uppercase text-muted-foreground">
                  {locale}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
    </svg>
  );
}

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
