export type UserType = "CUSTOMER" | "BRAIDER" | "ADMIN";

export type OnboardingStep =
  | "BUSINESS_INFO"
  | "PHONE_VERIFICATION"
  | "VERIFF"
  | "SERVICE_TYPE"
  | "PORTFOLIO"
  | "SERVICE_LOCATION"
  | "AVAILABILITY"
  | "PAYMENT_SETUP"
  | "COMPLETED";

export interface BraiderOnboardingSummary {
  current_step: OnboardingStep;
  completed_at: string | null;
}

export interface BraiderAuthProfile {
  business_name: string | null;
  logo_url: string | null;
  onboarding: BraiderOnboardingSummary;
}

export interface UserPublic {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone_number: string | null;
  user_type: UserType;
}

// Returned by verify-email, login, social/{provider}, refresh.
export interface AuthTokenResponse extends UserPublic {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
  // Only populated by /login and /social/{provider}; null on /verify-email and /refresh.
  braider: BraiderAuthProfile | null;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown[];
}

export interface ApiEnvelope<T> {
  status: "success" | "error";
  status_label: string;
  data: T | null;
  error: ApiErrorBody | null;
}

export interface SignupEmailRequest {
  first_name: string;
  last_name?: string;
  email: string;
  phone_number?: string;
  password: string;
  user_type: "CUSTOMER" | "BRAIDER";
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export type SocialProvider = "google" | "facebook" | "tiktok";

export interface SocialLoginRequest {
  provider_token: string;
  user_type?: "CUSTOMER" | "BRAIDER";
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface LogoutRequest {
  refresh_token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  new_password: string;
}
