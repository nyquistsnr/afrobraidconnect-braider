import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDictionary, hasLocale, locales } from "../../dictionaries";
import { onboardingApi } from "@/lib/api/onboarding-client";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { ServiceTypeForm } from "@/components/onboarding/service-type-form";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function ServiceTypePage({
  params,
}: PageProps<"/[lang]/onboarding/service-type">) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const session = await auth();
  if (!session) redirect(`/${lang}/login`);
  if (!session.braider) redirect(`/${lang}/dashboard`);

  const dict = await getDictionary(lang);

  const [status, services] = await Promise.all([
    onboardingApi.getStatus(session.accessToken),
    onboardingApi.getServices(session.accessToken),
  ]).catch(() => {
    redirect(`/${lang}/login`);
  });

  if (status.current_step === "COMPLETED") redirect(`/${lang}/dashboard`);

  return (
    <OnboardingShell
      lang={lang}
      dict={dict}
      status={status}
      step="SERVICE_TYPE"
    >
      <ServiceTypeForm
        dict={dict.onboarding.serviceType}
        common={dict.common}
        lang={lang}
        initialServices={services.items}
      />
    </OnboardingShell>
  );
}
