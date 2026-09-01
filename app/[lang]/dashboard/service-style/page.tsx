import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../dictionaries";
import { DashboardServiceStyleLoader } from "@/components/dashboard/dashboard-form-loaders";

export default async function DashboardServiceStylePage(props: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await props.params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return <DashboardServiceStyleLoader lang={lang} dict={dict} />;
}
