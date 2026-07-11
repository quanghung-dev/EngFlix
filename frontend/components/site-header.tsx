"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRightIcon } from "lucide-react"

import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader() {
  const pathname = usePathname()
  const isTopicDetail = pathname !== "/topics"

  return (
    <header className="sticky top-0 z-30 flex h-(--header-height) shrink-0 items-center border-b border-stroke-subtle bg-canvas-deep/85 backdrop-blur-xl">
      <div className="flex w-full items-center gap-3 px-5 sm:px-8 lg:px-10">
        <SidebarTrigger className="product-focus -ml-2 text-copy-secondary hover:bg-muted hover:text-white" />
        <span className="h-5 w-px bg-stroke-subtle" aria-hidden="true" />

        {isTopicDetail ? (
          <nav aria-label="Đường dẫn trang" className="min-w-0">
            <ol className="flex min-w-0 items-center gap-2 text-sm">
              <li>
                <Link
                  href="/topics"
                  className="product-focus rounded-control text-copy-muted transition-colors hover:text-brand-cyan"
                >
                  Chủ đề
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRightIcon className="size-3.5 text-copy-subtle" />
              </li>
              <li
                aria-current="page"
                className="truncate font-medium text-white"
              >
                Danh sách bài học
              </li>
            </ol>
          </nav>
        ) : (
          <p className="text-sm font-medium text-white">Thư viện chủ đề</p>
        )}
      </div>
    </header>
  )
}
