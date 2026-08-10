import { notFound, redirect } from "next/navigation";
import { getDictionary, hasLocale, locales } from "../../dictionaries";
import { Locale } from "@/lib/i18n";
import { auth } from "@/auth";
import { paymentsApi } from "@/lib/api/payments-client";
import { bookingsApi } from "@/lib/api/bookings-client";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { BookingTrendChart } from "@/components/dashboard/booking-trend-chart";
import { PaymentsTable } from "@/components/dashboard/payments-table";
import { PaymentFilters } from "@/components/dashboard/payment-filters";
import { DollarSign, ArrowDownRight, Activity, Clock } from "lucide-react";
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function PaymentPage(props: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ date_from?: string; date_to?: string }>;
}) {
  const { lang } = await props.params;
  const searchParams = await props.searchParams;

  if (!hasLocale(lang)) notFound();

  const session = await auth();
  if (!session?.accessToken || session.error === "RefreshAccessTokenError") {
    redirect(`/${lang}/login`);
  }

  const dict = await getDictionary(lang);

  const dateFrom = searchParams.date_from;
  const dateTo = searchParams.date_to;

  // Fetch all payment data in parallel
  const [paymentStatsRes, timeseriesRes, paymentsListRes] = await Promise.all([
    paymentsApi.getStats(session.accessToken, lang, {
      date_from: dateFrom,
      date_to: dateTo,
    }),
    bookingsApi.getTimeseries(session.accessToken, lang, {
      date_from: dateFrom,
      date_to: dateTo,
      interval: "day",
    }),
    paymentsApi.list(session.accessToken, lang, { 
      page: 1, 
      page_size: 20,
      date_from: dateFrom,
      date_to: dateTo,
    })
  ]);

  const pStats = paymentStatsRes;
  const timeseries = timeseriesRes;
  const paymentsList = paymentsListRes;

  const formatCurrency = (amount: string, currency: string) => {
    return new Intl.NumberFormat(lang, {
      style: "currency",
      currency: currency,
    }).format(parseFloat(amount));
  };

  const statCardsData = pStats ? [
    {
      title: dict.payment.stats.netRevenue,
      value: formatCurrency(pStats.net_revenue, pStats.currency),
      icon: <Activity />,
    },
    {
      title: dict.payment.stats.totalReceived,
      value: formatCurrency(pStats.total_received, pStats.currency),
      icon: <DollarSign />,
    },
    {
      title: dict.payment.stats.totalRefunded,
      value: formatCurrency(pStats.total_refunded, pStats.currency),
      icon: <ArrowDownRight />,
    },
    {
      title: dict.payment.stats.pending,
      value: formatCurrency(pStats.pending, pStats.currency),
      icon: <Clock />,
    },
  ] : [];

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {dict.payment.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {dict.payment.subtitle}
          </p>
        </div>

        <PaymentFilters 
          lang={lang as Locale}
          dict={dict.dashboard.bookings.filters}
        />
      </div>

      {pStats && <StatsCards cards={statCardsData} />}

      {timeseries && (
        <BookingTrendChart 
          data={timeseries} 
          title={dict.payment.trendChart.title} 
          subtitle={dict.payment.trendChart.subtitle}
          emptyText={dict.payment.trendChart.empty}
        />
      )}

      {paymentsList && (
        <PaymentsTable 
          initialData={paymentsList} 
          lang={lang as Locale} 
          dict={dict.payment.table}
          dateFrom={dateFrom}
          dateTo={dateTo}
        />
      )}
    </div>
  );
}
