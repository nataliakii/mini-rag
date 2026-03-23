import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID?.trim();

export const metadata: Metadata = {
  metadataBase: new URL("https://fun.bbqr.site"),
  title: "BIRTH VIBES — Discover Your Moment with AI",
  description:
    "Find out what was playing in cinemas and on the radio when you were born.",
  ...(facebookAppId ? { facebook: { appId: facebookAppId } } : {}),
  openGraph: {
    title: "Your Birth Scene 🎬",
    description:
      "I just discovered my birth vibe — movie, music and the moment I entered the world.",
    url: "https://fun.bbqr.site",
    siteName: "BIRTH VIBES",
    images: [
      {
        url: "/og-image.png?v=20260321-1",
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
    images: ["/og-image.png?v=20260321-1"],
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
