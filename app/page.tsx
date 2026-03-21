"use client";

import React, { useState } from "react";
import BirthVibesForm from "@/components/BirthVibesForm";
import Navbar from "./navbar";

type LinkedInResponse = {
  post: string;
  aboutNataliaki: string;
  title: string;
  hashtags: string[];
};

export default function Home() {
  const [tab, setTab] = useState<"linkedin" | "birth">("birth");
  const [search, setSearch] = useState<string>("");
  const [response, setResponse] = useState<LinkedInResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    try {
      setResponse(null);
      setError(null);
      setLoading(true);

      const response = await fetch("/api/search", {
        method: "POST",
        body: JSON.stringify({ search }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.error ?? "Request failed");
        return;
      }

      setResponse(data.response);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-6 pb-16 sm:p-12 font-[family-name:var(--font-geist-sans)]">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-20 -left-16 h-72 w-72 rounded-full bg-purple-200/40 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-pink-200/50 blur-3xl animate-pulse" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-8">
        <Navbar />

        <section className="mt-16 text-center animate-[fadeIn_900ms_ease-out]">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 bg-clip-text text-transparent">
            The World When You Arrived
          </h1>
          <p className="mt-4 text-zinc-600 max-w-xl mx-auto">
            Find out what was happening in cinemas and on the radio while you were being born.
          </p>
        </section>

        <div className="mt-2 flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white/70 p-1 backdrop-blur-md shadow-lg">
          <button
            onClick={() => setTab("birth")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 ${
              tab === "birth"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow"
                : "text-zinc-600 hover:text-black hover:scale-[1.02]"
            }`}
          >
            Birth Vibes
          </button>
          <button
            onClick={() => setTab("linkedin")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 ${
              tab === "linkedin"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow"
                : "text-zinc-600 hover:text-black hover:scale-[1.02]"
            }`}
          >
            RAG Query Fun
          </button>
        </div>

        {tab === "birth" && <BirthVibesForm />}

        {tab === "linkedin" && (
          <div className="w-full flex flex-col gap-4 items-center">
            {!loading && (
              <input
                className="rounded-xl border border-zinc-200 bg-white text-black p-3 w-full shadow-sm"
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyPress}
                type="text"
                placeholder="Enter search term..."
              />
            )}

            {!loading && (
              <button
                onClick={handleSearch}
                className="rounded-xl px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white transition-transform hover:scale-105"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            )}

            {loading && (
              <div className="flex justify-center items-center space-x-2">
                <svg
                  className="w-12 h-12 text-blue-500 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 1116 0A8 8 0 014 12z" />
                </svg>
                <p className="text-blue-500">Thinking...</p>
              </div>
            )}

            {error && <p className="text-red-500">{error}</p>}

            {response?.post && (
              <div className="flex flex-col gap-6 items-center text-center sm:text-left animate-[fadeInUp_500ms_ease-out]">
                <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <h2 className="text-2xl font-bold">{response.title}</h2>
                  <p className="text-lg">{response.post}</p>
                </div>

                {response.aboutNataliaki && (
                  <div className="mt-2 p-4 border-l-4 border-blue-500 bg-blue-100 text-blue-900 rounded-xl w-full">
                    <p className="text-sm sm:text-base font-medium">
                      {renderWithLinks(response.aboutNataliaki)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-zinc-500 pt-2">Built with AI + a bit of magic ✨</p>
      </main>
    </div>
  );
}

const renderWithLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  return text.split(urlRegex).map((part, index) =>
    part.match(urlRegex) ? (
      <a
        key={index}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline hover:text-blue-800"
      >
        {part}
      </a>
    ) : (
      part
    )
  );
};