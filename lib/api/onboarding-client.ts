// Authenticated braider-onboarding endpoints — unlike auth-client.ts these
// all require the session's accessToken, passed in explicitly by the caller
// (this module has no access to next-auth's session on its own).
import type {
  ApiEnvelope,
  BusinessInfoResponse,
  BusinessInfoUpdateRequest,
  LogoConfirmRequest,
  LogoUploadUrlRequest,
  LogoUploadUrlResponse,
  OnboardingStatusResponse,
  PhoneVerificationStatusResponse,
  SendCodeRequest,
  SendCodeResponse,
  VerifyCodeRequest,
  VerifyCodeResponse,
} from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";
import { ApiError } from "@/lib/api/auth-client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const ONBOARDING_PATH = "/braiders/onboarding";

interface RequestOptions {
  method?: "GET" | "PUT" | "POST";
  body?: unknown;
  accessToken: string;
  // Only relevant for the business-info PUT — bio is saved to the caller's
  // locale server-side, defaulting to "en" if omitted.
  lang?: Locale;
}

async function request<TRes>(
  path: string,
  { method = "GET", body, accessToken, lang }: RequestOptions
): Promise<TRes> {
  if (!API_BASE) {
    throw new ApiError(
      "API_BASE_NOT_CONFIGURED",
      "NEXT_PUBLIC_API_BASE_URL is not set.",
      500
    );
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (lang) headers["Accept-Language"] = lang;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${ONBOARDING_PATH}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("NETWORK_ERROR", "Could not reach the server.", 0);
  }

  const json: ApiEnvelope<TRes> = await res.json();

  if (json.status === "error" || !json.data) {
    const error = json.error ?? {
      code: "UNKNOWN_ERROR",
      message: "Something went wrong.",
    };
    throw new ApiError(error.code, error.message, res.status, error.details);
  }

  return json.data;
}

export const onboardingApi = {
  getBusinessInfo: (accessToken: string) =>
    request<BusinessInfoResponse>("/business-info", { accessToken }),

  updateBusinessInfo: (
    accessToken: string,
    body: BusinessInfoUpdateRequest,
    lang: Locale
  ) =>
    request<BusinessInfoResponse>("/business-info", {
      method: "PUT",
      body,
      accessToken,
      lang,
    }),

  getLogoUploadUrl: (accessToken: string, body: LogoUploadUrlRequest) =>
    request<LogoUploadUrlResponse>("/business-info/logo/upload-url", {
      method: "POST",
      body,
      accessToken,
    }),

  confirmLogo: (accessToken: string, body: LogoConfirmRequest) =>
    request<BusinessInfoResponse>("/business-info/logo/confirm", {
      method: "POST",
      body,
      accessToken,
    }),

  // Raw presigned-URL PUT — S3, not our API, so no envelope and no auth header.
  uploadLogoFile: async (uploadUrl: string, file: File) => {
    let res: Response;
    try {
      res = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
    } catch {
      throw new ApiError("NETWORK_ERROR", "Could not reach the server.", 0);
    }

    if (!res.ok) {
      throw new ApiError(
        "LOGO_UPLOAD_FAILED",
        "Could not upload the image.",
        res.status
      );
    }
  },

  sendPhoneCode: (accessToken: string, body: SendCodeRequest) =>
    request<SendCodeResponse>("/phone-verification/send-code", {
      method: "POST",
      body,
      accessToken,
    }),

  verifyPhoneCode: (accessToken: string, body: VerifyCodeRequest) =>
    request<VerifyCodeResponse>("/phone-verification/verify-code", {
      method: "POST",
      body,
      accessToken,
    }),

  getPhoneVerificationStatus: (accessToken: string) =>
    request<PhoneVerificationStatusResponse>("/phone-verification/status", {
      accessToken,
    }),

  getStatus: (accessToken: string) =>
    request<OnboardingStatusResponse>("/status", { accessToken }),
};
