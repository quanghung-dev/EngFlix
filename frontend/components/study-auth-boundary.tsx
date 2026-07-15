"use client"

import { useEffect, useState, type ReactNode } from "react"

import { AsyncContentState } from "@/components/product/async-content-state"
import { useAuthenticatedUser } from "@/hooks/use-authenticated-user"
import { getAuthToken } from "@/lib/auth-session"

interface AttemptState {
  uid: string
  attempt: number
}

interface FailureState extends AttemptState {
  message: string
}

export function StudyAuthBoundary({ children }: { children: ReactNode }) {
  const { user, resolved } = useAuthenticatedUser()
  const [attempt, setAttempt] = useState(0)
  const [ready, setReady] = useState<AttemptState | null>(null)
  const [failure, setFailure] = useState<FailureState | null>(null)

  useEffect(() => {
    if (!resolved || !user) return
    let active = true

    void getAuthToken()
      .then((token) => {
        if (!active) return
        if (!token) throw new Error("Missing Firebase ID token")
        setReady({ uid: user.uid, attempt })
      })
      .catch(() => {
        if (active) {
          setFailure({
            uid: user.uid,
            attempt,
            message: "Chưa thể xác nhận phiên học. Vui lòng thử lại.",
          })
        }
      })

    return () => {
      active = false
    }
  }, [attempt, resolved, user])

  const currentAttempt = user ? { uid: user.uid, attempt } : null
  const isReady = Boolean(
    currentAttempt &&
      ready?.uid === currentAttempt.uid &&
      ready.attempt === currentAttempt.attempt
  )
  const currentFailure =
    currentAttempt &&
    failure?.uid === currentAttempt.uid &&
    failure.attempt === currentAttempt.attempt
      ? failure.message
      : null

  if (!resolved || !user || !isReady) {
    return (
      <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8">
        {currentFailure ? (
          <AsyncContentState
            kind="error"
            title="Chưa thể mở phiên học"
            description={currentFailure}
            onRetry={() => setAttempt((value) => value + 1)}
          />
        ) : (
          <AsyncContentState
            kind="loading"
            title="Đang xác nhận phiên học"
            description="EngFlex đang chuẩn bị dữ liệu và tiến độ của bạn."
          />
        )}
      </div>
    )
  }

  return children
}
