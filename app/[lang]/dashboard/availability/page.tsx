import { redirect, notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../dictionaries";
import { Locale } from "@/lib/i18n";
import { auth } from "@/auth";
import { onboardingApi } from "@/lib/api/onboarding-client";
import { AvailabilityForm } from "@/components/onboarding/availability-form";

export default async function DashboardAvailabilityPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await props.params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang as Locale);
  const session = await auth();

  if (!session?.accessToken) {
    redirect(`/${lang}/login`);
  }

  // Fetch all required data for the availability form concurrently
  const [settings, windows, exceptions] = await Promise.all([
    onboardingApi.getAvailabilitySettings(session.accessToken, lang as Locale),
    onboardingApi.getWeeklyWindows(session.accessToken, lang as Locale),
    onboardingApi.getExceptions(session.accessToken, lang as Locale),
  ]).catch((error) => {
    console.error("Failed to fetch availability data:", error);
    throw error;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {dict.onboarding.availability.title}
        </h1>
        <p className="text-muted-foreground">
          {dict.onboarding.availability.subtitle}
        </p>
      </div>
      
      <div className="rounded-xl border border-border bg-surface shadow-sm pt-0">
        <AvailabilityForm
          dict={dict.onboarding.availability}
          common={dict.common}
          lang={lang as Locale}
          initialSettings={settings}
          initialWindows={windows}
          initialExceptions={exceptions}
          isDashboard={true}
        />
      </div>
    </div>
  );
}
