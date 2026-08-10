import { getDictionary } from "./dictionaries";
import type { Locale } from "@/lib/i18n";
import { Header } from "@/components/layout/header";
import { Hero } from "@/components/home/hero";
import { Footer } from "@/components/layout/footer";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header dict={dict} lang={lang} />
      <main className="flex-1 flex flex-col">
        <Hero dict={dict} lang={lang} />
      </main>
      <Footer dict={dict} lang={lang} />
    </div>
  );
}
