"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth"
import { FirebaseError } from "firebase/app"
import axios from "axios"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { auth, googleProvider } from "@/lib/firebase"
import {
  clearAuthenticatedSession,
  syncAuthenticatedSession,
} from "@/services/auth.service"

interface ApiErrorBody {
  error?: { message?: string }
}

function loginErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    const messages: Record<string, string> = {
      "auth/user-not-found": "Email hoặc mật khẩu không chính xác.",
      "auth/wrong-password": "Email hoặc mật khẩu không chính xác.",
      "auth/invalid-credential": "Email hoặc mật khẩu không chính xác.",
      "auth/invalid-email": "Định dạng email không hợp lệ.",
      "auth/user-disabled": "Tài khoản của bạn đã bị khóa.",
      "auth/too-many-requests": "Bạn đã thử quá nhiều lần. Vui lòng đợi một lúc rồi thử lại.",
      "auth/network-request-failed": "Không thể kết nối Firebase. Hãy kiểm tra mạng và thử lại.",
    }
    return messages[error.code] ?? "Đăng nhập Firebase chưa thành công. Vui lòng thử lại."
  }

  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) {
      return "Không thể kết nối máy chủ EngFlex. Vui lòng kiểm tra backend và thử lại."
    }
    return error.response.data?.error?.message
      ? "Tài khoản đã được xác thực nhưng chưa thể đồng bộ hồ sơ. Vui lòng thử lại."
      : "Chưa thể đồng bộ hồ sơ EngFlex. Vui lòng thử lại."
  }

  return error instanceof Error && error.message
    ? error.message
    : "Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu."
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Đăng nhập bằng Email/Password qua Firebase SDK
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      await syncAuthenticatedSession(userCredential.user)
      router.replace("/topics")
    } catch (requestError) {
      console.error("Đăng nhập thất bại:", requestError)
      await clearAuthenticatedSession()
      setError(loginErrorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }

  // Đăng nhập bằng Google qua Firebase SDK
  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)

    try {
      const userCredential = await signInWithPopup(auth, googleProvider)
      await syncAuthenticatedSession(userCredential.user)
      router.replace("/topics")
    } catch (requestError) {
      console.error("Đăng nhập Google thất bại:", requestError)
      await clearAuthenticatedSession()
      if (!(requestError instanceof FirebaseError && requestError.code === "auth/popup-closed-by-user")) {
        setError(loginErrorMessage(requestError))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <form onSubmit={handleSubmit} {...props}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Đăng nhập tài khoản</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Nhập email và mật khẩu để bắt đầu học tập trên EngFlex
            </p>
          </div>

          {error && (
            <div role="alert" className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-center text-xs text-destructive">
              {error}
            </div>
          )}

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="admin123@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </Field>

          <Field>
            <div className="flex items-center">
              <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
              <a
                href="#"
                className="ml-auto text-xs underline-offset-4 hover:underline"
              >
                Quên mật khẩu?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </Field>

          <Field>
            <Button type="submit" variant="product" disabled={loading} aria-busy={loading} className="w-full">
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
          </Field>
        </FieldGroup>
      </form>

      {/* Đường phân cách */}
      <div className="relative flex items-center justify-center my-1 text-xs uppercase text-muted-foreground">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stroke" />
        </div>
        <span className="relative bg-canvas px-3 z-10">Hoặc tiếp tục với</span>
      </div>

      {/* Đăng nhập bằng Google */}
      <Button
        type="button"
        variant="glass"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 border-stroke"
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
        </svg>
        Google
      </Button>

      <div className="text-center text-xs text-muted-foreground mt-2">
        Chưa có tài khoản?{" "}
        <a href="/signup" className="underline underline-offset-4 text-white hover:text-brand-cyan transition">
          Đăng ký ngay
        </a>
      </div>
    </div>
  )
}
