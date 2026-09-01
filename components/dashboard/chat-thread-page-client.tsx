"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import { chatApi } from "@/lib/api/chat-client";
import { usersApi } from "@/lib/api/users-client";
import { ChatLocaleBanner } from "@/components/dashboard/chat/chat-locale-banner";
import { ThreadView } from "@/components/dashboard/chat/thread-view";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";

const THREADS_LOOKUP_PAGE_SIZE = 100;

export function ChatThreadPageClient({
  threadId,
  lang,
  dict,
}: {
  threadId: string;
  lang: Locale;
  dict: Dictionary;
}) {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const threadQuery = useQuery({
    queryKey: ["chat-thread-page", threadId, lang],
    queryFn: async () => {
      const [messages, threadsLookup, user] = await Promise.all([
        chatApi.listMessages(accessToken!, threadId, lang, {
          page: 1,
          page_size: 20,
        }),
        chatApi
          .listThreads(accessToken!, lang, {
            page: 1,
            page_size: THREADS_LOOKUP_PAGE_SIZE,
          })
          .catch(() => null),
        usersApi.getMe(accessToken!, lang),
      ]);

      return {
        messages,
        otherParticipantName:
          threadsLookup?.items.find((thread) => thread.id === threadId)
            ?.other_participant_name ?? null,
        user,
      };
    },
    enabled: !!accessToken,
    retry: false,
  });

  const data = threadQuery.data;

  return (
    <div className="mx-auto flex h-[calc(100dvh-6rem)] w-full max-w-4xl flex-col sm:h-[calc(100dvh-7rem)]">
      {threadQuery.isLoading && <DashboardLoading label={dict.common.loading} />}

      {threadQuery.isError && (
        <div className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-muted-foreground shadow-sm">
          {dict.chat.thread.loadError}
        </div>
      )}

      {accessToken && data && !data.user.chat_locale && (
        <ChatLocaleBanner
          accessToken={accessToken}
          lang={lang}
          dict={dict.chat.localeBanner}
          common={dict.common}
        />
      )}

      {data && (
        <ThreadView
          threadId={threadId}
          otherParticipantName={data.otherParticipantName}
          initialData={data.messages}
          lang={lang}
          dict={dict.chat}
          common={dict.common}
          currentUserId={session!.user.id}
          currentChatLocale={data.user.chat_locale}
        />
      )}
    </div>
  );
}
