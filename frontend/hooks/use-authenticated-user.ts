"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, type User } from "firebase/auth"

import { auth } from "@/lib/firebase"

interface UseAuthenticatedUserOptions {
  required?: boolean
  redirectTo?: string
}

export function useAuthenticatedUser({
  required = true,
  redirectTo = "/login",
}: UseAuthenticatedUserOptions = {}) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(auth.currentUser)
  const [resolved, setResolved] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setResolved(true)

      if (required && !nextUser) {
        router.replace(redirectTo)
      }
    })
  }, [redirectTo, required, router])

  return {
    user,
    resolved,
    loading: !resolved,
    isAuthenticated: Boolean(user),
  }
}
