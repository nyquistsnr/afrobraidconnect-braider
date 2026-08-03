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

// ---------------------------------------------------------------------------
// Braider onboarding
// ---------------------------------------------------------------------------

export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";

export type BioSource = "HUMAN" | "MACHINE" | "PENDING" | "FAILED";

export interface BusinessInfoResponse {
  business_name: string | null;
  logo_url: string | null;
  bio_en: string | null;
  bio_de: string | null;
  bio_fr: string | null;
  bio_en_source: BioSource | null;
  bio_de_source: BioSource | null;
  bio_fr_source: BioSource | null;
  gender: Gender | null;
  is_complete: boolean;
}

export interface BusinessInfoUpdateRequest {
  business_name?: string;
  bio?: string;
  gender?: Gender;
}

export type LogoContentType = "image/jpeg" | "image/png" | "image/webp";

export interface LogoUploadUrlRequest {
  content_type: LogoContentType;
}

export interface LogoUploadUrlResponse {
  upload_url: string;
  object_key: string;
  expires_in: number;
}

export interface LogoConfirmRequest {
  object_key: string;
}

export interface SendCodeRequest {
  phone_number: string;
}

export interface SendCodeResponse {
  status: string;
  phone_number: string;
}

export interface VerifyCodeRequest {
  phone_number: string;
  code: string;
}

export interface VerifyCodeResponse {
  status: string;
  is_complete: boolean;
}

export interface PhoneVerificationStatusResponse {
  phone_number: string | null;
  is_verified: boolean;
}

export interface OnboardingStatusResponse {
  current_step: OnboardingStep;
  business_info_completed_at: string | null;
  phone_verification_completed_at: string | null;
  veriff_completed_at: string | null;
  service_type_completed_at: string | null;
  portfolio_completed_at: string | null;
  service_location_completed_at: string | null;
  availability_completed_at: string | null;
  payment_setup_completed_at: string | null;
  completed_at: string | null;
}

export type VeriffSessionStatus =
  | "CREATED"
  | "SUBMITTED"
  | "APPROVED"
  | "DECLINED"
  | "RESUBMISSION_REQUESTED"
  | "REVIEW"
  | "EXPIRED"
  | "ABANDONED";

export interface StartVerificationResponse {
  session_id: string;
  verification_url: string;
  status: VeriffSessionStatus;
  status_label: string;
}

export interface VeriffStatusResponse {
  has_session: boolean;
  session_id: string | null;
  verification_url: string | null;
  status: VeriffSessionStatus | null;
  status_label: string;
  reason: string | null;
  reason_code: number | null;
  acceptance_time: string | null;
  submission_time: string | null;
  decision_time: string | null;
  is_complete: boolean;
}

// ---------------------------------------------------------------------------
// Style catalog (public, locale-resolved via Accept-Language) + braider menu
// ---------------------------------------------------------------------------

export interface StyleCategoryPublicResponse {
  id: string;
  slug: string;
  name: string;
  display_order: number;
}

export interface StyleImageResponse {
  id: string;
  url: string;
  position: number;
}

export interface StyleVariationPublicResponse {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
}

export interface StylePublicResponse {
  id: string;
  slug: string;
  category_id: string | null;
  name: string;
  description: string | null;
  is_active: boolean;
  images: StyleImageResponse[];
  variations: StyleVariationPublicResponse[];
}

export interface AddOnPublicResponse {
  id: string;
  slug: string;
  name: string;
  suggested_price: number | null;
  is_active: boolean;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface BraiderStyleVariationInput {
  style_variation_id: string;
  price: number;
}

export interface BraiderStyleAddonInput {
  addon_id: string;
  price: number;
  is_required?: boolean;
}

export interface BraiderStyleCreateRequest {
  style_id: string;
  base_price: number;
  duration_minutes?: number;
  variations?: BraiderStyleVariationInput[];
  addons?: BraiderStyleAddonInput[];
}

export interface BraiderStyleUpdateRequest {
  base_price?: number;
  duration_minutes?: number;
  is_active?: boolean;
  variations?: BraiderStyleVariationInput[];
  addons?: BraiderStyleAddonInput[];
}

export interface BraiderStyleVariationResponse {
  id: string;
  style_variation_id: string;
  price: number;
}

export interface BraiderStyleAddonResponse {
  id: string;
  addon_id: string;
  price: number;
  is_required: boolean;
}

export interface BraiderStyleResponse {
  id: string;
  style_id: string;
  style_slug: string;
  style_name_en: string;
  style_name_de: string | null;
  style_name_fr: string | null;
  primary_image_url: string | null;
  base_price: number;
  duration_minutes: number | null;
  is_active: boolean;
  variations: BraiderStyleVariationResponse[];
  addons: BraiderStyleAddonResponse[];
}
