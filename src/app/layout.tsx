import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { brand } from "@/lib/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Characterful display face — quirky, bold, playful. Carries the personality.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: `${brand.name} — Something is coming`,
  description:
    "A new personal portfolio is on the way. Countdown to launch, then the good stuff.",
  openGraph: {
    title: `${brand.name} — Something is coming`,
    description: "A new personal portfolio is on the way.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0710",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#0B0710] text-white">{children}</body>
    </html>
  );
}
