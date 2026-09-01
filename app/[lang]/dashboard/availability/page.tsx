import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../dictionaries";
import { DashboardAvailabilityLoader } from "@/components/dashboard/dashboard-form-loaders";

export default async function DashboardAvailabilityPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await props.params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return <DashboardAvailabilityLoader lang={lang} dict={dict} />;
}
