"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { LogOut } from "lucide-react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import type { OnboardingStatusResponse } from "@/lib/api/types";
import { AuthShell } from "@/components/auth/auth-shell";
import { OnboardingStepper } from "@/components/onboarding/onboarding-stepper";
import { LogoutConfirmModal } from "@/components/dashboard/logout-confirm-modal";

export function OnboardingShell({
  lang,
  dict,
  status,
  children,
}: {
  lang: Locale;
  dict: Dictionary;
  status: OnboardingStatusResponse;
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

  return (
    <AuthShell
      lang={lang}
      supportEmail={dict.common.supportEmail}
      heroImageAlt={dict.common.heroImageAlt}
      themeLabels={dict.common.theme}
    >
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={() => setLogoutModalOpen(true)}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <LogOut className="size-4" />
          {dict.dashboard.sidebar.logout}
        </button>
      </div>

      <OnboardingStepper dict={dict.onboarding} status={status} />

      {children}

      <LogoutConfirmModal
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        loading={loggingOut}
        dict={dict.dashboard.logoutModal}
      />
    </AuthShell>
  );
}
