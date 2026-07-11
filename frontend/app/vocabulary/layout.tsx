import type { Metadata } from "next"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export const metadata: Metadata = {
  title: "Kho từ vựng",
  description: "Quản lý các bộ từ vựng cá nhân, ôn tập từ vựng bằng Flashcards 3D.",
}

export default function VocabularyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider
      className="product-shell"
      style={
        {
          "--sidebar-width": "18rem",
          "--header-height": "4rem",
        } as React.CSSProperties
      }
    >
      <a
        href="#main-content"
        className="product-focus fixed top-3 left-3 z-[100] -translate-y-24 rounded-control bg-brand-cyan px-4 py-3 text-sm font-semibold text-canvas transition-transform focus:translate-y-0"
      >
        Bỏ qua điều hướng
      </a>
      <AppSidebar />
      <SidebarInset id="main-content" className="min-w-0 bg-transparent">
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
