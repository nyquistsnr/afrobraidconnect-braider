import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../dictionaries";
import { ProfilePageClient } from "@/components/dashboard/profile-page-client";

export default async function ProfilePage(props: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await props.params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return <ProfilePageClient lang={lang} dict={dict} />;
}
