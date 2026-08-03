import { notFound } from "next/navigation";
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

  const dict = await getDictionary(lang);

  return (
    <DashboardShell lang={lang} dict={dict.dashboard} themeLabels={dict.common.theme}>
      {children}
    </DashboardShell>
  );
}
