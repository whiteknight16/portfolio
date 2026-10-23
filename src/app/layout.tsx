import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { brand, rssAlternateTypes, siteUrl } from "@/lib/config";
import { ThemeProvider } from "@/components/theme-provider";

// UI text: neutral, highly legible workhorse.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Mono: dates, labels, tags, metadata.
const plexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  subsets: ["latin"],
});

// Display: warm serif for headings and note body (the "field notes" voice).
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

// This root default is a real fallback: per-page `generateMetadata`
// (home, about, notes, projects) overrides this with the richer, live
// profile/content copy. Deliberately a plain string `title` (not a
// `{ default, template }` object) — the detail pages already build their own
// full "X — Harsh Pandey" titles, and a parent template would double-suffix
// them.
const defaultTitle = `${brand.name} (${brand.handle}) — ${brand.headline}`;
const defaultDescription = brand.subline;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: defaultTitle,
  description: defaultDescription,
  alternates: { types: rssAlternateTypes },
  verification: {
    google: "Q8Q_CoQhtJKdaPAKaU4Boo3rNOyqEU_4Fl1i1HYZf0o",
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    type: "website",
    url: siteUrl,
    siteName: brand.name,
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3eee4" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1814" },
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
      className={`${inter.variable} ${plexMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background bg-ruled text-foreground">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
