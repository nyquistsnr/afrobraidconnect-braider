import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
  params,
}: LayoutProps<"/[lang]/dashboard">) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <DashboardShell
      lang={lang}
      dict={dict.dashboard}
      themeLabels={dict.common.theme}
      logoutSuccessMessage={dict.common.toasts.logoutSuccess}
    >
      {children}
    </DashboardShell>
  );
}
