import { notFound, redirect } from "next/navigation";
import { getDictionary, hasLocale, locales } from "../../dictionaries";
import { auth } from "@/auth";
import { bookingsApi } from "@/lib/api/bookings-client";
import { BookingsTable } from "@/components/dashboard/bookings-table";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { CalendarDays, CheckCircle, XCircle, Clock } from "lucide-react";
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function BookingsPage({
  params,
}: PageProps<"/[lang]/dashboard/bookings">) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const session = await auth();
  if (!session?.accessToken || session.error === "RefreshAccessTokenError") {
    redirect(`/${lang}/login`);
  }

  const dict = await getDictionary(lang);
  
  // Fetch data in parallel
  const [initialData, statsResponse] = await Promise.all([
    bookingsApi.list(session.accessToken, lang),
    bookingsApi.getStats(session.accessToken, lang)
  ]);
  
  const stats = statsResponse;

  const statCardsData = stats ? [
    {
      title: "Total Bookings",
      value: stats.total_bookings,
      icon: <CalendarDays />,
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: <CheckCircle />,
    },
    {
      title: "Upcoming",
      value: stats.upcoming,
      icon: <Clock />,
    },
    {
      title: "Declined",
      value: stats.declined,
      icon: <XCircle />,
    },
  ] : [];

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

      {stats && <StatsCards cards={statCardsData} />}

      <BookingsTable
        dict={dict.dashboard.bookings}
        common={dict.common}
        lang={lang}
        initialData={initialData}
      />
    </div>
  );
}
