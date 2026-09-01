"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { LogoutConfirmModal } from "@/components/dashboard/logout-confirm-modal";
import { RealtimeProvider } from "@/lib/realtime/realtime-provider";

export function DashboardShell({
  lang,
  dict,
  themeLabels,
  logoutSuccessMessage,
  children,
}: {
  lang: Locale;
  dict: Dictionary["dashboard"];
  themeLabels: Dictionary["common"]["theme"];
  logoutSuccessMessage: string;
  children: React.ReactNode;
}) {
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      const currentUrl = window.location.pathname + window.location.search;
      router.replace(`/${lang}/login?callbackUrl=${encodeURIComponent(currentUrl)}`);
    },
  });

  const fallbackUserName = "Braider";
  const userName =
    [session?.user?.firstName, session?.user?.lastName].filter(Boolean).join(" ") ||
    session?.user?.name ||
    fallbackUserName;
  const userLogo = session?.braider?.logo_url ?? null;

  const handleConfirmLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await fetch(`/api/auth/logout?lang=${lang}`, { method: "POST" });
      toast.success(logoutSuccessMessage);
      const currentUrl = window.location.pathname + window.location.search;
      router.push(`/${lang}/login?callbackUrl=${encodeURIComponent(currentUrl)}`);
    } finally {
      setLoggingOut(false);
      setLogoutModalOpen(false);
    }
  }, [lang, logoutSuccessMessage, router]);

  useEffect(() => {
    if (session?.error !== "RefreshAccessTokenError") return;
    const currentUrl = window.location.pathname + window.location.search;
    router.replace(`/${lang}/login?callbackUrl=${encodeURIComponent(currentUrl)}`);
  }, [lang, router, session?.error]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!session || session.error === "RefreshAccessTokenError") {
    return null;
  }

  return (
    <div className="flex h-screen">
      <RealtimeProvider />

      <Sidebar
        lang={lang}
        dict={dict.sidebar}
        userName={userName}
        userLogo={userLogo}
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
        loading={loggingOut}
        dict={dict.logoutModal}
      />
    </div>
  );
}
