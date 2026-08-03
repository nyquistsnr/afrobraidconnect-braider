import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { OnboardingStatusResponse } from "@/lib/api/types";
import { ONBOARDING_STEP_ORDER, STEP_DICT_KEYS } from "@/lib/onboarding";

export function OnboardingStepper({
  dict,
  status,
}: {
  dict: Dictionary["onboarding"];
  status: OnboardingStatusResponse;
}) {
  const total = ONBOARDING_STEP_ORDER.length;
  const index = ONBOARDING_STEP_ORDER.indexOf(
    status.current_step as (typeof ONBOARDING_STEP_ORDER)[number]
  );
  const stepNumber = index === -1 ? total : index + 1;
  const stepper = dict.stepper as Record<string, string>;
  const stepLabel =
    index === -1 ? undefined : stepper[STEP_DICT_KEYS[ONBOARDING_STEP_ORDER[index]]];

  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between gap-4 text-xs font-medium text-muted-foreground">
        <span>
          {dict.stepOf
            .replace("{current}", String(stepNumber))
            .replace("{total}", String(total))}
        </span>
        {stepLabel && <span className="text-foreground">{stepLabel}</span>}
      </div>
      <div className="h-1.5 w-full overflow-hidden bg-border">
        <div
          className="h-full bg-brand transition-all"
          style={{ width: `${(stepNumber / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
