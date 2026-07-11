"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { SignupForm } from "@/components/signup-form"
import { GalleryVerticalEndIcon } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      router.push("/topics")
    }
  }, [router])

  return (
    <div className="product-shell grid min-h-svh lg:grid-cols-2 text-white bg-canvas">
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-canvas-deep">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium text-brand-cyan hover:underline">
            <div className="flex size-6 items-center justify-center rounded-md bg-brand-cyan/15 border border-brand-cyan/20 text-brand-cyan">
              <GalleryVerticalEndIcon className="size-4" />
            </div>
            EngFlex
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <SignupForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-canvas lg:block border-l border-stroke-subtle">
        <img
          src="/login.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover brightness-[0.3]"
        />
      </div>
    </div>
  )
}
