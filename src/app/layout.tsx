import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { brand, siteUrl } from "@/lib/config";
import { ThemeProvider } from "@/components/theme-provider";

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

// This root default stays coming-soon-oriented on purpose: pre-launch, every
// `(site)` route defers to it (see `(site)/page.tsx`'s `generateMetadata`,
// which returns `{}` and lets this fallback show through), so it must never
// leak real profile data into `<head>` before launch. Once `LAUNCHED=true`,
// per-page `generateMetadata` (home/projects/blog) overrides this with the
// richer, real copy. Deliberately a plain string `title` (not a
// `{ default, template }` object) — the detail pages already build their own
// full "X — Harsh Pandey" titles, and a parent template would double-suffix
// them.
const comingSoonTitle = `${brand.name} — Something is coming`;
const comingSoonDescription =
  "A new personal portfolio is on the way. Countdown to launch, then the good stuff.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: comingSoonTitle,
  description: comingSoonDescription,
  openGraph: {
    title: comingSoonTitle,
    description: comingSoonDescription,
    type: "website",
    url: siteUrl,
    siteName: brand.name,
  },
  twitter: {
    card: "summary_large_image",
    title: comingSoonTitle,
    description: comingSoonDescription,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
