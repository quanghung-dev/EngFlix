import type { Metadata } from "next"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export const metadata: Metadata = {
  title: "Báo cáo tiến độ học tập",
  description: "Theo dõi streak học tập, thời gian học và thống kê phát âm của bạn.",
}

export default function ProgressLayout({
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
