"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowUpRightIcon, ChevronRightIcon } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { buttonVariants } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export interface ProductBreadcrumb {
  label: string
  href?: string
}

export interface ProductRouteDescriptor {
  title: string
  breadcrumbs?: ProductBreadcrumb[]
  action?: {
    label: string
    href: string
  }
}

const exactRoutes: Record<string, ProductRouteDescriptor> = {
  "/topics": { title: "Thư viện chủ đề" },
  "/vocabulary": {
    title: "Kho từ vựng",
    action: { label: "Làm quiz", href: "/vocabulary/quiz" },
  },
  "/vocabulary/quiz": {
    title: "Trắc nghiệm từ vựng",
    breadcrumbs: [
      { label: "Từ vựng", href: "/vocabulary" },
      { label: "Trắc nghiệm" },
    ],
    action: { label: "Về kho từ", href: "/vocabulary" },
  },
  "/chat": {
    title: "Chat cộng đồng",
    action: { label: "Bảng tin", href: "/community" },
  },
  "/notes": {
    title: "Ghi chú của tôi",
    action: { label: "Chọn bài học", href: "/topics" },
  },
  "/friends": {
    title: "Bạn bè",
    action: { label: "Bảng tin", href: "/community" },
  },
  "/community": {
    title: "Cộng đồng EngFlex",
    action: { label: "Bạn bè", href: "/friends" },
  },
  "/progress": {
    title: "Tiến độ học tập",
    action: { label: "Tiếp tục học", href: "/topics" },
  },
}

function resolveRouteDescriptor(pathname: string): ProductRouteDescriptor {
  const exact = exactRoutes[pathname]
  if (exact) return exact

  if (/^\/topics\/[^/]+$/.test(pathname)) {
    return {
      title: "Bài học theo chủ đề",
      breadcrumbs: [
        { label: "Chủ đề", href: "/topics" },
        { label: "Danh sách bài học" },
      ],
      action: { label: "Về chủ đề", href: "/topics" },
    }
  }

  if (/^\/profile\/[^/]+$/.test(pathname)) {
    return {
      title: "Trang cá nhân",
      action: { label: "Bạn bè", href: "/friends" },
    }
  }

  if (/^\/lessons\/[^/]+\/dictation$/.test(pathname)) {
    return {
      title: "Luyện nghe chính tả",
      breadcrumbs: [
        { label: "Chủ đề", href: "/topics" },
        { label: "Bài học" },
        { label: "Chính tả" },
      ],
      action: { label: "Thoát bài", href: "/topics" },
    }
  }

  if (/^\/lessons\/[^/]+\/shadowing$/.test(pathname)) {
    return {
      title: "Luyện nói Shadowing",
      breadcrumbs: [
        { label: "Chủ đề", href: "/topics" },
        { label: "Bài học" },
        { label: "Shadowing" },
      ],
      action: { label: "Thoát bài", href: "/topics" },
    }
  }

  return { title: "Không gian học EngFlex" }
}

export function SiteHeader() {
  const pathname = usePathname()
  const descriptor = resolveRouteDescriptor(pathname)

  return (
    <header className="sticky top-0 z-30 flex h-(--header-height) shrink-0 items-center border-b border-stroke-subtle bg-canvas-deep/85 backdrop-blur-xl">
      <div className="flex w-full min-w-0 items-center gap-3 px-5 sm:px-8 lg:px-10">
        <SidebarTrigger className="product-focus -ml-2 text-copy-secondary hover:bg-muted hover:text-foreground" />
        <span className="h-5 w-px shrink-0 bg-stroke-subtle" aria-hidden="true" />

        {descriptor.breadcrumbs ? (
          <nav aria-label="Đường dẫn trang" className="min-w-0">
            <ol className="flex min-w-0 items-center gap-2 text-sm">
              {descriptor.breadcrumbs.map((item, index) => {
                const isCurrent = index === descriptor.breadcrumbs!.length - 1
                return (
                  <li key={`${item.label}-${index}`} className="contents">
                    {index > 0 ? (
                      <ChevronRightIcon
                        className="size-3.5 shrink-0 text-copy-subtle"
                        aria-hidden="true"
                      />
                    ) : null}
                    {item.href && !isCurrent ? (
                      <Link
                        href={item.href}
                        className="product-focus rounded-control text-copy-muted transition-colors hover:text-brand-cyan"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span
                        aria-current={isCurrent ? "page" : undefined}
                        className="truncate font-medium text-foreground"
                      >
                        {item.label}
                      </span>
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>
        ) : (
          <p className="truncate text-sm font-medium text-foreground">
            {descriptor.title}
          </p>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <ThemeToggle />
          {descriptor.action ? (
            <Link
              href={descriptor.action.href}
              className={cn(
                buttonVariants({ variant: "glass" }),
                "h-11 rounded-control px-3 sm:px-4"
              )}
            >
              <span className="hidden sm:inline">{descriptor.action.label}</span>
              <ArrowUpRightIcon aria-hidden="true" />
              <span className="sr-only sm:hidden">{descriptor.action.label}</span>
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  )
}
