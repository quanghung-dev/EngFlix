"use client"

import { useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { SignupForm } from "@/components/signup-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { GalleryVerticalEndIcon } from "lucide-react"
import { auth } from "@/lib/firebase"

export default function SignupPage() {
  const router = useRouter()

  useEffect(() => {
    let active = true
    void auth.authStateReady().then(() => {
      if (!active) return
      if (auth.currentUser) router.replace("/topics")
      else localStorage.removeItem("token")
    })
    return () => {
      active = false
    }
  }, [router])

  return (
    <div className="product-shell grid min-h-svh bg-canvas text-copy-primary lg:grid-cols-2">
      <div className="flex flex-col gap-4 bg-canvas-deep p-6 md:p-10">
        <div className="flex items-center justify-between gap-3">
          <a href="#" className="product-focus flex items-center gap-2 font-medium text-brand-cyan hover:underline">
            <div className="flex size-6 items-center justify-center rounded-md bg-brand-cyan/15 border border-brand-cyan/20 text-brand-cyan">
              <GalleryVerticalEndIcon className="size-4" />
            </div>
            EngFlex
          </a>
          <ThemeToggle className="shrink-0" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md rounded-panel border border-stroke bg-surface-panel p-6 shadow-card sm:p-8">
            <SignupForm />
          </div>
        </div>
      </div>
      <div className="relative hidden border-l border-stroke-subtle bg-surface-inner lg:block">
        <Image
          src="/login.jpg"
          alt="Hai học viên đang đọc sách trong thư viện"
          fill
          priority
          sizes="50vw"
          className="absolute inset-0 h-full w-full object-cover brightness-[0.72] dark:brightness-[0.3]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas/30 via-transparent to-canvas/10 dark:from-canvas/70 dark:via-canvas/15 dark:to-canvas/25"
        />
      </div>
    </div>
  )
}
