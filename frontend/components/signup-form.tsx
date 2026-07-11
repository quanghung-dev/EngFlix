"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from "firebase/auth"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { apiRequest } from "@/lib/api-client"
import { auth, googleProvider } from "@/lib/firebase"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Đăng ký bằng Email/Password qua Firebase SDK
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Kiểm tra mật khẩu khớp nhau
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Mật khẩu phải dài ít nhất 6 ký tự.")
      setLoading(false)
      return
    }

    try {
      // 1. Tạo người dùng mới qua Firebase SDK
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // 2. Cập nhật Display Name (Họ tên) của user trên Firebase
      if (name.trim()) {
        await updateProfile(user, {
          displayName: name.trim(),
        })
      }

      // 3. Lấy ID Token mới tạo
      const token = await user.getIdToken()
      if (!token) {
        throw new Error("Đăng ký thành công nhưng không lấy được mã xác thực")
      }

      // 4. Lưu token vào localStorage
      localStorage.setItem("token", token)

      // 5. Gọi API đồng bộ (sync) thông tin với Postgres DB ở backend
      await apiRequest("auth/sync", {
        method: "POST",
      })

      // 6. Điều hướng về trang thư viện bài học
      router.push("/topics")
    } catch (err: any) {
      console.error("Đăng ký Firebase thất bại:", err)

      // Việt hóa mã lỗi Firebase thông dụng
      let errorMsg = "Đăng ký không thành công. Vui lòng thử lại sau."
      if (err.code === "auth/email-already-in-use") {
        errorMsg = "Địa chỉ email này đã được sử dụng bởi một tài khoản khác."
      } else if (err.code === "auth/invalid-email") {
        errorMsg = "Địa chỉ email không đúng định dạng."
      } else if (err.code === "auth/weak-password") {
        errorMsg = "Mật khẩu quá yếu (phải có ít nhất 6 ký tự)."
      } else if (err.message) {
        errorMsg = err.message
      }

      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // Đăng nhập nhanh bằng Google qua Firebase SDK
  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)

    try {
      // 1. Đăng nhập Google
      const userCredential = await signInWithPopup(auth, googleProvider)
      const token = await userCredential.user.getIdToken()

      if (!token) {
        throw new Error("Không lấy được mã xác thực từ Google")
      }

      // 2. Lưu token vào localStorage
      localStorage.setItem("token", token)

      // 3. Đồng bộ hóa với backend
      await apiRequest("auth/sync", {
        method: "POST",
      })

      // 4. Điều hướng về trang thư viện bài học
      router.push("/topics")
    } catch (err: any) {
      console.error("Đăng ký bằng Google thất bại:", err)
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Kết nối tài khoản Google thất bại.")
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
            <h1 className="text-2xl font-bold">Đăng ký tài khoản</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Tạo tài khoản mới để lưu trữ lịch sử và tiến độ học tập trên EngFlex
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-center text-xs text-destructive">
              {error}
            </div>
          )}

          <Field>
            <FieldLabel htmlFor="name">Họ và tên</FieldLabel>
            <Input
              id="name"
              type="text"
              placeholder="Nguyen Van A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="confirm-password">Xác nhận mật khẩu</FieldLabel>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </Field>

          <Field>
            <Button type="submit" variant="product" disabled={loading} className="w-full">
              {loading ? "Đang xử lý..." : "Đăng ký tài khoản"}
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

      {/* Đăng ký bằng Google */}
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
        Đã có tài khoản?{" "}
        <a href="/login" className="underline underline-offset-4 text-white hover:text-brand-cyan transition">
          Đăng nhập ngay
        </a>
      </div>
    </div>
  )
}
