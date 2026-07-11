import type { Metadata } from "next"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export const metadata: Metadata = {
  title: "Học tập",
  description: "Luyện nghe chính tả và nhại giọng phát âm.",
}

export default function LessonsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider
      defaultOpen={false}
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
