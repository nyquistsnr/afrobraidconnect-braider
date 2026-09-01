"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Activity, CalendarCheck, DollarSign, Users } from "lucide-react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import { bookingsApi } from "@/lib/api/bookings-client";
import { dashboardApi } from "@/lib/api/dashboard-client";
import { BusiestDaysChart } from "@/components/dashboard/busiest-days-chart";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";
import { RecentBookingsTable } from "@/components/dashboard/recent-bookings-table";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TopStylesChart } from "@/components/dashboard/top-styles-chart";

type DashboardHomeCopy = Dictionary["dashboard"]["home"] & {
  stats?: {
    totalBookings?: string;
    totalRevenue?: string;
    completionRate?: string;
    uniqueCustomers?: string;
  };
  revenueChart?: { title?: string };
  busiestDaysChart?: { title?: string };
  topStylesChart?: { title?: string };
  recentBookings?: { title?: string; viewAll?: string };
};

function defaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 90);
  return {
    dateFrom: start.toISOString().split("T")[0],
    dateTo: end.toISOString().split("T")[0],
  };
}

export function DashboardOverview({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary;
}) {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const homeDict = dict.dashboard.home as DashboardHomeCopy;

  const { dateFrom, dateTo } = useMemo(() => {
    const from = searchParams.get("date_from");
    const to = searchParams.get("date_to");
    if (from && to) return { dateFrom: from, dateTo: to };
    return defaultDateRange();
  }, [searchParams]);

  const overviewQuery = useQuery({
    queryKey: ["dashboard-overview", lang, dateFrom, dateTo],
    queryFn: async () => {
      const [
        overview,
        revenueTimeseries,
        bookingsByWeekday,
        styleBreakdown,
        recentBookings,
      ] = await Promise.all([
        dashboardApi.getOverview(accessToken!, lang, {
          date_from: dateFrom,
          date_to: dateTo,
        }),
        dashboardApi.getRevenueTimeseries(accessToken!, lang, {
          date_from: dateFrom,
          date_to: dateTo,
          interval: "day",
        }),
        dashboardApi.getBookingsByWeekday(accessToken!, lang, {
          date_from: dateFrom,
          date_to: dateTo,
        }),
        dashboardApi.getStyleBreakdown(accessToken!, lang, {
          date_from: dateFrom,
          date_to: dateTo,
        }),
        bookingsApi.list(accessToken!, lang, {
          page: 1,
          page_size: 5,
          date_from: dateFrom,
          date_to: dateTo,
        }),
      ]);

      return {
        overview,
        revenueTimeseries,
        bookingsByWeekday,
        styleBreakdown,
        recentBookings,
      };
    },
    enabled: !!accessToken,
  });

  const formatCurrency = (amount: string, currency: string) =>
    new Intl.NumberFormat(lang, {
      style: "currency",
      currency,
    }).format(parseFloat(amount));

  const data = overviewQuery.data;
  const statCardsData = data
    ? [
        {
          title: homeDict.stats?.totalBookings || "Total Bookings",
          value: data.overview.total_bookings,
          icon: <CalendarCheck />,
        },
        {
          title: homeDict.stats?.totalRevenue || "Total Revenue",
          value: formatCurrency(data.overview.total_revenue, data.overview.currency),
          icon: <DollarSign />,
        },
        {
          title: homeDict.stats?.completionRate || "Completion Rate",
          value: `${data.overview.completion_rate}%`,
          icon: <Activity />,
        },
        {
          title: homeDict.stats?.uniqueCustomers || "Unique Customers",
          value: data.overview.unique_customers,
          icon: <Users />,
        },
      ]
    : [];

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {homeDict.greeting.replace("{name}", session?.user?.firstName || "")}
        </h1>
        <DashboardFilters lang={lang} dict={dict.dashboard.bookings.filters} />
      </div>

      {overviewQuery.isLoading && <DashboardLoading label={dict.common.loading} />}

      {overviewQuery.isError && (
        <div className="border border-border bg-surface px-4 py-12 text-center text-sm text-muted-foreground shadow-sm">
          {dict.dashboard.bookings.loadError}
        </div>
      )}

      {data && (
        <>
          <StatsCards cards={statCardsData} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RevenueChart
              data={data.revenueTimeseries}
              title={homeDict.revenueChart?.title || "Revenue"}
            />
            <BusiestDaysChart
              data={data.bookingsByWeekday}
              title={homeDict.busiestDaysChart?.title || "Busiest Days"}
              lang={lang}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <TopStylesChart
                data={data.styleBreakdown}
                title={homeDict.topStylesChart?.title || "Top Styles"}
              />
            </div>
            <div className="lg:col-span-2">
              <RecentBookingsTable
                data={data.recentBookings}
                title={homeDict.recentBookings?.title || "Recent Bookings"}
                viewAllText={homeDict.recentBookings?.viewAll || "View all bookings"}
                lang={lang}
                statusMap={dict.dashboard.bookings.status as Record<string, string>}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
