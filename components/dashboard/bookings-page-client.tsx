"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CheckCircle, Clock, XCircle } from "lucide-react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { BookingStatus } from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";
import { bookingsApi } from "@/lib/api/bookings-client";
import { BookingsTable } from "@/components/dashboard/bookings-table";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";
import { StatsCards } from "@/components/dashboard/stats-cards";

export function BookingsPageClient({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary;
}) {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const filterParams = useMemo(
    () => ({
      status: (searchParams.get("status") as BookingStatus | null) || undefined,
      date_from: searchParams.get("date_from") || undefined,
      date_to: searchParams.get("date_to") || undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1,
      page_size: 20,
    }),
    [searchParams]
  );

  const statsQuery = useQuery({
    queryKey: [
      "braider-booking-stats",
      lang,
      filterParams.date_from,
      filterParams.date_to,
    ],
    queryFn: () =>
      bookingsApi.getStats(accessToken!, lang, {
        date_from: filterParams.date_from,
        date_to: filterParams.date_to,
      }),
    enabled: !!accessToken,
  });

  const stats = statsQuery.data;
  const statCardsData = stats
    ? [
        {
          title: dict.dashboard.bookings.stats.totalBookings,
          value: stats.total_bookings,
          icon: <CalendarDays />,
        },
        {
          title: dict.dashboard.bookings.stats.completed,
          value: stats.completed,
          icon: <CheckCircle />,
        },
        {
          title: dict.dashboard.bookings.stats.upcoming,
          value: stats.upcoming,
          icon: <Clock />,
        },
        {
          title: dict.dashboard.bookings.stats.declined,
          value: stats.declined,
          icon: <XCircle />,
        },
      ]
    : [];

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {dict.dashboard.bookings.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {dict.dashboard.bookings.subtitle}
        </p>
      </div>

      {statsQuery.isLoading && <DashboardLoading label={dict.common.loading} />}
      {stats && <StatsCards cards={statCardsData} />}

      <BookingsTable dict={dict.dashboard.bookings} common={dict.common} lang={lang} />
    </div>
  );
}
