import { notFound, redirect } from "next/navigation";
import { getDictionary, hasLocale, locales } from "../../dictionaries";
import { auth } from "@/auth";
import { bookingsApi } from "@/lib/api/bookings-client";
import { BookingsTable } from "@/components/dashboard/bookings-table";

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
  const initialData = await bookingsApi.list(session.accessToken);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {dict.dashboard.bookings.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {dict.dashboard.bookings.subtitle}
        </p>
      </div>

      <BookingsTable
        dict={dict.dashboard.bookings}
        common={dict.common}
        lang={lang}
        initialData={initialData}
      />
    </div>
  );
}
