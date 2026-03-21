"use client";

import { useState } from "react";
import Image from "next/image";
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

type SupportedLanguage = "russian" | "ukrainian" | "french" | "greek" | "spanish" | "german";

const languageOptions: Array<{ value: SupportedLanguage; label: string }> = [
  { value: "russian", label: "Русский" },
  { value: "ukrainian", label: "Українська" },
  { value: "french", label: "Français" },
  { value: "greek", label: "Ελληνικά" },
  { value: "spanish", label: "Español" },
  { value: "german", label: "Deutsch" },
];

export default function BirthVibesForm() {
  const loadingPhrases = [
    "Reconstructing your birth moment...",
    "Scanning cinemas and radio waves...",
    "Finding your vibe...",
  ] as const;

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [result, setResult] = useState<BirthVibesResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>(loadingPhrases[0]);
  const [targetLanguage, setTargetLanguage] = useState<SupportedLanguage>("russian");
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [translationLoading, setTranslationLoading] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  const handleSubmit = async (preserveResult = false) => {
    if (!date) {
      setError("Please pick your birth date first.");
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
        body: JSON.stringify({ date, time: time || undefined, name: name || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Failed to reveal your vibe.");
        return;
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
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
        setTranslationError(data?.error ?? "Translation failed.");
        return;
      }

      setTranslatedText(data.translatedText ?? null);
    } catch (err) {
      setTranslationError(err instanceof Error ? err.message : "Unexpected translation error");
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
          placeholder="Name (optional)"
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
              : "bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105"
          }`}
        >
          {loading ? "Loading vibe..." : "Reveal my vibe"}
        </button>
      </div>

      <p className="text-base sm:text-lg text-zinc-600 mt-2 text-center">
        Pick your birthday and discover your birth vibes.
      </p>

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
            <p className="text-sm font-medium mb-1 sm:mb-2">🎵 This was playing while you were being born</p>
            <MusicPlayer playable={result.playable} />
          </div>

          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 sm:p-4 opacity-0 animate-[fadeInUp_500ms_ease-out_240ms_forwards]">
            <p className="leading-relaxed">{result.text}</p>

            <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:items-center">
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value as SupportedLanguage)}
                className="rounded-xl border border-zinc-300 px-3 py-2 bg-white text-sm"
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
                    : "bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105"
                }`}
              >
                {translationLoading ? "Translating..." : "Translate story"}
              </button>
            </div>

            {translationError && <p className="mt-2 text-sm text-red-600">{translationError}</p>}
            {translatedText && (
              <div className="mt-3 rounded-xl border border-purple-200 bg-white p-3 animate-[fadeInUp_400ms_ease-out]">
                <p className="text-xs uppercase tracking-wide text-purple-600 font-semibold mb-1">
                  Translation
                </p>
                <p className="leading-relaxed">{translatedText}</p>
              </div>
            )}
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
                    Poster not available
                  </div>
                )}
              </div>
              <div>
                <p>
                🎬 <strong>{result.movie.title}</strong>
                </p>
                <p className="mt-2 text-sm text-zinc-700">{result.movie.overview}</p>
                <p className="mt-2 text-xs text-zinc-600">
                  <strong>Actors:</strong>{" "}
                  {result.movie.actors.length > 0 ? result.movie.actors.join(", ") : "Unknown"}
                </p>
                <p className="text-xs text-zinc-600">
                  <strong>Director:</strong> {result.movie.director || "Unknown"}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-zinc-600 opacity-0 animate-[fadeInUp_500ms_ease-out_340ms_forwards]">
              🎬 Movie highlight not available for this date.
            </p>
          )}

          <button
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="mt-1 rounded-xl px-4 py-2 text-sm text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 transition-transform disabled:bg-zinc-400 disabled:scale-100 opacity-0 animate-[fadeInUp_500ms_ease-out_420ms_forwards]"
          >
            Generate another version
          </button>
        </div>
      )}
    </div>
  );
}
