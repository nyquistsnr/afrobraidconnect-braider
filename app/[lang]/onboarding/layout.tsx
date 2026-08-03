import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { hasLocale, locales } from "../dictionaries";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function OnboardingLayout({
  children,
  params,
}: LayoutProps<"/[lang]/onboarding">) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const session = await auth();
  if (!session) redirect(`/${lang}/login`);
  // Onboarding only applies to braider accounts.
  if (!session.braider) redirect(`/${lang}/dashboard`);

  return children;
}
