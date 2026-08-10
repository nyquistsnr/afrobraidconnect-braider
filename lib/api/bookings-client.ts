// Braider Bookings endpoints — GET /braiders/me/bookings (list) and
// GET /braiders/me/bookings/{id} (detail). Requires a BRAIDER-role Bearer token.
import type {
  ApiEnvelope,
  BookingDetailResponse,
  BookingListParams,
  BookingListResponse,
} from "@/lib/api/types";
import { ApiError } from "@/lib/api/auth-client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const BOOKINGS_PATH = "/braiders/me/bookings";

async function authedGet<T>(path: string, accessToken: string): Promise<T> {
  if (!API_BASE) {
    throw new ApiError(
      "API_BASE_NOT_CONFIGURED",
      "NEXT_PUBLIC_API_BASE_URL is not set.",
      500
    );
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    throw new ApiError("NETWORK_ERROR", "Could not reach the server.", 0);
  }

  const json: ApiEnvelope<T> = await res.json();

  if (json.status === "error" || !json.data) {
    const error = json.error ?? {
      code: "UNKNOWN_ERROR",
      message: "Something went wrong.",
    };
    throw new ApiError(error.code, error.message, res.status, error.details);
  }

  return json.data;
}

export const bookingsApi = {
  list: (accessToken: string, params: BookingListParams = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.date_from) query.set("date_from", params.date_from);
    if (params.date_to) query.set("date_to", params.date_to);
    if (params.search) query.set("search", params.search);
    query.set("page", String(params.page ?? 1));
    query.set("page_size", String(params.page_size ?? 20));
    return authedGet<BookingListResponse>(
      `${BOOKINGS_PATH}?${query.toString()}`,
      accessToken
    );
  },

  getById: (accessToken: string, bookingId: string) =>
    authedGet<BookingDetailResponse>(
      `${BOOKINGS_PATH}/${bookingId}`,
      accessToken
    ),
};
