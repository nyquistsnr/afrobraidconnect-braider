import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDictionary, hasLocale, locales } from "../../dictionaries";
import { onboardingApi } from "@/lib/api/onboarding-client";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { VeriffForm } from "@/components/onboarding/veriff-form";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function IdVerificationPage({
  params,
}: PageProps<"/[lang]/onboarding/id-verification">) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const session = await auth();
  if (!session) redirect(`/${lang}/login`);
  if (!session.braider) redirect(`/${lang}/dashboard`);

  const dict = await getDictionary(lang);

  const [status, veriffStatus] = await Promise.all([
    onboardingApi.getStatus(session.accessToken),
    onboardingApi.getVeriffStatus(session.accessToken),
  ]).catch(() => {
    redirect(`/${lang}/login`);
  });

  if (status.current_step === "COMPLETED") redirect(`/${lang}/dashboard`);

  return (
    <OnboardingShell lang={lang} dict={dict} status={status} step="VERIFF">
      <VeriffForm
        dict={dict.onboarding.veriff}
        common={dict.common}
        lang={lang}
        initialStatus={veriffStatus}
      />
    </OnboardingShell>
  );
}
