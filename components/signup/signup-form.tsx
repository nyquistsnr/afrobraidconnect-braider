"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, User } from "lucide-react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";

export function SignupForm({
  dict,
  common,
  lang,
}: {
  dict: Dictionary["signup"];
  common: Dictionary["common"];
  lang: Locale;
}) {
  const [phone, setPhone] = useState<string | undefined>();

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-foreground">{dict.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{dict.subtitle}</p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={dict.firstNameLabel}
            name="firstName"
            icon={User}
            autoComplete="given-name"
            placeholder={dict.firstNamePlaceholder}
            defaultValue="Amara"
          />
          <Input
            label={dict.lastNameLabel}
            name="lastName"
            icon={User}
            autoComplete="family-name"
            placeholder={dict.lastNamePlaceholder}
            defaultValue="Nwosu"
          />
        </div>

        <Input
          label={dict.emailLabel}
          type="email"
          name="email"
          icon={Mail}
          autoComplete="email"
          placeholder={dict.emailPlaceholder}
          defaultValue="hello@example.com"
        />

        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-sm font-medium text-foreground">
              {dict.phoneLabel}
            </span>
            <span className="text-xs text-muted-foreground">
              {dict.phoneOptional}
            </span>
          </div>
          <PhoneInput
            label={dict.phoneLabel}
            lang={lang}
            value={phone}
            onChange={setPhone}
            searchPlaceholder={common.countrySearchPlaceholder}
            noResultsLabel={common.noCountriesFound}
          />
        </div>

        <PasswordInput
          label={dict.passwordLabel}
          name="password"
          autoComplete="new-password"
          placeholder={dict.passwordPlaceholder}
          defaultValue="password123"
        />

        <Button type="submit">{dict.submit}</Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        {dict.alreadyHaveAccount}{" "}
        <Link
          href={`/${lang}/login`}
          className="font-medium text-brand hover:text-brand-hover"
        >
          {dict.signIn}
        </Link>
      </p>
    </div>
  );
}
