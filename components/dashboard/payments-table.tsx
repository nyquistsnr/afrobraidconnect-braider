"use client";

import type { PaymentListResponse, PaymentListItemResponse } from "@/lib/api/types";
import { Locale } from "@/lib/i18n";
import { CheckCircle2, Clock, XCircle, AlertCircle, RefreshCw } from "lucide-react";

interface PaymentsTableProps {
  initialData: PaymentListResponse;
  lang: Locale;
}

const STATUS_ICONS = {
  SUCCEEDED: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  PENDING: <Clock className="h-4 w-4 text-amber-500" />,
  FAILED: <XCircle className="h-4 w-4 text-red-500" />,
  CANCELED: <AlertCircle className="h-4 w-4 text-slate-500" />,
};

const STATUS_COLORS = {
  SUCCEEDED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
  CANCELED: "bg-slate-50 text-slate-700 border-slate-200",
};

export function PaymentsTable({ initialData, lang }: PaymentsTableProps) {
  // Simple table without interactive pagination for now, similar to how it would be structured initially
  const { items } = initialData;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: string, currency: string) => {
    return new Intl.NumberFormat(lang, {
      style: "currency",
      currency: currency,
    }).format(parseFloat(amount));
  };

  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-8 text-center">
        <h3 className="text-lg font-medium">No payments</h3>
        <p className="text-sm text-muted-foreground mt-1">You haven't received any payments yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div className="p-6 pb-4">
        <h3 className="text-lg font-medium">Recent Payments</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-y">
            <tr>
              <th scope="col" className="px-6 py-3 font-medium">Date</th>
              <th scope="col" className="px-6 py-3 font-medium">Booking Ref</th>
              <th scope="col" className="px-6 py-3 font-medium">Purpose</th>
              <th scope="col" className="px-6 py-3 font-medium">Amount</th>
              <th scope="col" className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((payment) => (
              <tr key={payment.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                  {formatDate(payment.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  {payment.booking_reference}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                    {payment.purpose}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">
                      {formatCurrency(payment.amount, payment.currency)}
                    </span>
                    {payment.is_refunded && (
                      <span className="text-xs text-red-500 flex items-center mt-1">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Refunded {formatCurrency(payment.amount_refunded, payment.currency)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${STATUS_COLORS[payment.status] || STATUS_COLORS.PENDING}`}>
                    {STATUS_ICONS[payment.status] || STATUS_ICONS.PENDING}
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination summary */}
      <div className="flex items-center justify-between border-t px-6 py-4 text-sm text-muted-foreground">
        <div>
          Showing <span className="font-medium text-foreground">{(initialData.page - 1) * initialData.page_size + 1}</span> to <span className="font-medium text-foreground">{Math.min(initialData.page * initialData.page_size, initialData.total_items)}</span> of <span className="font-medium text-foreground">{initialData.total_items}</span> results
        </div>
        <div className="flex space-x-2">
          {/* Real pagination controls would go here */}
          <button 
            disabled={!initialData.has_previous}
            className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <button 
            disabled={!initialData.has_next}
            className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
