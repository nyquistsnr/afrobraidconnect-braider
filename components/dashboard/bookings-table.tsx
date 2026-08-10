"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  Clock3,
  CreditCard,
  Inbox,
  MapPin,
  Search,
  User,
  X,
} from "lucide-react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import type {
  BookingDetailResponse,
  BookingListItemResponse,
  BookingListResponse,
  BookingStatus,
} from "@/lib/api/types";
import { bookingsApi } from "@/lib/api/bookings-client";
import { ApiError } from "@/lib/api/auth-client";
import { getAuthErrorMessage } from "@/lib/api/error-messages";
import { formatCurrency, formatDate, formatTime } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Select, type SelectOption } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { DateRangePicker } from "@/components/ui/date-range-picker";

const SEARCH_DEBOUNCE_MS = 350;

const STATUS_TONE: Record<BookingStatus, BadgeTone> = {
  PENDING_PAYMENT: "warning",
  CONFIRMED: "info",
  IN_PROGRESS: "brand",
  COMPLETED: "success",
  NO_SHOW: "danger",
  CANCELLED_BY_CUSTOMER: "neutral",
  CANCELLED_BY_BRAIDER: "neutral",
  CANCELLED_NO_PAYMENT: "neutral",
  EXPIRED: "neutral",
  DISPUTED: "danger",
};

type BookingsDict = Dictionary["dashboard"]["bookings"];

function StatusBadge({
  status,
  dict,
}: {
  status: BookingStatus;
  dict: BookingsDict["status"];
}) {
  return <Badge tone={STATUS_TONE[status]}>{dict[status]}</Badge>;
}

function DateTimeCell({
  startsAt,
  endsAt,
  lang,
}: {
  startsAt: string;
  endsAt: string;
  lang: Locale;
}) {
  return (
    <div>
      <p className="font-medium text-foreground">{formatDate(startsAt, lang)}</p>
      <p className="text-xs text-muted-foreground">
        {formatTime(startsAt, lang)} – {formatTime(endsAt, lang)}
      </p>
    </div>
  );
}

