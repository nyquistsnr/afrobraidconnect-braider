import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../../dictionaries";
import { ChatThreadPageClient } from "@/components/dashboard/chat-thread-page-client";

export default async function ChatThreadPage(props: {
  params: Promise<{ lang: string; threadId: string }>;
}) {
  const { lang, threadId } = await props.params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return <ChatThreadPageClient threadId={threadId} lang={lang} dict={dict} />;
}
