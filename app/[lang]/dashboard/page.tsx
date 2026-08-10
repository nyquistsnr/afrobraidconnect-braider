import { notFound } from "next/navigation";
import { getDictionary, hasLocale, locales } from "../dictionaries";

export default async function DashboardPage({
  params,
}: PageProps<"/[lang]/dashboard">) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <h1 className="text-2xl font-bold text-foreground">
      {dict.dashboard.home.greeting}
    </h1>
  );
}
