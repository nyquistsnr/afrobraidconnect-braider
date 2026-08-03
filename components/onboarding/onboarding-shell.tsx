"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ChevronLeft, LogOut } from "lucide-react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import type { OnboardingStatusResponse } from "@/lib/api/types";
import { type ActiveStep, onboardingStepPath, previousStep } from "@/lib/onboarding";
import { OnboardingStepper } from "@/components/onboarding/onboarding-stepper";
import { LogoutConfirmModal } from "@/components/dashboard/logout-confirm-modal";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LanguageSwitcher } from "@/components/language/language-switcher";

export function OnboardingShell({
  lang,
  dict,
  status,
  step,
  children,
}: {
  lang: Locale;
  dict: Dictionary;
  status: OnboardingStatusResponse;
  step: ActiveStep;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleConfirmLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success(dict.common.toasts.logoutSuccess);
      router.push(`/${lang}/login`);
    } finally {
      setLoggingOut(false);
      setLogoutModalOpen(false);
    }
  }, [lang, dict.common.toasts.logoutSuccess, router]);

  const previous = previousStep(step);

  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-4 sm:px-8">
        {previous ? (
          <button
            type="button"
            onClick={() => router.push(onboardingStepPath(lang, previous))}
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            {dict.common.back}
          </button>
        ) : (
          <span className="text-lg font-bold text-foreground">
            Afrobraid Connect
          </span>
        )}

        <div className="flex items-center gap-0.5 sm:gap-2">
          <ThemeToggle labels={dict.common.theme} dropDirection="down" />
          <LanguageSwitcher lang={lang} dropDirection="down" />

          <div className="mx-1 h-6 w-px bg-border sm:mx-2" />

          <button
            type="button"
            onClick={() => setLogoutModalOpen(true)}
            aria-label={dict.dashboard.sidebar.logout}
            className="flex items-center gap-1.5 px-2 py-1.5 text-muted-foreground transition-colors hover:bg-border/40 hover:text-foreground"
          >
            <LogOut className="size-4" />
            <span className="hidden text-sm font-medium sm:inline">
              {dict.dashboard.sidebar.logout}
            </span>
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6">
        <OnboardingStepper dict={dict.onboarding} status={status} />
        {children}
      </main>

      <LogoutConfirmModal
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        loading={loggingOut}
        dict={dict.dashboard.logoutModal}
      />
    </div>
  );
}
