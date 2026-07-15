import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "EngFlex — Học tiếng Anh qua phim",
    template: "%s | EngFlex",
  },
  description:
    "Nền tảng luyện nghe, phát âm và phản xạ tiếng Anh qua phim và video.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">
        <AppThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}
