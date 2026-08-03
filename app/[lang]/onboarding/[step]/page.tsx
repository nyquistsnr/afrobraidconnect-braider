import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDictionary, hasLocale } from "../../dictionaries";
import { onboardingApi } from "@/lib/api/onboarding-client";
import { stepSlugToStep } from "@/lib/onboarding";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";

// Placeholder for the onboarding steps that don't have a built screen yet
// (VERIFF, SERVICE_TYPE, PORTFOLIO, SERVICE_LOCATION, AVAILABILITY,
// PAYMENT_SETUP) — only business-info and phone-verification are wired up
// against the real API today.
export default async function OnboardingStepPlaceholderPage({
  params,
}: PageProps<"/[lang]/onboarding/[step]">) {
  const { lang, step: stepSlug } = await params;

  if (!hasLocale(lang)) notFound();
  if (!stepSlugToStep(stepSlug)) notFound();

  const session = await auth();
  if (!session) redirect(`/${lang}/login`);
  if (!session.braider) redirect(`/${lang}/dashboard`);

  const dict = await getDictionary(lang);

  const status = await onboardingApi
    .getStatus(session.accessToken)
    .catch(() => {
      redirect(`/${lang}/login`);
    });

  if (status.current_step === "COMPLETED") redirect(`/${lang}/dashboard`);

  return (
    <OnboardingShell lang={lang} dict={dict} status={status}>
      <div className="w-full">
        <h1 className="text-3xl font-bold text-foreground">
          {dict.onboarding.comingSoon.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {dict.onboarding.comingSoon.subtitle}
        </p>

        <Link
          href={`/${lang}/dashboard`}
          className="mt-8 inline-block font-medium text-brand hover:text-brand-hover"
        >
          {dict.common.backToDashboard}
        </Link>
      </div>
    </OnboardingShell>
  );
}
