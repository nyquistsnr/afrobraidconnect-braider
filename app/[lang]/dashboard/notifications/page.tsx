import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../dictionaries";
import { NotificationsList } from "@/components/dashboard/notifications/notifications-list";

export const metadata = {
  title: "Notifications",
};

export default async function DashboardNotificationsPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await props.params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <div className="w-full">
      <NotificationsList
        lang={lang}
        dict={dict.dashboard.header}
        common={dict.common}
      />
    </div>
  );
}
