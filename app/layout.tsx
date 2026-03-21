import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nataliaki-rag.vercel.app"),
  title: "BIRTH VIBES — Discover Your Moment with AI",
  description:
    "Find out what was playing in cinemas and on the radio when you were born.",
  openGraph: {
    title: "Your Birth Scene 🎬",
    description:
      "I just discovered my birth vibe — movie, music and the moment I entered the world.",
    url: "https://nataliaki-rag.vercel.app",
    siteName: "BIRTH VIBES",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BIRTH VIBES preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Birth Scene 🎬",
    description:
      "I just discovered my birth vibe — movie, music and the moment I entered the world.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/logo8.png",
    shortcut: "/logo8.png",
    apple: "/logo8.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
