"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { routing } from "@/i18n/routing";

export default function Navbar() {
  const t = useTranslations("nav");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const localeLabels: Record<string, string> = {
    en: t("langEn"),
    ru: t("langRu"),
    uk: t("langUk"),
    el: t("langEl"),
    es: t("langEs"),
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md p-2 sm:p-4 z-50">
      <div className="container mx-auto flex justify-between items-center gap-2 flex-wrap">
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/logo7.png"
            alt={t("logoAlt")}
            width={150}
            height={46}
            className="rounded-md object-contain"
            style={{ width: "auto", height: "auto", maxWidth: 150 }}
          />
        </Link>

        <div className="hidden sm:flex items-center gap-3 text-sm">
          {routing.locales.map((loc) => (
            <Link
              key={loc}
              href={pathname}
              locale={loc}
              className="rounded-lg px-2 py-1 font-semibold text-zinc-600 hover:bg-zinc-100 hover:text-black transition"
            >
              {localeLabels[loc]}
            </Link>
          ))}
        </div>

        <ul className="hidden sm:flex space-x-6 text-gray-700 font-medium">
          <Link href="/" className="hover:text-blue-500 transition">
            {t("home")}
          </Link>
          <Link href="https://bbqr.site/me" className="hover:text-blue-500 transition">
            {t("about")}
          </Link>
          <Link href="https://bbqr.site/me" className="hover:text-blue-500 transition">
            {t("contact")}
          </Link>
        </ul>

        <button className="sm:hidden text-gray-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <ul className="sm:hidden flex flex-col items-center mt-4 space-y-4 bg-white p-4 shadow-md">
          <li className="flex flex-wrap justify-center gap-2">
            {routing.locales.map((loc) => (
              <Link
                key={loc}
                href={pathname}
                locale={loc}
                className="rounded-lg px-3 py-1 bg-zinc-100 text-sm font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                {localeLabels[loc]}
              </Link>
            ))}
          </li>
          <li>
            <Link href="/" className="text-gray-700 hover:text-blue-500" onClick={() => setIsMenuOpen(false)}>
              {t("home")}
            </Link>
          </li>
          <li>
            <a href="https://bbqr.site/me" className="text-gray-700 hover:text-blue-500">
              {t("about")}
            </a>
          </li>
          <li>
            <a href="https://bbqr.site/me" className="text-gray-700 hover:text-blue-500">
              {t("contact")}
            </a>
          </li>
        </ul>
      )}
    </nav>
  );
}
