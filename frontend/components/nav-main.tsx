"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
  }[]
}) {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  return (
    <SidebarGroup className="p-0">
      <SidebarGroupLabel className="px-3 font-mono text-[11px] font-semibold tracking-[0.18em] text-copy-muted uppercase">
        Không gian học
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {items.map((item) => {
            const isActive =
              pathname === item.url ||
              (item.url !== "/home" && pathname.startsWith(`${item.url}/`))
            const Icon = item.icon

            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  size="lg"
                  tooltip={item.title}
                  isActive={isActive}
                  className="product-focus group-data-[collapsible=icon]:justify-center"
                  render={
                    <Link
                      href={item.url}
                      aria-label={item.title}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setOpenMobile(false)}
                    />
                  }
                >
                  <Icon
                    aria-hidden="true"
                    className={isActive ? "text-brand-cyan" : undefined}
                  />
                  <span className="group-data-[collapsible=icon]:hidden">
                    {item.title}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
