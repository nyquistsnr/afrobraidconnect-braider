import { redirect, notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../dictionaries";
import { Locale } from "@/lib/i18n";
import { auth } from "@/auth";
import { onboardingApi } from "@/lib/api/onboarding-client";
import { ServiceLocationForm } from "@/components/onboarding/service-location-form";

export default async function DashboardLocationPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await props.params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang as Locale);
  const session = await auth();

  if (!session?.accessToken) {
    redirect(`/${lang}/login`);
  }

  // Fetch the location data
  const locationData = await onboardingApi.getServiceLocation(session.accessToken, lang as Locale).catch((error) => {
    console.error("Failed to fetch location data:", error);
    throw error;
  });

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <ServiceLocationForm
          dict={dict.onboarding.serviceLocation}
          common={dict.common}
          lang={lang as Locale}
          initialData={locationData}
          isDashboard={true}
        />
      </div>
    </div>
  );
}
