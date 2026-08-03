import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDictionary, hasLocale, locales } from "../../dictionaries";
import { onboardingApi } from "@/lib/api/onboarding-client";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { PhoneVerificationForm } from "@/components/onboarding/phone-verification-form";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function PhoneVerificationPage({
  params,
}: PageProps<"/[lang]/onboarding/phone-verification">) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const session = await auth();
  if (!session) redirect(`/${lang}/login`);
  if (!session.braider) redirect(`/${lang}/dashboard`);

  const dict = await getDictionary(lang);

  const [status, phoneStatus] = await Promise.all([
    onboardingApi.getStatus(session.accessToken),
    onboardingApi.getPhoneVerificationStatus(session.accessToken),
  ]).catch(() => {
    redirect(`/${lang}/login`);
  });

  if (status.current_step === "COMPLETED") redirect(`/${lang}/dashboard`);

  return (
    <OnboardingShell lang={lang} dict={dict} status={status}>
      <PhoneVerificationForm
        dict={dict.onboarding.phoneVerification}
        common={dict.common}
        lang={lang}
        defaultPhoneNumber={phoneStatus.phone_number}
      />
    </OnboardingShell>
  );
}
