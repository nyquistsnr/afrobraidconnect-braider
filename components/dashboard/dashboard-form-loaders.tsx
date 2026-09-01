"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import { onboardingApi } from "@/lib/api/onboarding-client";
import { DashboardAvailability } from "@/components/dashboard/availability/dashboard-availability";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";
import { DashboardLocation } from "@/components/dashboard/location/dashboard-location";
import { DashboardServiceStyle } from "@/components/dashboard/service-style/dashboard-service-style";

type DashboardAvailabilityCopy = Dictionary["onboarding"]["availability"] & {
  dashboardTitle?: string;
  dashboardSubtitle?: string;
};

function LoadError({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-border bg-surface px-4 py-12 text-center text-sm text-muted-foreground shadow-sm">
      {children}
    </div>
  );
}

export function DashboardAvailabilityLoader({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary;
}) {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const availabilityDict = dict.onboarding.availability as DashboardAvailabilityCopy;

  const availabilityQuery = useQuery({
    queryKey: ["dashboard-availability", lang],
    queryFn: async () => {
      const [settings, windows, exceptions] = await Promise.all([
        onboardingApi.getAvailabilitySettings(accessToken!, lang),
        onboardingApi.getWeeklyWindows(accessToken!, lang),
        onboardingApi.getExceptions(accessToken!, lang),
      ]);
      return { settings, windows, exceptions };
    },
    enabled: !!accessToken,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {availabilityDict.dashboardTitle ?? dict.onboarding.availability.title}
        </h1>
        <p className="text-muted-foreground">
          {availabilityDict.dashboardSubtitle ?? dict.onboarding.availability.subtitle}
        </p>
      </div>

      {availabilityQuery.isLoading && <DashboardLoading label={dict.common.loading} />}
      {availabilityQuery.isError && <LoadError>{dict.dashboard.bookings.loadError}</LoadError>}
      {availabilityQuery.data && (
        <DashboardAvailability
          dict={dict.onboarding.availability}
          common={dict.common}
          lang={lang}
          initialSettings={availabilityQuery.data.settings}
          initialWindows={availabilityQuery.data.windows}
          initialExceptions={availabilityQuery.data.exceptions}
        />
      )}
    </div>
  );
}

export function DashboardLocationLoader({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary;
}) {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const locationQuery = useQuery({
    queryKey: ["dashboard-location", lang],
    queryFn: () => onboardingApi.getServiceLocation(accessToken!, lang),
    enabled: !!accessToken,
  });

  return (
    <div className="w-full">
      {locationQuery.isLoading && <DashboardLoading label={dict.common.loading} />}
      {locationQuery.isError && <LoadError>{dict.dashboard.bookings.loadError}</LoadError>}
      {locationQuery.data && (
        <DashboardLocation
          dict={dict.onboarding.serviceLocation}
          common={dict.common}
          lang={lang}
          initialData={locationQuery.data}
        />
      )}
    </div>
  );
}

export function DashboardServiceStyleLoader({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary;
}) {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const servicesQuery = useQuery({
    queryKey: ["dashboard-services", lang],
    queryFn: () => onboardingApi.getServices(accessToken!, lang, 1, 100),
    enabled: !!accessToken,
  });

  return (
    <div className="w-full">
      {servicesQuery.isLoading && <DashboardLoading label={dict.common.loading} />}
      {servicesQuery.isError && <LoadError>{dict.dashboard.bookings.loadError}</LoadError>}
      {servicesQuery.data && (
        <DashboardServiceStyle
          dict={dict.onboarding.serviceType}
          common={dict.common}
          lang={lang}
          initialServices={servicesQuery.data.items}
        />
      )}
    </div>
  );
}

export function DashboardOnboardingStatusLoader({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary;
}) {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const statusQuery = useQuery({
    queryKey: ["dashboard-onboarding-status", lang],
    queryFn: () => onboardingApi.getStatus(accessToken!, lang),
    enabled: !!accessToken,
  });

  const status = statusQuery.data;
  const steps = status
    ? [
        { id: "business_info", label: dict.onboarding.stepper.businessInfo, date: status.business_info_completed_at },
        { id: "phone_verification", label: dict.onboarding.stepper.phoneVerification, date: status.phone_verification_completed_at },
        { id: "veriff", label: dict.onboarding.stepper.veriff, date: status.veriff_completed_at },
        { id: "service_type", label: dict.onboarding.stepper.serviceType, date: status.service_type_completed_at },
        { id: "portfolio", label: dict.onboarding.stepper.portfolio, date: status.portfolio_completed_at },
        { id: "service_location", label: dict.onboarding.stepper.serviceLocation, date: status.service_location_completed_at },
        { id: "availability", label: dict.onboarding.stepper.availability, date: status.availability_completed_at },
        { id: "payment_setup", label: dict.onboarding.stepper.paymentSetup, date: status.payment_setup_completed_at },
      ]
    : [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Onboarding Status
        </h1>
        <p className="mt-1 text-muted-foreground">
          Review your progress and see when each step was completed.
        </p>
      </div>

      {statusQuery.isLoading && <DashboardLoading label={dict.common.loading} />}
      {statusQuery.isError && <LoadError>{dict.dashboard.bookings.loadError}</LoadError>}

      {status && (
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <div className="relative ml-3 space-y-8 border-l-2 border-border/60 py-2 md:ml-4">
            {steps.map((step) => {
              const isCompleted = !!step.date;
              return (
                <div key={step.id} className="relative pl-8">
                  <div
                    className={`absolute -left-[17px] top-1 flex h-8 w-8 items-center justify-center rounded-full bg-surface ${
                      isCompleted ? "text-green-500" : "text-border"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6 fill-green-500/10" />
                    ) : (
                      <Circle className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 text-transparent" />
                    )}
                  </div>

                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                    <div>
                      <h3 className={`text-base font-medium ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {isCompleted ? (
                          <span className="flex items-center gap-1.5 font-medium text-green-600/80">
                            Completed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-amber-500/80">
                            <Clock className="h-3.5 w-3.5" />
                            Pending
                          </span>
                        )}
                      </p>
                    </div>

                    {isCompleted && step.date && (
                      <div className="self-start rounded-full border border-border/50 bg-muted/40 px-3 py-1 text-sm text-muted-foreground">
                        {new Intl.DateTimeFormat(lang, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(step.date))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {status.completed_at && (
            <div className="mt-8 flex items-center justify-center border-t border-border pt-6 text-center">
              <div className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 px-6 py-3 font-medium text-green-600 sm:flex-row">
                <CheckCircle2 className="h-5 w-5" />
                All Onboarding Steps Completed on{" "}
                {new Intl.DateTimeFormat(lang, { dateStyle: "medium" }).format(
                  new Date(status.completed_at)
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
