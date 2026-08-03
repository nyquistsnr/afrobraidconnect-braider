import type { Dictionary } from "@/app/[lang]/dictionaries";

type ErrorsDict = Dictionary["common"]["errors"];

const CODE_TO_KEY: Record<string, keyof ErrorsDict> = {
  VALIDATION_ERROR: "validationError",
  EMAIL_ALREADY_EXISTS: "emailAlreadyExists",
  PHONE_ALREADY_EXISTS: "phoneAlreadyExists",
  INVALID_CREDENTIALS: "invalidCredentials",
  EMAIL_NOT_VERIFIED: "emailNotVerified",
  USER_NOT_ACTIVE: "userNotActive",
  INVALID_OTP: "invalidOtp",
  OTP_EXPIRED: "otpExpired",
  TOO_MANY_OTP_ATTEMPTS: "tooManyOtpAttempts",
  SOCIAL_AUTH_FAILED: "socialAuthFailed",
  UNSUPPORTED_PROVIDER: "unsupportedProvider",
  USER_TYPE_REQUIRED: "userTypeRequired",
  RATE_LIMITED: "rateLimited",
  NETWORK_ERROR: "networkError",
};

// `code` here is whatever error.code the backend returned (see ApiError),
// or a NextAuth SignInResponse.code for the login path — both share the
// same vocabulary since the credentials provider forwards our ApiError.code.
export function getAuthErrorMessage(
  code: string | undefined | null,
  dict: ErrorsDict
): string {
  if (!code) return dict.generic;
  return CODE_TO_KEY[code] ? dict[CODE_TO_KEY[code]] : dict.generic;
}
