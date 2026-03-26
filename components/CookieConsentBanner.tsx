"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const CONSENT_KEY = "cookie-consent-v1";

export default function CookieConsentBanner() {
  const t = useTranslations("cookie");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const accepted = window.localStorage.getItem(CONSENT_KEY);
    setVisible(accepted !== "accepted");
  }, []);

  const accept = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CONSENT_KEY, "accepted");
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[60] sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-md">
      <div className="rounded-2xl border border-zinc-200 bg-white/95 p-4 shadow-2xl backdrop-blur">
        <p className="text-sm font-semibold text-zinc-900">{t("title")}</p>
        <p className="mt-1 text-xs leading-relaxed text-zinc-600">{t("description")}</p>
        <button
          onClick={accept}
          className="mt-3 w-full rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-black"
        >
          {t("accept")}
        </button>
      </div>
    </div>
  );
}
