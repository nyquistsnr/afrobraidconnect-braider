"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";

export function LoginForm({
  dict,
  lang,
}: {
  dict: Dictionary["login"];
  lang: Locale;
}) {
  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-foreground">{dict.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{dict.subtitle}</p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(event) => event.preventDefault()}
      >
        <Input
          label={dict.emailLabel}
          type="email"
          name="email"
          icon={Mail}
          autoComplete="email"
          placeholder={dict.emailPlaceholder}
          defaultValue="hello@example.com"
        />

        <PasswordInput
          label={dict.passwordLabel}
          name="password"
          autoComplete="current-password"
          placeholder={dict.passwordPlaceholder}
          defaultValue="password123"
        />

        <div className="flex justify-end">
          <Link
            href={`/${lang}/forgot-password`}
            className="text-sm font-medium text-brand hover:text-brand-hover"
          >
            {dict.forgotPassword}
          </Link>
        </div>

        <Button type="submit">{dict.signIn}</Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground">
          {dict.or}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button type="button" variant="outline">
        <GoogleIcon className="size-5" />
        {dict.signInWithGoogle}
      </Button>

      <div className="mt-8 space-y-2 text-center text-sm text-muted-foreground">
        <p>
          {dict.noAccount}{" "}
          <Link
            href={`/${lang}/signup`}
            className="font-medium text-brand hover:text-brand-hover"
          >
            {dict.signUpProfessional}
          </Link>
        </p>
        <p>
          {dict.notVerified}{" "}
          <Link
            href={`/${lang}/revalidate`}
            className="font-medium text-brand hover:text-brand-hover"
          >
            {dict.revalidate}
          </Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.89c2.27-2.09 3.58-5.17 3.58-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.89-3c-1.08.73-2.46 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.95H1.26v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.19 7.19 0 0 1 0-4.58V6.6H1.26a12 12 0 0 0 0 10.8l4.01-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.26 6.6l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}
