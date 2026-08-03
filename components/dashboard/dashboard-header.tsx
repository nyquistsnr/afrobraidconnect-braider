"use client";

import { Bell, MessageSquare, LogOut } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LanguageSwitcher } from "@/components/language/language-switcher";

// Placeholder counts until notifications/messages are wired up to real data.
const NOTIFICATION_COUNT = 3;
const MESSAGE_COUNT = 5;

function IconButton({
  icon: Icon,
  label,
  count,
  onClick,
}: {
  icon: typeof Bell;
  label: string;
  count?: number;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="relative flex items-center justify-center p-2 text-muted-foreground transition-colors hover:bg-border/40 hover:text-foreground"
    >
      <Icon className="size-5" />
      {!!count && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-brand px-1 text-[10px] font-semibold leading-none text-brand-foreground">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

export function DashboardHeader({
  lang,
  dict,
  themeLabels,
  onLogoutClick,
}: {
  lang: Locale;
  dict: Dictionary["dashboard"]["header"];
  themeLabels: Dictionary["common"]["theme"];
  onLogoutClick: () => void;
}) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-end gap-2 border-b border-border bg-surface px-6">
      <IconButton icon={Bell} label={dict.notifications} count={NOTIFICATION_COUNT} />
      <IconButton icon={MessageSquare} label={dict.messages} count={MESSAGE_COUNT} />

      <div className="mx-2 h-6 w-px bg-border" />

      <ThemeToggle labels={themeLabels} dropDirection="down" />
      <LanguageSwitcher lang={lang} dropDirection="down" />

      <div className="mx-2 h-6 w-px bg-border" />

      <IconButton icon={LogOut} label={dict.logout} onClick={onLogoutClick} />
    </header>
  );
}
