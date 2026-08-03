"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { LogoutConfirmModal } from "@/components/dashboard/logout-confirm-modal";

// Placeholder until authenticated user data is wired up.
const CURRENT_USER_NAME = "Amara Nwosu";

export function DashboardShell({
  lang,
  dict,
  themeLabels,
  children,
}: {
  lang: Locale;
  dict: Dictionary["dashboard"];
  themeLabels: Dictionary["common"]["theme"];
  children: React.ReactNode;
}) {
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const handleConfirmLogout = useCallback(() => {
    setLogoutModalOpen(false);
    router.push(`/${lang}/login`);
  }, [lang, router]);

  return (
    <div className="flex h-screen">
      <Sidebar
        lang={lang}
        dict={dict.sidebar}
        userName={CURRENT_USER_NAME}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogoutClick={() => setLogoutModalOpen(true)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader
          lang={lang}
          dict={dict.header}
          themeLabels={themeLabels}
          onMenuClick={() => setSidebarOpen(true)}
          onLogoutClick={() => setLogoutModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6">
          {children}
        </main>
      </div>

      <LogoutConfirmModal
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        dict={dict.logoutModal}
      />
    </div>
  );
}
