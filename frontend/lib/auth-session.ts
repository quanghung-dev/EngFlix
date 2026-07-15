import { onIdTokenChanged, type User } from "firebase/auth"

import { auth } from "@/lib/firebase"

export interface AuthSessionSnapshot {
  user: User | null
  resolved: boolean
}

const serverSnapshot: AuthSessionSnapshot = { user: null, resolved: false }
let snapshot: AuthSessionSnapshot = { user: auth.currentUser, resolved: false }
let started = false
let tokenRequest: Promise<string | null> | null = null
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function startAuthSession() {
  if (started || typeof window === "undefined") return
  started = true
  onIdTokenChanged(auth, (user) => {
    tokenRequest = null
    snapshot = { user, resolved: true }
    emit()
  })
}

export function subscribeAuthSession(listener: () => void) {
  startAuthSession()
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getAuthSessionSnapshot() {
  return snapshot
}

export function getServerAuthSessionSnapshot() {
  return serverSnapshot
}

export async function getAuthToken(forceRefresh = false): Promise<string | null> {
  if (typeof window === "undefined") return null
  startAuthSession()
  await auth.authStateReady()
  const user = auth.currentUser
  if (!user) return null
  if (forceRefresh) return user.getIdToken(true)

  if (!tokenRequest) {
    tokenRequest = user.getIdToken().finally(() => {
      tokenRequest = null
    })
  }
  return tokenRequest
}
