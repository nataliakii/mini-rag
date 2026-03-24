import { Montserrat } from "next/font/google";
import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import type { Locale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { localeToBcp47 } from "@/lib/seo/localeBcp47";
import { getSiteUrl } from "@/lib/site";

const montserrat = Montserrat({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
});

const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID?.trim();

function ogLocaleTag(loc: string): string {
  if (loc === "el") return "el_GR";
  if (loc === "es") return "es_ES";
  if (loc === "uk") return "uk_UA";
  return "ru_RU";
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return { title: "BIRTH VIBES" };
  }

  const t = await getTranslations({ locale: locale as Locale, namespace: "metadata" });
  const siteUrl = getSiteUrl();
  const path = `/${locale}`;
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[localeToBcp47(l)] = `${siteUrl}/${l}`;
  }
  languages["x-default"] = `${siteUrl}/${routing.defaultLocale}`;

  const keywords = t("keywords")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t("title"),
      template: "%s · BIRTH VIBES",
    },
    description: t("description"),
    applicationName: "BIRTH VIBES",
    keywords: keywords.length ? keywords : undefined,
    authors: [{ name: "Nataliaki", url: siteUrl }],
    creator: "Nataliaki",
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    ...(facebookAppId ? { facebook: { appId: facebookAppId } } : {}),
    alternates: {
      canonical: `${siteUrl}${path}`,
      languages,
    },
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: `${siteUrl}${path}`,
      siteName: "BIRTH VIBES",
      locale: ogLocaleTag(locale),
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map((l) => ogLocaleTag(l)),
      images: [
        {
          url: "/og-image.png?v=20260321-1",
          width: 1200,
          height: 630,
          alt: t("ogImageAlt"),
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("ogTitle"),
      description: t("ogDescription"),
      images: ["/og-image.png?v=20260321-1"],
    },
    icons: {
      icon: "/logo8.png",
      shortcut: "/logo8.png",
      apple: "/logo8.png",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${montserrat.variable} antialiased`}
        style={{
          fontFamily:
            'var(--font-geist-sans), system-ui, "Segoe UI", "Helvetica Neue", sans-serif',
        }}
      >
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
