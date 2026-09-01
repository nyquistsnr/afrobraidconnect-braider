import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

export default async function DashboardPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await props.params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return <DashboardOverview lang={lang} dict={dict} />;
}
