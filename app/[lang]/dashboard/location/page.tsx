import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../dictionaries";
import { DashboardLocationLoader } from "@/components/dashboard/dashboard-form-loaders";

export default async function DashboardLocationPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await props.params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return <DashboardLocationLoader lang={lang} dict={dict} />;
}
