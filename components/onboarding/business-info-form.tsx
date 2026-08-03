"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Building2, Upload } from "lucide-react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import type {
  BusinessInfoResponse,
  Gender,
  LogoContentType,
} from "@/lib/api/types";
import { onboardingApi } from "@/lib/api/onboarding-client";
import { ApiError } from "@/lib/api/auth-client";
import { getAuthErrorMessage } from "@/lib/api/error-messages";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const ALLOWED_LOGO_TYPES: LogoContentType[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export function BusinessInfoForm({
  dict,
  common,
  lang,
  initialData,
}: {
  dict: Dictionary["onboarding"]["businessInfo"];
  common: Dictionary["common"];
  lang: Locale;
  initialData: BusinessInfoResponse;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [info, setInfo] = useState(initialData);
  const [businessName, setBusinessName] = useState(
    initialData.business_name ?? ""
  );
  const [gender, setGender] = useState<Gender | "">(initialData.gender ?? "");
  const [bio, setBio] = useState(initialData[`bio_${lang}`] ?? "");

  // Bio saves land on the other two locales async server-side — if either
  // is still mid-translation, do one best-effort re-check a few seconds
  // later rather than making the user manually refresh to see it flip.
  useEffect(() => {
    if (!session) return;
    const stillPending = (["en", "fr", "de"] as Locale[])
      .filter((locale) => locale !== lang)
      .some((locale) => info[`bio_${locale}_source`] === "PENDING");
    if (!stillPending) return;

    const timer = setTimeout(async () => {
      try {
        setInfo(await onboardingApi.getBusinessInfo(session.accessToken));
      } catch {
        // Best-effort only — the badge just stays stale until next load.
      }
    }, 4000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info.bio_en_source, info.bio_de_source, info.bio_fr_source]);

  const saveMutation = useMutation({
    mutationFn: () =>
      onboardingApi.updateBusinessInfo(
        session!.accessToken,
        {
          business_name: businessName.trim() || undefined,
          gender: gender || undefined,
          bio: bio.trim() || undefined,
        },
        lang
      ),
    onSuccess: (data) => {
      setInfo(data);
      toast.success(dict.toasts.saved);
      router.push(`/${lang}/onboarding`);
    },
    onError: (error) => {
      const code = error instanceof ApiError ? error.code : undefined;
      toast.error(getAuthErrorMessage(code, common.errors));
    },
  });

  const logoMutation = useMutation({
    mutationFn: async (file: File) => {
      const accessToken = session!.accessToken;
      const { upload_url, object_key } = await onboardingApi.getLogoUploadUrl(
        accessToken,
        { content_type: file.type as LogoContentType }
      );
      await onboardingApi.uploadLogoFile(upload_url, file);
      return onboardingApi.confirmLogo(accessToken, { object_key });
    },
    onSuccess: (data) => {
      setInfo(data);
      toast.success(dict.toasts.logoUploaded);
    },
    onError: (error) => {
      const code = error instanceof ApiError ? error.code : undefined;
      toast.error(getAuthErrorMessage(code, common.errors));
    },
  });

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ALLOWED_LOGO_TYPES.includes(file.type as LogoContentType)) {
      toast.error(getAuthErrorMessage("INVALID_LOGO_UPLOAD", common.errors));
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast.error(getAuthErrorMessage("INVALID_LOGO_UPLOAD", common.errors));
      return;
    }

    logoMutation.mutate(file);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    saveMutation.mutate();
  }

  const bioTranslating = (["en", "fr", "de"] as Locale[])
    .filter((locale) => locale !== lang)
    .some((locale) => info[`bio_${locale}_source`] === "PENDING");

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-foreground">{dict.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{dict.subtitle}</p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <div className="flex items-center gap-4">
          {info.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={info.logo_url}
              alt=""
              className="size-16 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-input text-icon-muted">
              <Building2 className="size-6" />
            </div>
          )}

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_LOGO_TYPES.join(",")}
              className="hidden"
              onChange={handleLogoChange}
            />
            <Button
              type="button"
              variant="outline"
              className="w-auto px-4 py-2"
              disabled={logoMutation.isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-4" />
              {logoMutation.isPending
                ? common.loading
                : info.logo_url
                  ? dict.logoChange
                  : dict.logoUpload}
            </Button>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {dict.logoHelp}
            </p>
          </div>
        </div>

        <Input
          label={dict.businessNameLabel}
          showLabel
          name="businessName"
          icon={Building2}
          placeholder={dict.businessNamePlaceholder}
          value={businessName}
          onChange={(event) => setBusinessName(event.target.value)}
          required
        />

        <div>
          <label
            htmlFor="gender"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            {dict.genderLabel}
          </label>
          <select
            id="gender"
            value={gender}
            onChange={(event) => setGender(event.target.value as Gender)}
            className="w-full border border-border bg-input px-4 py-3 text-sm text-foreground outline-none focus:border-brand"
            required
          >
            <option value="" disabled>
              {dict.genderLabel}
            </option>
            <option value="FEMALE">{dict.genderOptions.female}</option>
            <option value="MALE">{dict.genderOptions.male}</option>
            <option value="OTHER">{dict.genderOptions.other}</option>
            <option value="PREFER_NOT_TO_SAY">
              {dict.genderOptions.preferNotToSay}
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="bio"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            {dict.bioLabel}
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder={dict.bioPlaceholder}
            maxLength={1000}
            rows={4}
            className="w-full border border-border bg-input px-4 py-3 text-sm text-foreground outline-none placeholder:text-placeholder focus:border-brand"
            required
          />
          {bioTranslating && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              {dict.bioTranslatingNote}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={saveMutation.isPending || !businessName || !gender || !bio}
        >
          {saveMutation.isPending ? common.loading : dict.continue}
        </Button>
      </form>
    </div>
  );
}
