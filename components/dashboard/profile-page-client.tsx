"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import { usersApi } from "@/lib/api/users-client";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";
import { ProfileForm } from "@/components/dashboard/profile-form";

export function ProfilePageClient({
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
    <div className="mx-auto max-w-2xl pt-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {dict.dashboard.profile.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {dict.dashboard.profile.subtitle}
        </p>
      </div>

      {userQuery.isLoading && <DashboardLoading label={dict.common.loading} />}

      {userQuery.isError && (
        <div className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-muted-foreground shadow-sm">
          {dict.dashboard.bookings.loadError}
        </div>
      )}

      {userQuery.data && accessToken && (
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <ProfileForm
            user={userQuery.data}
            logoUrl={session?.braider?.logo_url ?? null}
            dict={dict.dashboard.profile}
            common={dict.common}
            accessToken={accessToken}
            lang={lang}
          />
        </div>
      )}
    </div>
  );
}
