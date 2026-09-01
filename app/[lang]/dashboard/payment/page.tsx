import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../dictionaries";
import { PaymentPageClient } from "@/components/dashboard/payment-page-client";

export default async function PaymentPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await props.params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return <PaymentPageClient lang={lang} dict={dict} />;
}
