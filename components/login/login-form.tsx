"use client";

import { useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";

export function LoginForm({
  dict,
  lang,
}: {
  dict: Dictionary["login"];
  lang: Locale;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-foreground">{dict.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{dict.subtitle}</p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="block">
          <span className="sr-only">{dict.emailLabel}</span>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-input px-4 py-3 focus-within:border-brand">
            <MailIcon className="size-5 shrink-0 text-icon-muted" />
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder={dict.emailPlaceholder}
              defaultValue="hello@example.com"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-placeholder"
            />
          </div>
        </label>

        <label className="block">
          <span className="sr-only">{dict.passwordLabel}</span>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-input px-4 py-3 focus-within:border-brand">
            <LockIcon className="size-5 shrink-0 text-icon-muted" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              placeholder={dict.passwordPlaceholder}
              defaultValue="password123"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-placeholder"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="shrink-0 text-icon-muted hover:text-muted-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOffIcon className="size-5" />
              ) : (
                <EyeIcon className="size-5" />
              )}
            </button>
          </div>
        </label>

        <div className="flex justify-end">
          <Link
            href={`/${lang}/forgot-password`}
            className="text-sm font-medium text-brand hover:text-brand-hover"
          >
            {dict.forgotPassword}
          </Link>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-hover"
        >
          {dict.signIn}
        </button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground">
          {dict.or}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-input px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-border/40"
      >
        <GoogleIcon className="size-5" />
        {dict.signInWithGoogle}
      </button>

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

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 11 8 11 8a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.53 13.53 0 0 0 1 12s4 8 11 8a9.74 9.74 0 0 0 5.39-1.61" />
      <path d="m2 2 20 20" />
    </svg>
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
