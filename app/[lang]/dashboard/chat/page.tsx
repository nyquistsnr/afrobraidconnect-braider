import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../dictionaries";
import { ChatPageClient } from "@/components/dashboard/chat-page-client";

export default async function ChatPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await props.params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return <ChatPageClient lang={lang} dict={dict} />;
}
