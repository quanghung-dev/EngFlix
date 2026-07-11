"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, updateProfile } from "firebase/auth"
import {
  BookOpenTextIcon,
  ClapperboardIcon,
  HouseIcon,
  LogInIcon,
  LogOutIcon,
  MessageSquare,
  Notebook,
  User,
  X,
  ShieldCheck,
  Phone,
  Mail,
  Calendar,
  Award,
  Save,
  Users,
  Globe,
  BarChart3
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { auth } from "@/lib/firebase"
import { updateUserProfile } from "@/services/auth.service"

const navigationItems = [
  { title: "Trang chủ", url: "/home", icon: HouseIcon },
  { title: "Chủ đề", url: "/topics", icon: ClapperboardIcon },
  { title: "Từ vựng", url: "/vocabulary", icon: BookOpenTextIcon },
  { title: "Chat", url: "/chat", icon: MessageSquare },
  { title: "Ghi chú của tôi", url: "/notes", icon: Notebook },
  { title: "Bạn bè", url: "/friends", icon: Users },
  { title: "Cộng đồng", url: "/community", icon: Globe },
  { title: "Tiến độ học", url: "/progress", icon: BarChart3 },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  // States cho Modal Hồ sơ
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [savingProfile, setSavingProfile] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Theo dõi trạng thái đăng nhập Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      if (user) {
        setEditName(user.displayName || "")
        // Đọc số điện thoại từ Firebase user hoặc để trống để cập nhật
        setEditPhone(user.phoneNumber || "")
      }
    })
    return () => unsubscribe()
  }, [])

  // Đăng xuất tài khoản
  const handleSignOut = async () => {
    try {
      await auth.signOut()
      localStorage.removeItem("token")
      setShowProfileModal(false)
      router.push("/login")
    } catch (err) {
      console.error("Đăng xuất thất bại:", err)
    }
  }

  // Cập nhật hồ sơ cá nhân
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth.currentUser) return

    setSavingProfile(true)
    setSaveSuccess(false)
    try {
      // 1. Cập nhật trên Firebase Auth Client
      await updateProfile(auth.currentUser, {
        displayName: editName.trim()
      })

      // 2. Cập nhật trên Postgres DB thông qua API
      await updateUserProfile({
        name: editName.trim(),
        phone: editPhone.trim() || undefined
      })

      // Cập nhật local state để hiển thị ngay
      setCurrentUser({
        ...auth.currentUser,
        displayName: editName.trim()
      })

      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    } catch (err) {
      console.error("Cập nhật thông tin thất bại:", err)
      alert("Đã xảy ra lỗi khi lưu thông tin.")
    } finally {
      setSavingProfile(false)
    }
  }

  // Định dạng ngày tham gia học tập
  const formatJoinDate = (creationTime?: string) => {
    if (!creationTime) return "Chưa rõ"
    try {
      const date = new Date(creationTime)
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      })
    } catch (e) {
      return creationTime
    }
  }

  return (
    <>
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
              {currentUser ? (
                /* Profile Footer khi đã Đăng nhập */
                <SidebarMenuButton
                  size="lg"
                  tooltip="Hồ sơ cá nhân"
                  className="product-focus text-copy-secondary group-data-[collapsible=icon]:justify-center w-full flex items-center justify-start p-2 rounded-control hover:bg-sidebar-accent"
                  onClick={() => setShowProfileModal(true)}
                >
                  <div className="size-9 rounded-full border border-brand-cyan/20 bg-brand-cyan/15 flex items-center justify-center font-bold text-sm text-brand-cyan shrink-0">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt=""
                        className="size-full rounded-full object-cover"
                      />
                    ) : (
                      (currentUser.displayName || currentUser.email || "U").charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="flex min-w-0 flex-col gap-0.5 group-data-[collapsible=icon]:hidden ml-2.5 text-left">
                    <span className="font-semibold text-white truncate max-w-[10rem]">
                      {currentUser.displayName || currentUser.email?.split("@")[0]}
                    </span>
                    <span className="truncate text-xs font-normal text-copy-muted hover:text-brand-cyan transition">
                      Xem hồ sơ học viên
                    </span>
                  </span>
                </SidebarMenuButton>
              ) : (
                /* Nút Đăng nhập mặc định */
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
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* MODAL THÔNG TIN CHI TIẾT NGƯỜI DÙNG */}
      {showProfileModal && currentUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleUpdateProfile}
            className="w-full max-w-md rounded-panel border border-stroke bg-canvas-deep p-6 text-white shadow-modal mx-4 relative animate-scale-in"
          >
            {/* Nút đóng modal */}
            <button
              type="button"
              onClick={() => setShowProfileModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full border border-stroke-strong bg-surface-inner text-copy-subtle hover:text-white transition"
            >
              <X className="size-4" />
            </button>

            {/* Title */}
            <h3 className="text-base font-semibold font-mono tracking-wide uppercase text-brand-cyan mb-6 flex items-center gap-2">
              <User className="size-5" /> Hồ sơ học viên
            </h3>

            {/* Profile Avatar section */}
            <div className="flex flex-col items-center justify-center gap-3 border-b border-stroke pb-6 mb-6">
              <div className="size-16 rounded-full border-2 border-brand-cyan/40 bg-brand-cyan/10 flex items-center justify-center font-bold text-2xl text-brand-cyan shadow-[0_0_20px_rgba(110,231,242,0.15)]">
                {currentUser.displayName?.charAt(0).toUpperCase() || currentUser.email?.charAt(0).toUpperCase()}
              </div>
              <div className="text-center">
                <h4 className="text-base font-bold text-white">
                  {currentUser.displayName || "Học viên EngFlex"}
                </h4>
                <Badge variant="success" className="font-mono text-[9px] uppercase tracking-wider mt-1 px-2 py-0.5">
                  LEVEL {((currentUser.displayName?.length || 10) % 25) + 5}
                </Badge>
              </div>
            </div>

            {/* Form sửa thông tin */}
            <div className="space-y-4">
              
              {/* Email (Read-only) */}
              <div className="space-y-1.5">
                <label className="text-xs text-copy-secondary font-medium flex items-center gap-1.5">
                  <Mail className="size-3.5 text-copy-subtle" /> Địa chỉ Email
                </label>
                <Input
                  disabled
                  value={currentUser.email || ""}
                  className="bg-surface-inner border-stroke text-xs rounded-control h-10 text-copy-muted cursor-not-allowed"
                />
              </div>

              {/* Họ tên */}
              <div className="space-y-1.5">
                <label className="text-xs text-copy-secondary font-medium flex items-center gap-1.5">
                  <User className="size-3.5 text-brand-cyan" /> Họ và tên *
                </label>
                <Input
                  required
                  placeholder="Nhập họ tên đầy đủ..."
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-surface-panel border-stroke text-xs rounded-control h-10"
                />
              </div>

              {/* Số điện thoại */}
              <div className="space-y-1.5">
                <label className="text-xs text-copy-secondary font-medium flex items-center gap-1.5">
                  <Phone className="size-3.5 text-brand-cyan" /> Số điện thoại
                </label>
                <Input
                  placeholder="Nhập số điện thoại..."
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="bg-surface-panel border-stroke text-xs rounded-control h-10"
                />
              </div>

              {/* Ngày tham gia */}
              <div className="flex items-center gap-2 text-xs text-copy-muted mt-2 font-mono">
                <Calendar className="size-3.5" />
                Ngày tham gia: {formatJoinDate(currentUser.metadata?.creationTime)}
              </div>
            </div>

            {/* Thông báo cập nhật thành công */}
            {saveSuccess && (
              <div className="mt-4 rounded-lg border border-status-success/20 bg-status-success/10 p-3 text-center text-xs text-status-success animate-fade-in">
                Đã lưu thông tin hồ sơ thành công!
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex items-center justify-between border-t border-stroke pt-4">
              {/* Nút Đăng xuất */}
              <Button
                type="button"
                variant="glass"
                onClick={handleSignOut}
                className="font-mono text-xs uppercase text-destructive hover:bg-destructive/10 hover:border-destructive/30"
              >
                <LogOutIcon className="size-3.5 mr-1" /> Đăng xuất
              </Button>

              {/* Nút lưu */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="glass"
                  onClick={() => setShowProfileModal(false)}
                  className="font-mono text-xs uppercase"
                >
                  Đóng
                </Button>
                <Button
                  type="submit"
                  variant="product"
                  disabled={savingProfile}
                  className="font-mono text-xs uppercase gap-1.5"
                >
                  <Save className="size-3.5" /> {savingProfile ? "Đang lưu..." : "Lưu"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
