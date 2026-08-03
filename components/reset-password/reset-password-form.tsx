"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { OtpInput } from "@/components/ui/otp-input";
import { Button } from "@/components/ui/button";

export function ResetPasswordForm({
  dict,
  common,
  lang,
  defaultEmail,
}: {
  dict: Dictionary["resetPassword"];
  common: Dictionary["common"];
  lang: Locale;
  defaultEmail: string;
}) {
  const [email, setEmail] = useState(defaultEmail);
  const [code, setCode] = useState("");

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-foreground">{dict.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{dict.subtitle}</p>

      <form
        className="mt-8 space-y-5"
        onSubmit={(event) => event.preventDefault()}
      >
        <Input
          label={dict.emailLabel}
          type="email"
          name="email"
          icon={Mail}
          autoComplete="email"
          placeholder={dict.emailPlaceholder}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <div>
          <OtpInput label={dict.codeLabel} value={code} onChange={setCode} />
          <p className="mt-2 text-xs text-muted-foreground">
            {dict.codeHelp}{" "}
            <button
              type="button"
              className="font-medium text-brand hover:text-brand-hover"
            >
              {dict.resendCode}
            </button>
          </p>
        </div>

        <PasswordInput
          label={dict.newPasswordLabel}
          name="new-password"
          autoComplete="new-password"
          placeholder={dict.newPasswordPlaceholder}
        />

        <Button type="submit">{dict.submit}</Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link
          href={`/${lang}/login`}
          className="font-medium text-brand hover:text-brand-hover"
        >
          {common.backToLogin}
        </Link>
      </p>
    </div>
  );
}
