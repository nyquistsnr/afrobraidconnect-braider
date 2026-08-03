import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDictionary, hasLocale, locales } from "../../dictionaries";
import { onboardingApi } from "@/lib/api/onboarding-client";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { BusinessInfoForm } from "@/components/onboarding/business-info-form";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function BusinessInfoPage({
  params,
}: PageProps<"/[lang]/onboarding/business-info">) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const session = await auth();
  if (!session) redirect(`/${lang}/login`);
  if (!session.braider) redirect(`/${lang}/dashboard`);

  const dict = await getDictionary(lang);

  const [status, businessInfo] = await Promise.all([
    onboardingApi.getStatus(session.accessToken),
    onboardingApi.getBusinessInfo(session.accessToken),
  ]).catch(() => {
    redirect(`/${lang}/login`);
  });

  if (status.current_step === "COMPLETED") redirect(`/${lang}/dashboard`);

  return (
    <OnboardingShell lang={lang} dict={dict} status={status}>
      <BusinessInfoForm
        dict={dict.onboarding.businessInfo}
        common={dict.common}
        lang={lang}
        initialData={businessInfo}
      />
    </OnboardingShell>
  );
}
