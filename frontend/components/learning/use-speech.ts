"use client"

import { useCallback, useEffect, useState, useSyncExternalStore } from "react"

const subscribeToSpeechSupport = () => () => undefined

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const supported = useSyncExternalStore(
    subscribeToSpeechSupport,
    () => "speechSynthesis" in window,
    () => false
  )

  useEffect(() => {
    return () => window.speechSynthesis?.cancel()
  }, [])

  const stop = useCallback(() => {
    if (!("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window) || !text.trim()) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "en-US"
    utterance.rate = 0.9
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }, [])

  return { isSpeaking, speak, stop, supported }
}
