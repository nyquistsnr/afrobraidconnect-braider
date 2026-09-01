"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import { usersApi } from "@/lib/api/users-client";
import { ChatLocaleBanner } from "@/components/dashboard/chat/chat-locale-banner";
import { ThreadList } from "@/components/dashboard/chat/thread-list";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";

export function ChatPageClient({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary;
}) {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const userQuery = useQuery({
    queryKey: ["me", lang],
    queryFn: () => usersApi.getMe(accessToken!, lang),
    enabled: !!accessToken,
  });

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {dict.chat.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {dict.chat.inbox.subtitle}
        </p>
      </div>

      {userQuery.isLoading && <DashboardLoading label={dict.common.loading} />}

      {accessToken && userQuery.data && !userQuery.data.chat_locale && (
        <ChatLocaleBanner
          accessToken={accessToken}
          lang={lang}
          dict={dict.chat.localeBanner}
          common={dict.common}
        />
      )}

      <ThreadList dict={dict.chat.inbox} lang={lang} />
    </div>
  );
}
