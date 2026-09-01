"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import { bookingsApi } from "@/lib/api/bookings-client";
import { BookingDetail } from "@/components/dashboard/booking-detail";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";

export function BookingDetailPageClient({
  id,
  lang,
  dict,
}: {
  id: string;
  lang: Locale;
  dict: Dictionary;
}) {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const bookingQuery = useQuery({
    queryKey: ["booking-detail", id, lang],
    queryFn: () => bookingsApi.getById(accessToken!, id, lang),
    enabled: !!accessToken,
    retry: false,
  });

  return (
    <div className="w-full">
      <div className="mb-6">
        <Link
          href={`/${lang}/dashboard/bookings`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          {dict.common.back || "Back to bookings"}
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {dict.dashboard.bookings.detail.title}
        </h1>
      </div>

      {bookingQuery.isLoading && <DashboardLoading label={dict.common.loading} />}

      {bookingQuery.isError && (
        <div className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-muted-foreground shadow-sm">
          {dict.dashboard.bookings.loadError}
        </div>
      )}

      {bookingQuery.data && (
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <BookingDetail
            booking={bookingQuery.data}
            lang={lang}
            dict={dict.dashboard.bookings}
            common={dict.common}
          />
        </div>
      )}
    </div>
  );
}
