"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Clock, CalendarX2, Settings2 } from "lucide-react";
import { toast } from "react-toastify";

import { onboardingApi } from "@/lib/api/onboarding-client";
import type {
  AvailabilitySettingsResponse,
  WeeklyWindowResponse,
  AvailabilityExceptionResponse,
  DayOfWeek,
  AvailabilityExceptionType,
} from "@/lib/api/types";
import { Locale } from "@/lib/i18n";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface AvailabilityFormProps {
  dict: any;
  common: any;
  lang: Locale;
  initialSettings: AvailabilitySettingsResponse;
  initialWindows: WeeklyWindowResponse[];
  initialExceptions: AvailabilityExceptionResponse[];
}

const DAYS_OF_WEEK: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export function AvailabilityForm({
  dict,
  common,
  lang,
  initialSettings,
  initialWindows,
  initialExceptions,
}: AvailabilityFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.accessToken as string;
  const queryClient = useQueryClient();

  // Settings State
  const [settings, setSettings] = useState(initialSettings);
  
  // Local state for lists (could use react-query cache, but local state is easier to mutate optimistically)
  const [windows, setWindows] = useState(initialWindows);
  const [exceptions, setExceptions] = useState(initialExceptions);

  // New Window Form State
  const [newWindowDay, setNewWindowDay] = useState<DayOfWeek>("MONDAY");
  const [newWindowStart, setNewWindowStart] = useState("09:00");
  const [newWindowEnd, setNewWindowEnd] = useState("17:00");

  // New Exception Form State
  const [newExceptionDate, setNewExceptionDate] = useState("");
  const [newExceptionType, setNewExceptionType] = useState<AvailabilityExceptionType>("CLOSED");
  const [newExceptionStart, setNewExceptionStart] = useState("09:00");
  const [newExceptionEnd, setNewExceptionEnd] = useState("17:00");
  const [newExceptionReason, setNewExceptionReason] = useState("");

  // Mutations
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: typeof settings) => {
      return onboardingApi.updateAvailabilitySettings(token, data);
    },
    onSuccess: (data) => {
      setSettings(data);
      toast.success(dict.toasts.settingsSaved);
    },
    onError: (err: any) => toast.error(err.message || common.errors.validationError),
  });

  const addWindowMutation = useMutation({
    mutationFn: async () => {
      return onboardingApi.createWeeklyWindow(token, {
        day_of_week: newWindowDay,
        start_time: newWindowStart,
        end_time: newWindowEnd,
      });
    },
    onSuccess: (data) => {
      setWindows((prev) => [...prev, data]);
      toast.success(dict.toasts.windowAdded);
    },
    onError: (err: any) => toast.error(err.message || common.errors.validationError),
  });

  const deleteWindowMutation = useMutation({
    mutationFn: async (id: string) => {
      return onboardingApi.deleteWeeklyWindow(token, id);
    },
    onSuccess: (_, id) => {
      setWindows((prev) => prev.filter((w) => w.id !== id));
      toast.success(dict.toasts.windowRemoved);
    },
    onError: (err: any) => toast.error(err.message || common.errors.validationError),
  });

  const addExceptionMutation = useMutation({
    mutationFn: async () => {
      return onboardingApi.createException(token, {
        date: newExceptionDate,
        exception_type: newExceptionType,
        start_time: newExceptionType === "CUSTOM_HOURS" ? newExceptionStart : undefined,
        end_time: newExceptionType === "CUSTOM_HOURS" ? newExceptionEnd : undefined,
        reason: newExceptionReason || undefined,
      });
    },
    onSuccess: (data) => {
      setExceptions((prev) => [...prev, data]);
      setNewExceptionDate("");
      setNewExceptionReason("");
      toast.success(dict.toasts.exceptionAdded);
    },
    onError: (err: any) => toast.error(err.message || common.errors.validationError),
  });

  const deleteExceptionMutation = useMutation({
    mutationFn: async (id: string) => {
      return onboardingApi.deleteException(token, id);
    },
    onSuccess: (_, id) => {
      setExceptions((prev) => prev.filter((e) => e.id !== id));
      toast.success(dict.toasts.exceptionRemoved);
    },
    onError: (err: any) => toast.error(err.message || common.errors.validationError),
  });

  function handleContinue() {
    // Availability is mostly a live editor, we just push to the next step.
    router.push(`/${lang}/onboarding`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {dict.title}
        </h1>
        <p className="text-muted-foreground">{dict.subtitle}</p>
      </div>

      {/* Settings Section */}
      <section className="space-y-6 rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <Settings2 className="size-5 text-brand" />
          <h2 className="text-xl font-medium">{dict.settingsTitle}</h2>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Input
            label={dict.timezoneLabel}
            showLabel
            value={settings.timezone}
            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
            onBlur={() => updateSettingsMutation.mutate(settings)}
          />
          <Input
            label={dict.minNoticeHoursLabel}
            showLabel
            type="number"
            min="0"
            value={settings.min_notice_hours}
            onChange={(e) => setSettings({ ...settings, min_notice_hours: Number(e.target.value) })}
            onBlur={() => updateSettingsMutation.mutate(settings)}
          />
          <Input
            label={dict.maxAdvanceDaysLabel}
            showLabel
            type="number"
            min="1"
            value={settings.max_advance_days}
            onChange={(e) => setSettings({ ...settings, max_advance_days: Number(e.target.value) })}
            onBlur={() => updateSettingsMutation.mutate(settings)}
          />
          <Input
            label={dict.bufferMinutesLabel}
            showLabel
            type="number"
            min="0"
            value={settings.buffer_minutes}
            onChange={(e) => setSettings({ ...settings, buffer_minutes: Number(e.target.value) })}
            onBlur={() => updateSettingsMutation.mutate(settings)}
          />
        </div>
      </section>

      {/* Weekly Windows Section */}
      <section className="space-y-6 rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <Clock className="size-5 text-brand" />
          <h2 className="text-xl font-medium">{dict.weeklyWindowsTitle}</h2>
        </div>

        <div className="space-y-4">
          {DAYS_OF_WEEK.map((day) => {
            const dayWindows = windows.filter((w) => w.day_of_week === day);
            if (dayWindows.length === 0) return null;
            return (
              <div key={day} className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="w-32 font-medium text-foreground">{dict.days[day]}</div>
                <div className="flex flex-1 flex-wrap gap-2">
                  {dayWindows.map((w) => (
                    <div key={w.id} className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-1.5 text-sm">
                      <span>{w.start_time.slice(0, 5)} - {w.end_time.slice(0, 5)}</span>
                      <button
                        onClick={() => deleteWindowMutation.mutate(w.id)}
                        className="text-icon-muted hover:text-red-500"
                        disabled={deleteWindowMutation.isPending}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-border border-dashed p-4 md:flex-row md:items-end">
          <div className="flex-1">
            <Select
              label="Day"
              options={DAYS_OF_WEEK.map(d => ({ value: d, label: dict.days[d] }))}
              value={newWindowDay}
              onChange={setNewWindowDay}
            />
          </div>
          <div className="flex-1">
            <Input
              label={dict.startTimeLabel}
              showLabel
              type="time"
              value={newWindowStart}
              onChange={(e) => setNewWindowStart(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Input
              label={dict.endTimeLabel}
              showLabel
              type="time"
              value={newWindowEnd}
              onChange={(e) => setNewWindowEnd(e.target.value)}
            />
          </div>
          <Button
            onClick={() => addWindowMutation.mutate()}
            disabled={addWindowMutation.isPending}
            className="w-full md:w-auto"
          >
            <Plus className="mr-2 size-4" />
            {dict.addWindow}
          </Button>
        </div>
      </section>

      {/* Exceptions Section */}
      <section className="space-y-6 rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <CalendarX2 className="size-5 text-brand" />
          <h2 className="text-xl font-medium">{dict.exceptionsTitle}</h2>
        </div>

        <div className="space-y-3">
          {exceptions.map((exc) => (
            <div key={exc.id} className="flex items-center justify-between rounded-lg border border-border bg-muted p-4">
              <div>
                <div className="font-medium">{exc.date}</div>
                <div className="text-sm text-muted-foreground">
                  {exc.exception_type === "CLOSED" ? dict.exceptionTypes.CLOSED : `${dict.exceptionTypes.CUSTOM_HOURS} (${exc.start_time?.slice(0, 5)} - ${exc.end_time?.slice(0, 5)})`}
                  {exc.reason && ` • ${exc.reason}`}
                </div>
              </div>
              <button
                onClick={() => deleteExceptionMutation.mutate(exc.id)}
                className="rounded-md p-2 text-icon-muted hover:bg-border hover:text-red-500"
                disabled={deleteExceptionMutation.isPending}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-4 rounded-xl border border-border border-dashed p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label={dict.dateLabel}
              showLabel
              type="date"
              value={newExceptionDate}
              onChange={(e) => setNewExceptionDate(e.target.value)}
            />
            <Select
              label={dict.exceptionTypeLabel}
              options={[
                { value: "CLOSED", label: dict.exceptionTypes.CLOSED },
                { value: "CUSTOM_HOURS", label: dict.exceptionTypes.CUSTOM_HOURS },
              ]}
              value={newExceptionType}
              onChange={(val) => setNewExceptionType(val as AvailabilityExceptionType)}
            />
          </div>

          {newExceptionType === "CUSTOM_HOURS" && (
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label={dict.startTimeLabel}
                showLabel
                type="time"
                value={newExceptionStart}
                onChange={(e) => setNewExceptionStart(e.target.value)}
              />
              <Input
                label={dict.endTimeLabel}
                showLabel
                type="time"
                value={newExceptionEnd}
                onChange={(e) => setNewExceptionEnd(e.target.value)}
              />
            </div>
          )}

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                label={dict.reasonLabel}
                showLabel
                placeholder="e.g. Holiday"
                value={newExceptionReason}
                onChange={(e) => setNewExceptionReason(e.target.value)}
              />
            </div>
            <Button
              onClick={() => addExceptionMutation.mutate()}
              disabled={addExceptionMutation.isPending || !newExceptionDate}
              variant="outline"
            >
              <Plus className="mr-2 size-4" />
              {dict.addException}
            </Button>
          </div>
        </div>
      </section>

      <div className="flex justify-end pt-4">
        <Button onClick={handleContinue} className="w-full md:w-auto md:px-8">
          {dict.continue}
        </Button>
      </div>
    </div>
  );
}
