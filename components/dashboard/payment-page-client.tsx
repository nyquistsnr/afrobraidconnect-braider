"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Activity, ArrowDownRight, Clock, DollarSign } from "lucide-react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import { bookingsApi } from "@/lib/api/bookings-client";
import { paymentsApi } from "@/lib/api/payments-client";
import { BookingTrendChart } from "@/components/dashboard/booking-trend-chart";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";
import { PaymentFilters } from "@/components/dashboard/payment-filters";
import { PaymentsTable } from "@/components/dashboard/payments-table";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { StripeDashboardButton } from "@/components/dashboard/stripe-dashboard-button";

function defaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 90);
  return {
    dateFrom: start.toISOString().split("T")[0],
    dateTo: end.toISOString().split("T")[0],
  };
}

export function PaymentPageClient({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary;
}) {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const { dateFrom, dateTo } = useMemo(() => {
    const from = searchParams.get("date_from");
    const to = searchParams.get("date_to");
    if (from && to) return { dateFrom: from, dateTo: to };
    return defaultDateRange();
  }, [searchParams]);

  const paymentQuery = useQuery({
    queryKey: ["braider-payment-page", lang, dateFrom, dateTo],
    queryFn: async () => {
      const [paymentStats, timeseries, paymentsList] = await Promise.all([
        paymentsApi.getStats(accessToken!, lang, {
          date_from: dateFrom,
          date_to: dateTo,
        }),
        bookingsApi.getTimeseries(accessToken!, lang, {
          date_from: dateFrom,
          date_to: dateTo,
          interval: "day",
        }),
        paymentsApi.list(accessToken!, lang, {
          page: 1,
          page_size: 20,
          date_from: dateFrom,
          date_to: dateTo,
        }),
      ]);

      return { paymentStats, timeseries, paymentsList };
    },
    enabled: !!accessToken,
  });

  const formatCurrency = (amount: string, currency: string) =>
    new Intl.NumberFormat(lang, {
      style: "currency",
      currency,
    }).format(parseFloat(amount));

  const data = paymentQuery.data;
  const statCardsData = data
    ? [
        {
          title: dict.payment.stats.netRevenue,
          value: formatCurrency(data.paymentStats.net_revenue, data.paymentStats.currency),
          icon: <Activity />,
        },
        {
          title: dict.payment.stats.totalReceived,
          value: formatCurrency(data.paymentStats.total_received, data.paymentStats.currency),
          icon: <DollarSign />,
        },
        {
          title: dict.payment.stats.totalRefunded,
          value: formatCurrency(data.paymentStats.total_refunded, data.paymentStats.currency),
          icon: <ArrowDownRight />,
        },
        {
          title: dict.payment.stats.pending,
          value: formatCurrency(data.paymentStats.pending, data.paymentStats.currency),
          icon: <Clock />,
        },
      ]
    : [];

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-row flex-wrap items-end justify-between gap-6">
        <div className="min-w-[280px] max-w-full">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {dict.payment.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {dict.payment.subtitle}
          </p>
        </div>

        <div className="flex w-full flex-row flex-wrap items-end gap-4 xl:w-auto">
          <div className="w-full flex-shrink-0 sm:w-auto">
            <StripeDashboardButton lang={lang} dict={dict.payment} />
          </div>

          <div className="w-full flex-shrink-0 sm:w-auto">
            <PaymentFilters lang={lang} dict={dict.dashboard.bookings.filters} />
          </div>
        </div>
      </div>

      {paymentQuery.isLoading && <DashboardLoading label={dict.common.loading} />}

      {paymentQuery.isError && (
        <div className="border border-border bg-surface px-4 py-12 text-center text-sm text-muted-foreground shadow-sm">
          {dict.dashboard.bookings.loadError}
        </div>
      )}

      {data && (
        <>
          <StatsCards cards={statCardsData} />

          <BookingTrendChart
            data={data.timeseries}
            title={dict.payment.trendChart.title}
            subtitle={dict.payment.trendChart.subtitle}
            emptyText={dict.payment.trendChart.empty}
          />

          <PaymentsTable
            initialData={data.paymentsList}
            lang={lang}
            dict={dict.payment.table}
            dateFrom={dateFrom}
            dateTo={dateTo}
          />
        </>
      )}
    </div>
  );
}
