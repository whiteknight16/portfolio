"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

/**
 * Wraps `next-themes` with the defaults the whole site relies on: theme is
 * expressed as a `.dark` class on `<html>` (matches the token setup in
 * `globals.css`), starts from the visitor's OS preference, and stays in sync
 * with it. `disableTransitionOnChange` stops every element's own CSS
 * transitions from firing at once when the user flips the toggle.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
