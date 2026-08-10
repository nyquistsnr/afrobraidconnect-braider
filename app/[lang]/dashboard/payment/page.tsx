import { notFound, redirect } from "next/navigation";
import { getDictionary, hasLocale, locales } from "../../dictionaries";
import { Locale } from "@/lib/i18n";
import { auth } from "@/auth";
import { paymentsApi } from "@/lib/api/payments-client";
import { bookingsApi } from "@/lib/api/bookings-client";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { BookingTrendChart } from "@/components/dashboard/booking-trend-chart";
import { PaymentsTable } from "@/components/dashboard/payments-table";
import { DollarSign, ArrowDownRight, Activity, Clock } from "lucide-react";
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function PaymentPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await props.params;

  if (!hasLocale(lang)) notFound();

  const session = await auth();
  if (!session?.accessToken || session.error === "RefreshAccessTokenError") {
    redirect(`/${lang}/login`);
  }

  const dict = await getDictionary(lang);

  // Default past 90 days for trend graph
  const today = new Date();
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(today.getDate() - 90);
  
  const dateTo = today.toISOString();
  const dateFrom = ninetyDaysAgo.toISOString();

  // Fetch all payment data in parallel
  const [paymentStatsRes, timeseriesRes, paymentsListRes] = await Promise.all([
    paymentsApi.getStats(session.accessToken, lang),
    bookingsApi.getTimeseries(session.accessToken, lang, {
      date_from: dateFrom,
      date_to: dateTo,
      interval: "day",
    }),
    paymentsApi.list(session.accessToken, lang, { page: 1, page_size: 20 })
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
      title: "Net Revenue",
      value: formatCurrency(pStats.net_revenue, pStats.currency),
      icon: <Activity />,
    },
    {
      title: "Total Received",
      value: formatCurrency(pStats.total_received, pStats.currency),
      icon: <DollarSign />,
    },
    {
      title: "Total Refunded",
      value: formatCurrency(pStats.total_refunded, pStats.currency),
      icon: <ArrowDownRight />,
    },
    {
      title: "Pending Payments",
      value: formatCurrency(pStats.pending, pStats.currency),
      icon: <Clock />,
    },
  ] : [];

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {dict.payment.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your earnings and payment history
        </p>
      </div>

      {pStats && <StatsCards cards={statCardsData} />}

      {timeseries && (
        <BookingTrendChart 
          data={timeseries} 
          title="Booking Trends" 
          subtitle="Past 90 days"
        />
      )}

      {paymentsList && (
        <PaymentsTable 
          initialData={paymentsList} 
          lang={lang as Locale} 
        />
      )}
    </div>
  );
}
