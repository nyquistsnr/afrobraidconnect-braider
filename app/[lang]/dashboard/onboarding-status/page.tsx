import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../dictionaries";
import { DashboardOnboardingStatusLoader } from "@/components/dashboard/dashboard-form-loaders";

export default async function DashboardOnboardingStatusPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await props.params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return <DashboardOnboardingStatusLoader lang={lang} dict={dict} />;
}