function BookingCard({
  booking,
  lang,
  dict,
  onClick,
}: {
  booking: BookingListItemResponse;
  lang: Locale;
  dict: BookingsDict;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col gap-3 border border-border bg-surface p-4 text-left shadow-sm transition-colors hover:border-brand/50 hover:bg-border/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {booking.style_name}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {booking.reference}
          </p>
        </div>
        <StatusBadge status={booking.status} dict={dict.status} />
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <User className="size-3.5 shrink-0 text-icon-muted" />
        <span className="truncate">{booking.customer_name}</span>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <CalendarDays className="size-3.5 shrink-0 text-icon-muted" />
        <span>
          {formatDate(booking.starts_at, lang)} ·{" "}
          {formatTime(booking.starts_at, lang)}–{formatTime(booking.ends_at, lang)}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs text-muted-foreground">
          {dict.table.totalColumn}
        </span>
        <span className="text-base font-bold text-foreground">
          {formatCurrency(booking.total, booking.currency, lang)}
        </span>
      </div>
    </button>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function BookingDetail({
  booking,
  lang,
  dict,
}: {
  booking: BookingDetailResponse;
  lang: Locale;
  dict: BookingsDict;
}) {
  const d = dict.detail;
  const hasDeposit = booking.payment_schedule === "DEPOSIT_THEN_BALANCE";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">{d.reference}</p>
          <p className="font-mono text-sm font-semibold text-foreground">
            {booking.reference}
          </p>
        </div>
        <StatusBadge status={booking.status} dict={dict.status} />
      </div>

      <section className="border border-border">
        <div className="divide-y divide-border px-4">
          <DetailRow label={d.customer} value={booking.customer_name} />
          <DetailRow label={d.style} value={booking.style_name} />
          <DetailRow
            label={d.duration}
            value={d.durationMinutes.replace(
              "{minutes}",
              String(booking.duration_minutes)
            )}
          />
          <DetailRow
            label={d.location}
            value={
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0 text-icon-muted" />
                {booking.is_mobile
                  ? booking.client_address ?? d.mobileService
                  : d.studioService}
              </span>
            }
          />
          <DetailRow
            label={d.schedule}
            value={
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="size-3.5 shrink-0 text-icon-muted" />
                {formatDate(booking.starts_at, lang)} ·{" "}
                {formatTime(booking.starts_at, lang)}–
                {formatTime(booking.ends_at, lang)}
              </span>
            }
          />
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-foreground">
          {d.itemsTitle}
        </h3>
        <div className="border border-border">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border">
              {booking.items.map((item, index) => (
                <tr key={`${item.item_type}-${index}`}>
                  <td className="px-3 py-2 text-foreground">
                    {item.name ?? d.itemTypes[item.item_type]}
                    {item.quantity > 1 && (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        ×{item.quantity}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-foreground">
                    {formatCurrency(item.line_amount, booking.currency, lang)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="divide-y divide-border border-t border-border bg-border/10 px-3">
            <DetailRow
              label={d.serviceSubtotal}
              value={formatCurrency(
                booking.service_subtotal,
                booking.currency,
                lang
              )}
            />
            {Number(booking.travel_fee) > 0 && (
              <DetailRow
                label={d.travelFee}
                value={formatCurrency(
                  booking.travel_fee,
                  booking.currency,
                  lang
                )}
              />
            )}
            <DetailRow
              label={d.subtotal}
              value={formatCurrency(booking.subtotal, booking.currency, lang)}
            />
            <DetailRow
              label={d.platformFee}
              value={formatCurrency(
                booking.platform_fee,
                booking.currency,
                lang
              )}
            />
            <DetailRow
              label={d.vatTotal}
              value={formatCurrency(booking.vat_total, booking.currency, lang)}
            />
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm font-semibold text-foreground">
                {d.total}
              </span>
              <span className="text-base font-bold text-foreground">
                {formatCurrency(booking.total, booking.currency, lang)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border border-border px-4">
        <div className="divide-y divide-border">
          <DetailRow
            label={d.paymentSchedule}
            value={d.paymentScheduleValues[booking.payment_schedule]}
          />
          {hasDeposit && (
            <>
              <DetailRow
                label={d.depositAmount}
                value={formatCurrency(
                  booking.deposit_amount,
                  booking.currency,
                  lang
                )}
              />
              <DetailRow
                label={d.balanceAmount}
                value={formatCurrency(
                  booking.balance_amount,
                  booking.currency,
                  lang
                )}
              />
            </>
          )}
        </div>
      </section>

      {booking.payments.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-foreground">
            {d.paymentsTitle}
          </h3>
          <ul className="divide-y divide-border border border-border">
            {booking.payments.map((payment, index) => (
              <li
                key={`${payment.purpose}-${index}`}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <span className="inline-flex items-center gap-2 text-foreground">
                  <CreditCard className="size-3.5 shrink-0 text-icon-muted" />
                  {d.paymentPurpose[payment.purpose]}
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-foreground">
                    {formatCurrency(payment.amount, payment.currency, lang)}
                  </span>
                  <Badge
                    tone={
                      payment.status === "SUCCEEDED"
                        ? "success"
                        : payment.status === "FAILED"
                          ? "danger"
                          : payment.status === "CANCELED"
                            ? "neutral"
                            : "warning"
                    }
                  >
                    {d.paymentStatus[payment.status]}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs text-muted-foreground">
        {d.cancellationCutoff}{" "}
        {formatDate(booking.cancellation_cutoff_at, lang)} ·{" "}
        {formatTime(booking.cancellation_cutoff_at, lang)}
      </p>
      <p className="text-xs text-muted-foreground">
        {d.createdAt} {formatDate(booking.created_at, lang)}
      </p>
    </div>
  );
}

export function BookingsTable({
  dict,
  common,
  lang,
  initialData,
}: {
  dict: BookingsDict;
  common: Dictionary["common"];
  lang: Locale;
  initialData: BookingListResponse;
}) {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const modalTitleId = useId();

  const [status, setStatus] = useState<BookingStatus | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  function handleStatusChange(value: BookingStatus) {
    setStatus(value);
    setPage(1);
  }

  function handleDateRangeChange(from: string, to: string) {
    setDateFrom(from);
    setDateTo(to);
    setPage(1);
  }

  const hasFilters = !!(status || dateFrom || dateTo || debouncedSearch);
  const isDefaultQuery = !hasFilters && page === 1;

  const filterParams = useMemo(
    () => ({
      status: status || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      search: debouncedSearch || undefined,
      page,
      page_size: 20,
    }),
    [status, dateFrom, dateTo, debouncedSearch, page]
  );

  const bookingsQuery = useQuery({
    queryKey: ["braider-bookings", filterParams],
    queryFn: () => bookingsApi.list(accessToken!, filterParams),
    enabled: !!accessToken,
    initialData: isDefaultQuery ? initialData : undefined,
    placeholderData: (previous) => previous,
  });

  const bookingDetailQuery = useQuery({
    queryKey: ["braider-booking", selectedBookingId],
    queryFn: () => bookingsApi.getById(accessToken!, selectedBookingId!),
    enabled: !!accessToken && !!selectedBookingId,
  });

  const bookings = bookingsQuery.data?.items ?? [];
  const isLoading = bookingsQuery.isLoading || bookingsQuery.isPlaceholderData;

  const statusOptions: SelectOption<BookingStatus>[] = (
    Object.keys(dict.status) as BookingStatus[]
  ).map((value) => ({ value, label: dict.status[value] }));

  function resetFilters() {
    setStatus("");
    setDateFrom("");
    setDateTo("");
    setSearchInput("");
    setDebouncedSearch("");
    setPage(1);
  }

  const columns: DataTableColumn<BookingListItemResponse>[] = [
    {
      key: "style",
      header: dict.table.styleColumn,
      render: (row) => (
        <div>
          <p className="font-semibold text-foreground">{row.style_name}</p>
          <p className="text-xs text-muted-foreground">{row.reference}</p>
        </div>
      ),
    },
    {
      key: "customer",
      header: dict.table.customerColumn,
      render: (row) => row.customer_name,
    },
    {
      key: "date",
      header: dict.table.dateColumn,
      render: (row) => (
        <DateTimeCell startsAt={row.starts_at} endsAt={row.ends_at} lang={lang} />
      ),
    },
    {
      key: "status",
      header: dict.table.statusColumn,
      render: (row) => <StatusBadge status={row.status} dict={dict.status} />,
    },
    {
      key: "total",
      header: dict.table.totalColumn,
      align: "right",
      render: (row) => (
        <span className="font-bold text-foreground">
          {formatCurrency(row.total, row.currency, lang)}
        </span>
      ),
      cellClassName: "font-bold",
    },
  ];

  const emptyState = (
    <div className="flex flex-col items-center justify-center gap-2 text-center">
      <Inbox className="size-8 text-icon-muted" />
      <p className="text-sm font-semibold text-foreground">
        {hasFilters ? dict.noResults : dict.empty.title}
      </p>
      {!hasFilters && (
        <p className="max-w-xs text-xs text-muted-foreground">
          {dict.empty.description}
        </p>
      )}
    </div>
  );

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-4 border border-border bg-surface p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[2fr_1.5fr_auto_auto] lg:items-end">
        <Input
          label={dict.filters.searchLabel}
          showLabel
          icon={Search}
          placeholder={dict.filters.searchPlaceholder}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        <Select
          label={dict.filters.statusLabel}
          showLabel
          value={status}
          onChange={handleStatusChange}
          placeholder={dict.filters.statusAll}
          options={statusOptions}
        />
        <DateRangePicker
          label={dict.filters.dateRangeLabel}
          placeholder={dict.filters.dateRangePlaceholder}
          presetsLabel={dict.filters.dateRangePresets}
          todayLabel={dict.filters.dateRangeToday}
          last7DaysLabel={dict.filters.dateRangeLast7Days}
          thisMonthLabel={dict.filters.dateRangeThisMonth}
          lastMonthLabel={dict.filters.dateRangeLastMonth}
          clearLabel={dict.filters.dateRangeClear}
          applyLabel={dict.filters.dateRangeApply}
          previousMonthLabel={dict.filters.dateRangePreviousMonth}
          nextMonthLabel={dict.filters.dateRangeNextMonth}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onChange={handleDateRangeChange}
          lang={lang}
        />
        <Button
          type="button"
          variant="outline"
          className="w-full lg:w-auto"
          onClick={resetFilters}
          disabled={!hasFilters}
        >
          <X className="size-4" />
          {dict.filters.reset}
        </Button>
      </div>

      <div className="mt-4 border border-border bg-surface shadow-sm">
        {bookingsQuery.isError ? (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            {dict.loadError}
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={bookings}
              getRowKey={(row) => row.id}
              onRowClick={(row) => setSelectedBookingId(row.id)}
              renderMobileCard={(row) => (
                <BookingCard
                  booking={row}
                  lang={lang}
                  dict={dict}
                  onClick={() => setSelectedBookingId(row.id)}
                />
              )}
              isLoading={isLoading}
              emptyState={emptyState}
            />

            {bookingsQuery.data && (
              <Pagination
                page={bookingsQuery.data.page}
                totalPages={bookingsQuery.data.total_pages}
                hasNext={bookingsQuery.data.has_next}
                hasPrevious={bookingsQuery.data.has_previous}
                onPageChange={setPage}
                disabled={isLoading}
                summary={dict.pagination.summary
                  .replace("{page}", String(bookingsQuery.data.page))
                  .replace("{totalPages}", String(bookingsQuery.data.total_pages))
                  .replace("{totalItems}", String(bookingsQuery.data.total_items))}
                previousLabel={dict.pagination.previous}
                nextLabel={dict.pagination.next}
              />
            )}
          </>
        )}
      </div>

      <Modal
        open={!!selectedBookingId}
        onClose={() => setSelectedBookingId(null)}
        labelledBy={modalTitleId}
        size="lg"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id={modalTitleId} className="text-lg font-bold text-foreground">
            {dict.detail.title}
          </h2>
          <button
            type="button"
            onClick={() => setSelectedBookingId(null)}
            aria-label={dict.detail.close}
            className="text-icon-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {bookingDetailQuery.isLoading && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            {common.loading}
          </div>
        )}

        {bookingDetailQuery.isError && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            {getAuthErrorMessage(
              bookingDetailQuery.error instanceof ApiError
                ? bookingDetailQuery.error.code
                : undefined,
              common.errors
            )}
          </div>
        )}

        {bookingDetailQuery.data && (
          <BookingDetail
            booking={bookingDetailQuery.data}
            lang={lang}
            dict={dict}
          />
        )}
      </Modal>
    </div>
  );
}
