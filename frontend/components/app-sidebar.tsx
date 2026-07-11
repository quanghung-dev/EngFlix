"use client"

import Image from "next/image"
import Link from "next/link"
import {
  BookOpenTextIcon,
  ClapperboardIcon,
  HouseIcon,
  LogInIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const navigationItems = [
  { title: "Trang chủ", url: "/home", icon: HouseIcon },
  { title: "Chủ đề", url: "/topics", icon: ClapperboardIcon },
  { title: "Từ vựng", url: "/vocabulary", icon: BookOpenTextIcon },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-sidebar-border p-4 group-data-[collapsible=icon]:px-0.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="EngFlex"
              className="product-focus h-12 bg-transparent p-1.5 hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-1!"
              render={<Link href="/home" aria-label="EngFlex - Trang chủ" />}
            >
              <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-nav border border-brand-cyan/20 bg-brand-cyan/10">
                <Image
                  src="/owl-speaking-cinematic.webp"
                  alt=""
                  width={36}
                  height={36}
                  aria-hidden="true"
                  className="size-9 object-contain"
                />
              </span>
              <span className="text-lg font-semibold tracking-[-0.035em] text-white group-data-[collapsible=icon]:hidden">
                Eng<span className="text-brand-cyan">Flex</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4 group-data-[collapsible=icon]:px-0.5">
        <NavMain items={navigationItems} />
      </SidebarContent>

      <SidebarSeparator className="mx-4" />
      <SidebarFooter className="p-4 group-data-[collapsible=icon]:px-0.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Đăng nhập"
              className="product-focus text-copy-secondary group-data-[collapsible=icon]:justify-center"
              render={<Link href="/login" aria-label="Đăng nhập" />}
            >
              <LogInIcon aria-hidden="true" />
              <span className="flex min-w-0 flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
                <span className="font-medium text-white">Đăng nhập</span>
                <span className="truncate text-xs font-normal text-copy-muted">
                  Lưu tiến độ học tập
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
