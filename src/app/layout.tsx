import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { brand, siteUrl } from "@/lib/config";
import { ThemeProvider } from "@/components/theme-provider";

// Body: neutral, highly legible workhorse.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Mono: structural device — section indices, dates, tags, metadata.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

// Display: technical, geometric grotesk. Carries the engineering identity.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// This root default is a real fallback: per-page `generateMetadata`
// (home/projects/blog) overrides this with the richer, live profile/content
// copy. Deliberately a plain string `title` (not a `{ default, template }`
// object) — the detail pages already build their own full "X — Harsh Pandey"
// titles, and a parent template would double-suffix them.
const defaultTitle = `${brand.name} — ${brand.headline}`;
const defaultDescription = brand.subline;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: defaultTitle,
  description: defaultDescription,
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
      className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
