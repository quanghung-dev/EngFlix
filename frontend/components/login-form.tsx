"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"

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

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Đăng nhập qua API backend để nhận Firebase Token
      const loginRes = await apiRequest<{
        data: {
          idToken: string
          email: string
          uid: string
        }
      }>("auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })

      const token = loginRes.data?.idToken
      if (!token) {
        throw new Error("Không nhận được token từ hệ thống")
      }

      // 2. Lưu token vào localStorage
      localStorage.setItem("token", token)

      // 3. Gọi API đồng bộ (sync) user với DB Postgres nội bộ
      await apiRequest("auth/sync", {
        method: "POST",
      })

      // 4. Chuyển hướng về trang chủ đề học
      router.push("/topics")
    } catch (err: any) {
      console.error("Đăng nhập thất bại:", err)
      setError(
        err.response?.data?.error ||
        err.message ||
        "Đăng nhập không thành công. Vui lòng kiểm tra lại email/mật khẩu."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Đăng nhập tài khoản</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Nhập email và mật khẩu bên dưới để truy cập tài khoản của bạn
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-center text-xs text-destructive">
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
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Đang kết nối..." : "Đăng nhập"}
          </Button>
        </Field>

        <FieldDescription className="text-center">
          Chưa có tài khoản?{" "}
          <a href="/signup" className="underline underline-offset-4">
            Đăng ký
          </a>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}
