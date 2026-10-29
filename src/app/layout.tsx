import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/components/i18n-provider";
import { getI18n } from "@/lib/i18n-server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t.meta.homeTitle,
      template: "%s · Harbour & Oak",
    },
    description: t.meta.homeDescription,
    openGraph: {
      type: "website",
      locale: "en_IE",
      siteName: "Harbour & Oak",
      title: t.meta.homeTitle,
      description: t.meta.homeDescription,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { lang, t } = await getI18n();

  return (
    <html lang={lang}>
      <body>
        <I18nProvider lang={lang} t={t}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
