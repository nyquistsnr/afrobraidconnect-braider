import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../dictionaries";
import { BookingsPageClient } from "@/components/dashboard/bookings-page-client";

export default async function BookingsPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await props.params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return <BookingsPageClient lang={lang} dict={dict} />;
}
