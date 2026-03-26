"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import MusicPlayer from "@/components/MusicPlayer";
import type { PlayableTrack } from "@/lib/music/getPlayableTrack";

type BirthVibesResult = {
  playable: PlayableTrack | null;
  song: { title: string; artist: string };
  movie: {
    title: string;
    overview: string;
    poster_path: string | null;
    actors: string[];
    director: string;
  } | null;
  text: string;
};

type SupportedLanguage =
  | "english"
  | "russian"
  | "ukrainian"
  | "french"
  | "german"
  | "greek"
  | "spanish"
  | "italian"
  | "turkish";

const localeToTarget: Record<string, SupportedLanguage> = {
  en: "english",
  ru: "russian",
  uk: "ukrainian",
  el: "greek",
  es: "spanish",
};

type BirthVibesFormProps = {
  accentGradient?: string;
};

export default function BirthVibesForm({
  accentGradient = "bg-gradient-to-r from-purple-500 to-pink-500",
}: BirthVibesFormProps) {
  const t = useTranslations("birth");
  const locale = useLocale();

  const loadingPhrases = useMemo(
    () => [t("loading1"), t("loading2"), t("loading3")] as const,
    [t]
  );

  const languageOptions: Array<{ value: SupportedLanguage; label: string }> = useMemo(
    () => [
      { value: "english", label: t("langEnglish") },
      { value: "russian", label: t("langRussian") },
      { value: "ukrainian", label: t("langUkrainian") },
      { value: "french", label: t("langFrench") },
      { value: "german", label: t("langGerman") },
      { value: "greek", label: t("langGreek") },
      { value: "spanish", label: t("langSpanish") },
      { value: "italian", label: t("langItalian") },
      { value: "turkish", label: t("langTurkish") },
    ],
    [t]
  );

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [result, setResult] = useState<BirthVibesResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>(loadingPhrases[0]);
  const [targetLanguage, setTargetLanguage] = useState<SupportedLanguage>(
    () => localeToTarget[locale] ?? "english"
  );
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [translationLoading, setTranslationLoading] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  useEffect(() => {
    const next = localeToTarget[locale];
    if (next) setTargetLanguage(next);
  }, [locale]);

  const getShareIntro = (language: SupportedLanguage) => {
    const keys: Record<SupportedLanguage, string> = {
      english: t("shareIntroEnglish"),
      russian: t("shareIntroRussian"),
      ukrainian: t("shareIntroUkrainian"),
      french: t("shareIntroFrench"),
      german: t("shareIntroGerman"),
      greek: t("shareIntroGreek"),
      spanish: t("shareIntroSpanish"),
      italian: t("shareIntroItalian"),
      turkish: t("shareIntroTurkish"),
    };
    return keys[language];
  };

  const resolveShareableUrl = () => {
    if (typeof window === "undefined") {
      return null;
    }

    const currentUrl = window.location.href;
    const hostname = window.location.hostname;
    const isLocalhost =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname.endsWith(".local");

    if (!isLocalhost) {
      return currentUrl;
    }

    const publicUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
    if (!publicUrl) {
      return null;
    }

    return publicUrl;
  };

  const handleShare = async (platform: "facebook" | "linkedin" | "x") => {
    if (!result?.text) {
      return;
    }

    const pageUrl = resolveShareableUrl();
    if (!pageUrl) {
      setShareError(t("shareErrorLocalhost"));
      setShareNotice(null);
      return;
    }

    setShareError(null);
    setShareNotice(null);
    const storyToShare = translatedText?.trim() ? translatedText : result.text;
    const shareText = `${getShareIntro(targetLanguage)} ${storyToShare}`;
    const encodedUrl = encodeURIComponent(pageUrl);
    const encodedText = encodeURIComponent(shareText);
    const xText = encodeURIComponent(
      shareText.length > 240 ? `${shareText.slice(0, 237)}...` : shareText
    );

    let shareUrl = "";
    if (platform === "facebook") {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
    } else if (platform === "linkedin") {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      try {
        await navigator.clipboard.writeText(`${shareText}\n\n${pageUrl}`);
        setShareNotice(t("shareLinkedInNotice"));
      } catch {
        setShareNotice(t("shareLinkedInFallback"));
      }
    } else {
      shareUrl = `https://twitter.com/intent/tweet?text=${xText}&url=${encodedUrl}`;
    }

    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const handleSubmit = async (preserveResult = false) => {
    if (!name.trim()) {
      setError(t("errorNameRequired"));
      return;
    }

    if (!date) {
      setError(t("errorPickDate"));
      return;
    }

    try {
      setLoading(true);
      setLoadingMessage(loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)]);
      setError(null);
      if (!preserveResult) {
        setResult(null);
      }
      setTranslatedText(null);
      setTranslationError(null);

      const res = await fetch("/api/birth-vibes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date, time: time || undefined, name: name.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? t("errorGeneric"));
        return;
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorUnexpected"));
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!result?.text) {
      return;
    }

    try {
      setTranslationLoading(true);
      setTranslationError(null);

      const res = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: result.text, targetLanguage }),
      });

      const data = await res.json();
      if (!res.ok) {
        setTranslationError(data?.error ?? t("translationError"));
        return;
      }

      setTranslatedText(data.translatedText ?? null);
    } catch (err) {
      setTranslationError(
        err instanceof Error ? err.message : t("translationErrorUnexpected")
      );
    } finally {
      setTranslationLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl rounded-2xl border border-zinc-200 p-3 sm:p-8 bg-white/90 text-black shadow-xl">
      <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:gap-3 items-center sm:justify-center">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("namePlaceholder")}
          required
          className="rounded-xl border border-zinc-300 px-3 py-2 bg-white"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-xl border border-zinc-300 px-3 py-2 bg-white"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="rounded-xl border border-zinc-300 px-3 py-2 bg-white"
        />
        <button
          onClick={() => handleSubmit(false)}
          disabled={loading}
          className={`rounded-xl px-4 py-2 text-white transition-transform ${
            loading
              ? "bg-zinc-400 cursor-not-allowed"
              : `${accentGradient} hover:scale-105`
          }`}
        >
          {loading ? t("loading") : t("reveal")}
        </button>
      </div>

      <p className="text-base sm:text-lg text-zinc-600 mt-2 text-center">{t("subtitle")}</p>

      {loading && (
        <div className="mt-2 text-sm text-zinc-600 animate-pulse">
          <span>{loadingMessage}</span>
          <span className="inline-flex ml-1">
            <span className="animate-[fadeIn_700ms_ease-in-out_infinite]">.</span>
            <span className="animate-[fadeIn_700ms_ease-in-out_150ms_infinite]">.</span>
            <span className="animate-[fadeIn_700ms_ease-in-out_300ms_infinite]">.</span>
          </span>
        </div>
      )}

      {error && <p className="mt-2 text-red-600">{error}</p>}

      {result && (
        <div className="mt-5 space-y-3 rounded-2xl bg-zinc-50 p-2 sm:p-6 border border-zinc-200 shadow-[0_0_40px_rgba(168,85,247,0.15)] animate-[fadeInUp_500ms_ease-out]">
          <div className="rounded-2xl border border-zinc-200 bg-white p-2 sm:p-4 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ease-out opacity-0 scale-95 animate-[fadeInUp_500ms_ease-out_140ms_forwards]">
            <p className="text-sm font-medium mb-1 sm:mb-2">{t("musicHeading")}</p>
            <MusicPlayer playable={result.playable} />
          </div>

          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 sm:p-4 opacity-0 animate-[fadeInUp_500ms_ease-out_240ms_forwards]">
            <p className="leading-relaxed">{result.text}</p>

            <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:items-center">
              <label className="sr-only" htmlFor="translate-lang">
                {t("translateLanguage")}
              </label>
              <select
                id="translate-lang"
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value as SupportedLanguage)}
                className="rounded-xl border border-zinc-300 px-3 py-2 bg-white text-sm"
                aria-label={t("translateLanguage")}
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleTranslate}
                disabled={translationLoading}
                className={`rounded-xl px-4 py-2 text-sm text-white transition-transform ${
                  translationLoading
                    ? "bg-zinc-400 cursor-not-allowed"
                    : `${accentGradient} hover:scale-105`
                }`}
              >
                {translationLoading ? t("translating") : t("translateButton")}
              </button>
            </div>

            {translationError && <p className="mt-2 text-sm text-red-600">{translationError}</p>}
            {translatedText && (
              <div className="mt-3 rounded-xl border border-purple-200 bg-white p-3 animate-[fadeInUp_400ms_ease-out]">
                <p className="text-xs uppercase tracking-wide text-purple-600 font-semibold mb-1">
                  {t("translationHeading")}
                </p>
                <p className="leading-relaxed">{translatedText}</p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {t("share")}
              </span>
              <button
                onClick={() => handleShare("facebook")}
                className="rounded-lg px-3 py-1.5 text-xs text-white bg-[#1877F2] hover:scale-105 transition-transform"
              >
                Facebook
              </button>
              <button
                onClick={() => handleShare("linkedin")}
                className="rounded-lg px-3 py-1.5 text-xs text-white bg-[#0A66C2] hover:scale-105 transition-transform"
              >
                LinkedIn
              </button>
              <button
                onClick={() => handleShare("x")}
                className="rounded-lg px-3 py-1.5 text-xs text-white bg-black hover:scale-105 transition-transform"
              >
                X
              </button>
            </div>
            {shareError && <p className="mt-2 text-xs text-red-600">{shareError}</p>}
            {shareNotice && <p className="mt-2 text-xs text-zinc-600">{shareNotice}</p>}
          </div>

          {result.movie ? (
            <div className="rounded-2xl shadow-xl bg-white p-4 flex flex-col sm:flex-row gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 opacity-0 animate-[fadeInUp_550ms_ease-out_340ms_forwards]">
              <div className="shrink-0">
                {result.movie.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w500/${result.movie.poster_path}`}
                    alt={`Poster for ${result.movie.title}`}
                    width={160}
                    height={240}
                    className="rounded-xl border border-zinc-200 object-cover"
                  />
                ) : (
                  <div className="w-40 h-60 rounded-xl border border-dashed border-zinc-300 flex items-center justify-center text-xs text-zinc-500 p-2 text-center">
                    {t("posterUnavailable")}
                  </div>
                )}
              </div>
              <div>
                <p>
                  🎬 <strong>{result.movie.title}</strong>
                </p>
                <p className="mt-2 text-sm text-zinc-700">{result.movie.overview}</p>
                <p className="mt-2 text-xs text-zinc-600">
                  <strong>{t("actors")}:</strong>{" "}
                  {result.movie.actors.length > 0 ? result.movie.actors.join(", ") : t("unknown")}
                </p>
                <p className="text-xs text-zinc-600">
                  <strong>{t("director")}:</strong> {result.movie.director || t("unknown")}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-zinc-600 opacity-0 animate-[fadeInUp_500ms_ease-out_340ms_forwards]">
              {t("movieUnavailable")}
            </p>
          )}

          <button
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className={`mt-1 rounded-xl px-4 py-2 text-sm text-white ${accentGradient} hover:scale-105 transition-transform disabled:bg-zinc-400 disabled:scale-100 opacity-0 animate-[fadeInUp_500ms_ease-out_420ms_forwards]`}
          >
            {t("regenerate")}
          </button>
        </div>
      )}
    </div>
  );
}
