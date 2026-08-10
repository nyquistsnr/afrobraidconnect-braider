import { redirect, notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../dictionaries";
import { Locale } from "@/lib/i18n";
import { auth } from "@/auth";
import { onboardingApi } from "@/lib/api/onboarding-client";
import { ServiceTypeForm } from "@/components/onboarding/service-type-form";

export default async function DashboardServiceStylePage(props: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await props.params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang as Locale);
  const session = await auth();

  if (!session?.accessToken) {
    redirect(`/${lang}/login`);
  }

  // Fetch the first page of services. In a full implementation, the dashboard version 
  // might want a paginated table or fetch all, but reusing the onboarding form which uses
  // initialServices (and currently assumes all services are fetched or handles it client-side)
  // is sufficient for this scope. The onboarding API returns paginated data.
  const servicesData = await onboardingApi.getServices(session.accessToken, lang as Locale, 1, 100).catch((error) => {
    console.error("Failed to fetch service styles:", error);
    throw error;
  });

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <ServiceTypeForm
          dict={dict.onboarding.serviceType}
          common={dict.common}
          lang={lang as Locale}
          initialServices={servicesData.items}
          isDashboard={true}
        />
      </div>
    </div>
  );
}
