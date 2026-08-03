"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import { useTheme } from "@/components/theme/theme-provider";
import { getAuthErrorMessage } from "@/lib/api/error-messages";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme: "outline" | "filled_black" | "filled_blue";
              size: "large" | "medium" | "small";
              text: "continue_with" | "signin_with" | "signup_with";
              width: number;
            }
          ) => void;
        };
      };
    };
  }
}

export function GoogleSignInButton({
  lang,
  loginSuccessMessage,
  errorsDict,
}: {
  lang: Locale;
  loginSuccessMessage: string;
  errorsDict: Dictionary["common"]["errors"];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  const googleSignInMutation = useMutation({
    mutationFn: async (providerToken: string) => {
      const result = await signIn("google", { providerToken, redirect: false });
      if (result?.error) {
        throw new Error(result.code ?? result.error);
      }
    },
    onSuccess: () => {
      toast.success(loginSuccessMessage);
      router.push(`/${lang}/dashboard`);
    },
    onError: (error) => {
      toast.error(getAuthErrorMessage(error.message, errorsDict));
    },
  });

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.error(
        "NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set — Google sign-in is disabled."
      );
      return;
    }

    // The GSI script (loaded via next/script in the root layout) may not
    // have finished executing yet when this effect first runs — poll
    // rather than assume it's ready.
    let cancelled = false;

    function renderWhenReady() {
      if (cancelled) return;
      const container = containerRef.current;
      const google = window.google;

      if (!google || !container) {
        setTimeout(renderWhenReady, 100);
        return;
      }

      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID as string,
        // The ID token is short-lived and single-use for verification —
        // it's handed straight to authorize(), never cached or replayed.
        callback: (response) => googleSignInMutation.mutate(response.credential),
      });

      google.accounts.id.renderButton(container, {
        theme: resolvedTheme === "dark" ? "filled_black" : "outline",
        size: "large",
        text: "continue_with",
        width: container.offsetWidth || 320,
      });
    }

    renderWhenReady();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme]);

  if (!GOOGLE_CLIENT_ID) return null;

  return <div ref={containerRef} className="w-full" />;
}
