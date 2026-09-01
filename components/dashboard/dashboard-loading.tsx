"use client";

export function DashboardLoading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-[240px] items-center justify-center border border-border bg-surface px-4 py-12 text-sm text-muted-foreground shadow-sm">
      {label}
    </div>
  );
}
