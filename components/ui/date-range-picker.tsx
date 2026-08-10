"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export interface DateRangePickerProps {
  dateFrom: string;
  dateTo: string;
  onChange: (dateFrom: string, dateTo: string) => void;
  placeholder?: string;
  label?: string;
  presetsLabel: string;
  todayLabel: string;
  last7DaysLabel: string;
  thisMonthLabel: string;
  lastMonthLabel: string;
  clearLabel: string;
  applyLabel: string;
  previousMonthLabel: string;
  nextMonthLabel: string;
  className?: string;
  lang?: Locale;
}

// Sunday-first locales get weekStart 0, everyone else (fr/de) starts on Monday.
const WEEK_START: Record<Locale, number> = { en: 0, fr: 1, de: 1 };

function toDateString(year: number, month: number, day: number) {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

// Offset (0-6) of the 1st of the month from the given week-start day.
function getLeadingOffset(year: number, month: number, weekStart: number) {
  const jsDay = new Date(year, month, 1).getDay();
  return (jsDay - weekStart + 7) % 7;
}

function CalendarPopover({
  dateFrom,
  dateTo,
  lang,
  presetsLabel,
  todayLabel,
  last7DaysLabel,
  thisMonthLabel,
  lastMonthLabel,
  clearLabel,
  applyLabel,
  previousMonthLabel,
  nextMonthLabel,
  onApply,
  onClear,
  onPreset,
}: {
  dateFrom: string;
  dateTo: string;
  lang: Locale;
  presetsLabel: string;
  todayLabel: string;
  last7DaysLabel: string;
  thisMonthLabel: string;
  lastMonthLabel: string;
  clearLabel: string;
  applyLabel: string;
  previousMonthLabel: string;
  nextMonthLabel: string;
  onApply: (dateFrom: string, dateTo: string) => void;
  onClear: () => void;
  onPreset: (dateFrom: string, dateTo: string) => void;
}) {
  const weekStart = WEEK_START[lang] ?? 0;
  // Mounted fresh each time the popover opens, so these lazy initializers
  // already pick up the latest props — no sync-on-open effect needed.
  const initialDate = dateFrom ? new Date(`${dateFrom}T00:00:00Z`) : new Date();
  const [currentMonth, setCurrentMonth] = useState(initialDate.getUTCMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getUTCFullYear());
  const [start, setStart] = useState(dateFrom);
  const [end, setEnd] = useState(dateTo);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  function handlePrevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((year) => year - 1);
    } else {
      setCurrentMonth((month) => month - 1);
    }
  }

  function handleNextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((year) => year + 1);
    } else {
      setCurrentMonth((month) => month + 1);
    }
  }

  function handleDayClick(dayStr: string) {
    if (!start || (start && end)) {
      setStart(dayStr);
      setEnd("");
    } else if (dayStr < start) {
      setEnd(start);
      setStart(dayStr);
    } else {
      setEnd(dayStr);
    }
  }

  function selectPreset(preset: "today" | "last7" | "thisMonth" | "lastMonth") {
    const today = new Date();
    let startStr: string;
    let endStr = toDateString(today.getFullYear(), today.getMonth(), today.getDate());

    if (preset === "last7") {
      const last7 = new Date();
      last7.setDate(today.getDate() - 6);
      startStr = toDateString(last7.getFullYear(), last7.getMonth(), last7.getDate());
    } else if (preset === "thisMonth") {
      startStr = toDateString(today.getFullYear(), today.getMonth(), 1);
    } else if (preset === "lastMonth") {
      const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      startStr = toDateString(lastMonthDate.getFullYear(), lastMonthDate.getMonth(), 1);
      const lastDay = getDaysInMonth(lastMonthDate.getFullYear(), lastMonthDate.getMonth());
      endStr = toDateString(lastMonthDate.getFullYear(), lastMonthDate.getMonth(), lastDay);
    } else {
      startStr = endStr;
    }

    onPreset(startStr, endStr);
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const leadingOffset = getLeadingOffset(currentYear, currentMonth, weekStart);

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(lang, { month: "long" }).format(
        new Date(currentYear, currentMonth, 1)
      ),
    [lang, currentYear, currentMonth]
  );

  const dayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(lang, { weekday: "short" });
    // 2023-01-01 is a Sunday (getDay() === 0); walk 7 days from weekStart.
    return Array.from({ length: 7 }, (_, i) =>
      formatter.format(new Date(2023, 0, 1 + ((weekStart + i) % 7)))
    );
  }, [lang, weekStart]);

  return (
    <div className="absolute left-0 top-[calc(100%+0.5rem)] z-50 flex w-[320px] flex-col overflow-hidden border border-border bg-surface shadow-lg sm:w-[480px] sm:flex-row">
      <div className="flex flex-col gap-1 border-b border-border bg-border/20 p-3 sm:w-[140px] sm:border-b-0 sm:border-r">
        <span className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {presetsLabel}
        </span>
        <button
          type="button"
          onClick={() => selectPreset("today")}
          className="px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-border/40 hover:text-brand"
        >
          {todayLabel}
        </button>
        <button
          type="button"
          onClick={() => selectPreset("last7")}
          className="px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-border/40 hover:text-brand"
        >
          {last7DaysLabel}
        </button>
        <button
          type="button"
          onClick={() => selectPreset("thisMonth")}
          className="px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-border/40 hover:text-brand"
        >
          {thisMonthLabel}
        </button>
        <button
          type="button"
          onClick={() => selectPreset("lastMonth")}
          className="px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-border/40 hover:text-brand"
        >
          {lastMonthLabel}
        </button>
      </div>

      <div className="flex-1 p-4">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label={previousMonthLabel}
            className="p-1.5 text-icon-muted transition-colors hover:bg-border/40 hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="text-sm font-bold capitalize text-foreground">
            {monthLabel} {currentYear}
          </div>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label={nextMonthLabel}
            className="p-1.5 text-icon-muted transition-colors hover:bg-border/40 hover:text-foreground"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1">
          {dayLabels.map((dayLabel, index) => (
            <div
              key={`${dayLabel}-${index}`}
              className="text-center text-xs font-medium text-muted-foreground"
            >
              {dayLabel}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {Array.from({ length: leadingOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="h-8" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayStr = toDateString(currentYear, currentMonth, day);

            const isStart = start === dayStr;
            const isEnd = end === dayStr;
            const isSelected = isStart || isEnd;

            const isHovering =
              !!start &&
              !end &&
              !!hoverDate &&
              hoverDate >= start &&
              dayStr > start &&
              dayStr <= hoverDate;
            const isBetween = !!start && !!end && dayStr > start && dayStr < end;
            const isInRange = isBetween || isHovering;

            return (
              <div
                key={dayStr}
                className={`relative flex h-8 items-center justify-center ${
                  isInRange || (isStart && (end || hoverDate)) || isEnd
                    ? "bg-brand/10"
                    : ""
                }`}
                onMouseEnter={() => setHoverDate(dayStr)}
                onMouseLeave={() => setHoverDate(null)}
              >
                <button
                  type="button"
                  onClick={() => handleDayClick(dayStr)}
                  className={`flex size-full items-center justify-center text-sm transition-colors ${
                    isSelected
                      ? "bg-brand font-bold text-brand-foreground"
                      : "text-foreground hover:bg-border/40"
                  } ${!isSelected && isInRange ? "font-medium text-brand" : ""}`}
                >
                  {day}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            {clearLabel}
          </button>
          <Button
            type="button"
            onClick={() => onApply(start, end)}
            className="!w-auto h-8 px-4 text-xs"
          >
            {applyLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function DateRangePicker({
  dateFrom,
  dateTo,
  onChange,
  placeholder,
  label,
  presetsLabel,
  todayLabel,
  last7DaysLabel,
  thisMonthLabel,
  lastMonthLabel,
  clearLabel,
  applyLabel,
  previousMonthLabel,
  nextMonthLabel,
  className = "",
  lang = "en",
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const displayValue = useMemo(() => {
    if (!dateFrom && !dateTo) return "";

    const fmt = new Intl.DateTimeFormat(lang, {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
    const fromStr = dateFrom ? fmt.format(new Date(`${dateFrom}T00:00:00Z`)) : "";
    const toStr = dateTo ? fmt.format(new Date(`${dateTo}T00:00:00Z`)) : "";

    if (fromStr && toStr) {
      return fromStr === toStr ? fromStr : `${fromStr} – ${toStr}`;
    }
    return fromStr || toStr;
  }, [dateFrom, dateTo, lang]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="flex h-[46px] w-full items-center justify-between gap-2 border border-border bg-input px-4 text-sm outline-none focus:border-brand"
      >
        <span
          className={`truncate ${!displayValue ? "text-placeholder" : "font-medium text-foreground"}`}
        >
          {displayValue || placeholder}
        </span>
        <CalendarIcon className="size-4 shrink-0 text-icon-muted" />
      </button>

      {isOpen && (
        <CalendarPopover
          dateFrom={dateFrom}
          dateTo={dateTo}
          lang={lang}
          presetsLabel={presetsLabel}
          todayLabel={todayLabel}
          last7DaysLabel={last7DaysLabel}
          thisMonthLabel={thisMonthLabel}
          lastMonthLabel={lastMonthLabel}
          clearLabel={clearLabel}
          applyLabel={applyLabel}
          previousMonthLabel={previousMonthLabel}
          nextMonthLabel={nextMonthLabel}
          onApply={(from, to) => {
            onChange(from, to);
            setIsOpen(false);
          }}
          onClear={() => {
            onChange("", "");
            setIsOpen(false);
          }}
          onPreset={(from, to) => {
            onChange(from, to);
            setIsOpen(false);
          }}
        />
      )}
    </div>
  );
}
