"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarCheck, LogOut } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export function Sidebar({
  lang,
  dict,
  userName,
  onLogoutClick,
}: {
  lang: Locale;
  dict: Dictionary["dashboard"]["sidebar"];
  userName: string;
  onLogoutClick: () => void;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      href: `/${lang}/dashboard`,
      label: dict.dashboard,
      icon: LayoutDashboard,
      active: pathname === `/${lang}/dashboard`,
    },
    {
      href: `/${lang}/dashboard/bookings`,
      label: dict.bookings,
      icon: CalendarCheck,
      active: pathname === `/${lang}/dashboard/bookings`,
    },
  ];

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-surface">
      <div className="px-6 py-6">
        <Image
          src="/logo/logo.webp"
          alt="Afrobraid Connect"
          width={126}
          height={32}
          className="theme-invert"
        />
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map(({ href, label, icon: Icon, active }) => (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-brand text-brand-foreground"
                : "text-muted-foreground hover:bg-border/40 hover:text-foreground"
            }`}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-border px-3 py-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <Image
            src="/images/profile.jpg"
            alt={userName}
            width={36}
            height={36}
            className="size-9 shrink-0 object-cover"
          />
          <span className="truncate text-sm font-semibold text-foreground">
            {userName}
          </span>
        </div>

        <button
          type="button"
          onClick={onLogoutClick}
          className="mt-1 flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-border/40 hover:text-foreground"
        >
          <LogOut className="size-5" />
          {dict.logout}
        </button>
      </div>
    </aside>
  );
}
