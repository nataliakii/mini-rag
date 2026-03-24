import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { AppLocale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { localeToBcp47 } from "@/lib/seo/localeBcp47";
import { getSiteUrl } from "@/lib/site";

type MetadataMessages = {
  title: string;
  description: string;
};

export async function JsonLdHome({ locale }: { locale: string }) {
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const loc = locale as AppLocale;
  const t = await getTranslations({ locale: loc, namespace: "metadata" });
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/${loc}`;
  const inLanguages = routing.locales.map((l) => localeToBcp47(l));

  const title = t("title");
  const description = t("description");

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "BIRTH VIBES",
        description,
        inLanguage: inLanguages,
        publisher: {
          "@type": "Organization",
          name: "Nataliaki",
          url: siteUrl,
        },
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: title,
        description,
        inLanguage: localeToBcp47(loc),
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: {
          "@type": "Thing",
          name: "Birth Vibes",
          description,
        },
      },
      {
        "@type": "WebApplication",
        "@id": `${pageUrl}#webapp`,
        name: "BIRTH VIBES",
        url: pageUrl,
        description,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        inLanguage: localeToBcp47(loc),
        isPartOf: { "@id": `${siteUrl}/#website` },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
