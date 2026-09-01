import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../../dictionaries";
import { BookingDetailPageClient } from "@/components/dashboard/booking-detail-page-client";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return <BookingDetailPageClient id={id} lang={lang} dict={dict} />;
}
