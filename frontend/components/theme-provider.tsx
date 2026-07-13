"use client"

import type { ReactNode } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function AppThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableColorScheme
      enableSystem={false}
      storageKey="engflex-theme"
      themes={["light", "dark"]}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
