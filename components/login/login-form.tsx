"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Mail } from "lucide-react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import { getAuthErrorMessage } from "@/lib/api/error-messages";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

export function LoginForm({
  dict,
  common,
  lang,
}: {
  dict: Dictionary["login"];
  common: Dictionary["common"];
  lang: Locale;
}) {
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const result = await signIn("credentials", {
        ...credentials,
        redirect: false,
      });

      // signIn() never rejects for auth failures — it resolves with an
      // error/code pair instead, so we translate that into a thrown error
      // to let TanStack Query's onError path handle it uniformly.
      if (result?.error) {
        throw new Error(result.code ?? result.error);
      }
    },
    onSuccess: () => {
      toast.success(common.toasts.loginSuccess);
      router.push(`/${lang}/dashboard`);
    },
    onError: (error) => {
      toast.error(getAuthErrorMessage(error.message, common.errors));
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    loginMutation.mutate({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-foreground">{dict.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{dict.subtitle}</p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <Input
          label={dict.emailLabel}
          type="email"
          name="email"
          icon={Mail}
          autoComplete="email"
          placeholder={dict.emailPlaceholder}
          required
        />

        <PasswordInput
          label={dict.passwordLabel}
          name="password"
          autoComplete="current-password"
          placeholder={dict.passwordPlaceholder}
          required
        />

        <div className="flex justify-end">
          <Link
            href={`/${lang}/forgot-password`}
            className="text-sm font-medium text-brand hover:text-brand-hover"
          >
            {dict.forgotPassword}
          </Link>
        </div>

        <Button type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? common.loading : dict.signIn}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground">
          {dict.or}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <GoogleSignInButton
        lang={lang}
        label={dict.signInWithGoogle}
        successMessage={common.toasts.loginSuccess}
        errorsDict={common.errors}
      />

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
            href={`/${lang}/verify-email`}
            className="font-medium text-brand hover:text-brand-hover"
          >
            {dict.revalidate}
          </Link>
        </p>
      </div>
    </div>
  );
}
