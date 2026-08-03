import { notFound } from "next/navigation";
import Image from "next/image";
import { getDictionary, hasLocale, locales } from "../dictionaries";
import { LoginForm } from "@/components/login/login-form";
import { LanguageSwitcher } from "@/components/language/language-switcher";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LoginPage({
  params,
}: PageProps<"/[lang]/login">) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <div className="flex min-h-screen flex-1 bg-white dark:bg-neutral-950">
      <div className="flex w-full flex-col justify-between px-6 py-10 sm:px-10 lg:w-1/2 lg:px-16 xl:px-24">
        <div />

        <div className="mx-auto w-full max-w-sm">
          <LoginForm dict={dict.login} lang={lang} />
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-col-reverse items-center gap-4 pt-10 text-sm text-neutral-500 dark:text-neutral-400 sm:flex-row sm:justify-between">
          <a
            href={`mailto:${dict.login.supportEmail}`}
            className="flex items-center gap-1.5 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            <MailIcon className="size-4" />
            {dict.login.supportEmail}
          </a>
          <LanguageSwitcher lang={lang} />
        </div>
      </div>

      <div className="relative hidden lg:block lg:w-1/2">
        <Image
          src="/images/hero.png"
          alt={dict.login.heroImageAlt}
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
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
