"use client"

import { useEffect, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"

import {
  getAuthSessionSnapshot,
  getServerAuthSessionSnapshot,
  subscribeAuthSession,
} from "@/lib/auth-session"

interface UseAuthenticatedUserOptions {
  required?: boolean
  redirectTo?: string
}

export function useAuthenticatedUser({
  required = true,
  redirectTo = "/login",
}: UseAuthenticatedUserOptions = {}) {
  const router = useRouter()
  const { user, resolved } = useSyncExternalStore(
    subscribeAuthSession,
    getAuthSessionSnapshot,
    getServerAuthSessionSnapshot,
  )

  useEffect(() => {
    if (resolved && required && !user) router.replace(redirectTo)
  }, [redirectTo, required, resolved, router, user])

  return {
    user,
    resolved,
    loading: !resolved,
    isAuthenticated: Boolean(user),
  }
}
