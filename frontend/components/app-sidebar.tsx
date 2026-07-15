"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  BarChart3Icon,
  BookOpenTextIcon,
  ClapperboardIcon,
  GlobeIcon,
  HouseIcon,
  LogInIcon,
  MessageSquareIcon,
  NotebookIcon,
  UsersIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuthenticatedUser } from "@/hooks/use-authenticated-user"
import { getOwnProfile } from "@/services/auth.service"

interface SidebarProfileSummary {
  name: string
  avatar_url: string | null
}

interface ScopedSidebarProfileSummary extends SidebarProfileSummary {
  userId: string
}

const navigationItems = [
  { title: "Trang chủ", url: "/dashboard", icon: HouseIcon },
  { title: "Chủ đề", url: "/topics", icon: ClapperboardIcon },
  { title: "Từ vựng", url: "/vocabulary", icon: BookOpenTextIcon },
  { title: "Chat", url: "/chat", icon: MessageSquareIcon },
  { title: "Ghi chú của tôi", url: "/notes", icon: NotebookIcon },
  { title: "Bạn bè", url: "/friends", icon: UsersIcon },
  { title: "Cộng đồng", url: "/community", icon: GlobeIcon },
  { title: "Tiến độ học", url: "/progress", icon: BarChart3Icon },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setOpenMobile } = useSidebar()
  const { user: currentUser, resolved: authResolved } = useAuthenticatedUser({ required: false })
  const [profileSummary, setProfileSummary] = useState<ScopedSidebarProfileSummary | null>(null)

  useEffect(() => {
    if (!currentUser) return
    let active = true

    void getOwnProfile()
      .then((response) => {
        if (active) {
          setProfileSummary({
            userId: currentUser.uid,
            name: response.data.name,
            avatar_url: response.data.avatar_url,
          })
        }
      })
      .catch(() => {
        // Firebase remains a safe visual fallback if the profile API is unavailable.
      })

    return () => {
      active = false
    }
  }, [currentUser])

  useEffect(() => {
    function handleProfileUpdate(event: Event) {
      const detail = (event as CustomEvent<SidebarProfileSummary>).detail
      if (detail?.name && currentUser) {
        setProfileSummary({ ...detail, userId: currentUser.uid })
      }
    }

    window.addEventListener("engflex:profile-updated", handleProfileUpdate)
    return () => window.removeEventListener("engflex:profile-updated", handleProfileUpdate)
  }, [currentUser])

  const activeProfileSummary =
    profileSummary?.userId === currentUser?.uid ? profileSummary : null
  const displayName =
    activeProfileSummary?.name || currentUser?.displayName || currentUser?.email?.split("@")[0] || "Học viên"
  const avatarUrl = activeProfileSummary?.avatar_url || currentUser?.photoURL

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-sidebar-border p-4 group-data-[collapsible=icon]:px-0.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="EngFlex"
              className="product-focus h-12 bg-transparent p-1.5 hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-1!"
              render={
                <Link
                  href="/dashboard"
                  aria-label="EngFlex - Trang chủ"
                  onClick={() => setOpenMobile(false)}
                />
              }
            >
              <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-nav border border-brand-cyan/20 bg-brand-cyan/10">
                <Image
                  src="/owl-speaking-light.webp"
                  alt=""
                  width={36}
                  height={36}
                  aria-hidden="true"
                  className="h-auto w-full object-contain dark:hidden"
                />
                <Image
                  src="/owl-speaking-cinematic.webp"
                  alt=""
                  width={36}
                  height={36}
                  aria-hidden="true"
                  className="hidden h-auto w-full object-contain dark:block"
                />
              </span>
              <span className="text-lg font-semibold tracking-heading text-foreground group-data-[collapsible=icon]:hidden">
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
        {!authResolved ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuSkeleton showIcon />
            </SidebarMenuItem>
          </SidebarMenu>
        ) : currentUser ? (
          <NavUser
            user={{
              name: displayName,
              email: currentUser.email || "",
              avatar: avatarUrl || "",
              id: currentUser.uid,
            }}
          />
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                tooltip="Đăng nhập"
                className="product-focus text-copy-secondary group-data-[collapsible=icon]:justify-center"
                render={
                  <Link
                    href="/login"
                    aria-label="Đăng nhập"
                    onClick={() => setOpenMobile(false)}
                  />
                }
              >
                <LogInIcon aria-hidden="true" />
                <span className="flex min-w-0 flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
                  <span className="font-medium text-foreground">Đăng nhập</span>
                  <span className="truncate text-xs font-normal text-copy-muted">
                    Lưu tiến độ học tập
                  </span>
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
