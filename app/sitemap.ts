import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { localeToBcp47 } from "@/lib/seo/localeBcp47";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();

  return routing.locales.map((locale) => ({
    url: `${base}/${locale}`,
    lastModified,
    changeFrequency: "weekly",
    priority: locale === routing.defaultLocale ? 1 : 0.9,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((l) => [localeToBcp47(l), `${base}/${l}`])
      ),
    },
  }));
}
