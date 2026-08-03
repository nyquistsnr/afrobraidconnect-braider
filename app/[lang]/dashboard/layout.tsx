import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDictionary, hasLocale, locales } from "../dictionaries";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function DashboardLayout({
  children,
  params,
}: LayoutProps<"/[lang]/dashboard">) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const session = await auth();
  if (!session) redirect(`/${lang}/login`);

  const dict = await getDictionary(lang);
  const userName = [session.user.firstName, session.user.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <DashboardShell
      lang={lang}
      dict={dict.dashboard}
      themeLabels={dict.common.theme}
      logoutSuccessMessage={dict.common.toasts.logoutSuccess}
      userName={userName}
    >
      {children}
    </DashboardShell>
  );
}
