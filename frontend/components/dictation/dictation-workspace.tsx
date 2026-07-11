"use client"

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Settings,
  Mic,
  MicOff,
  Eye,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Keyboard,
  SlidersHorizontal,
  X,
  Volume1,
  Maximize2,
  Tv,
  ListMusic,
  GraduationCap
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  getLessonById,
  getLessonTranscripts,
  getCompletedTranscripts,
  completeTranscript,
  recordLearningHistory
} from "@/services/lesson.service"
import { getAllCategories } from "@/services/category.service"
import { LessonType, TranscriptType } from "@/types/lesson"
import { cn } from "@/lib/utils"

// Khai báo kiểu YT cho TypeScript
declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: (() => void) | undefined
  }
}

interface DictationWorkspaceProps {
  lessonId: number
}

export default function DictationWorkspace({ lessonId }: DictationWorkspaceProps) {
  const router = useRouter()

  // State dữ liệu bài học
  const [lesson, setLesson] = useState<LessonType | null>(null)
  const [transcripts, setTranscripts] = useState<TranscriptType[]>([])
  const [categoryName, setCategoryName] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State làm bài và tiến trình
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(0)
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set())
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({})
  const [difficulty, setDifficulty] = useState<"easy" | "normal" | "hard">("hard")
  const [revealStates, setRevealStates] = useState<Record<number, boolean[]>>({})
  const [revealedAll, setRevealedAll] = useState<Record<number, boolean>>({})
  const [isWrong, setIsWrong] = useState(false)
  const [isSuccessText, setIsSuccessText] = useState(false)

  // State điều khiển video
  const [player, setPlayer] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLooping, setIsLooping] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)

  // State hiển thị UI
  const [showVideo, setShowVideo] = useState(true)
  const [showTranscript, setShowTranscript] = useState(true)
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)

  // Speech Recognition (Voice Typing)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  // Parse YouTube video ID
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  // Tải dữ liệu ban đầu
  useEffect(() => {
    let isActive = true

    async function loadData() {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (!token) {
        if (isActive) {
          router.push("/login")
        }
        return
      }

      try {
        setLoading(true)
        const [lessonRes, transcriptsRes, completedRes, categoriesRes] = await Promise.all([
          getLessonById(lessonId),
          getLessonTranscripts(lessonId),
          getCompletedTranscripts(lessonId),
          getAllCategories()
        ])

        if (!isActive) return

        if (!lessonRes.data) {
          setError("Không tìm thấy thông tin bài học.")
          return
        }

        setLesson(lessonRes.data)
        const sortedTranscripts = (transcriptsRes.data || []).sort(
          (a, b) => a.sequence - b.sequence
        )
        setTranscripts(sortedTranscripts)

        // Phục hồi tiến trình đã hoàn thành từ API
        const completedSet = new Set<number>()
        if (completedRes.data) {
          completedRes.data.forEach((item) => completedSet.add(item.transcript_id))
        }
        setCompletedIds(completedSet)

        // Tìm câu chưa hoàn thành đầu tiên để bắt đầu học
        if (sortedTranscripts.length > 0) {
          const firstIncompleteIdx = sortedTranscripts.findIndex(
            (t) => !completedSet.has(t.id)
          )
          if (firstIncompleteIdx !== -1) {
            setCurrentSentenceIndex(firstIncompleteIdx)
          } else {
            setCurrentSentenceIndex(0)
          }
        }

        // Lấy tên danh mục
        if (lessonRes.data.category_id && categoriesRes.data) {
          const matchedCategory = categoriesRes.data.find(
            (c) => c.id === lessonRes.data.category_id
          )
          if (matchedCategory) {
            setCategoryName(matchedCategory.name)
          }
        }

        setLoading(false)
      } catch (err) {
        console.error("Lỗi tải trang học chính tả:", err)
        if (isActive) {
          setError("Đã xảy ra lỗi khi tải bài học. Vui lòng thử lại sau.")
          setLoading(false)
        }
      }
    }

    void loadData()
    return () => {
      isActive = false
    }
  }, [lessonId])

  // Tích hợp YouTube Player API
  useEffect(() => {
    if (!lesson || loading) return

    const videoId = getYouTubeId(lesson.video_url)
    if (!videoId) return

    // Tải script YouTube API nếu chưa có
    if (!window.YT) {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName("script")[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }

    let ytPlayer: any

    const initPlayer = () => {
      ytPlayer = new window.YT.Player("dictation-video-player", {
        height: "100%",
        width: "100%",
        videoId: videoId,
        playerVars: {
          playsinline: 1,
          controls: 0,
          rel: 0,
          showinfo: 0,
          enablejsapi: 1,
          modestbranding: 1
        },
        events: {
          onReady: (event: any) => {
            setPlayer(event.target)
            event.target.setPlaybackRate(playbackSpeed)
            // Tự động phát câu đầu tiên
            setTimeout(() => {
              seekAndPlayCurrent(event.target)
            }, 800)
          },
          onStateChange: (event: any) => {
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING)
          }
        }
      })
    }

    if (window.YT && window.YT.Player) {
      initPlayer()
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback()
        initPlayer()
      }
    }

    return () => {
      if (ytPlayer && ytPlayer.destroy) {
        ytPlayer.destroy()
      }
    }
  }, [lesson, loading])

  // Lắng nghe và giới hạn phân đoạn video (Start/End Timestamps)
  useEffect(() => {
    if (!player || transcripts.length === 0 || currentSentenceIndex >= transcripts.length) return

    const activeSentence = transcripts[currentSentenceIndex]
    const start = activeSentence.start_timestamp
    const end = activeSentence.end_timestamp

    let timer: NodeJS.Timeout

    if (isPlaying) {
      timer = setInterval(() => {
        try {
          const currentTime = player.getCurrentTime()
          if (currentTime >= end) {
            if (isLooping) {
              player.seekTo(start, true)
            } else {
              player.pauseVideo()
              setIsPlaying(false)
            }
          } else if (currentTime < start - 0.5) {
            // Trôi lệch video
            player.seekTo(start, true)
          }
        } catch (err) {
          console.error(err)
        }
      }, 100)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [player, currentSentenceIndex, transcripts, isPlaying, isLooping])

  // Cấu hình Speech Recognition cho Voice Typing
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const rec = new SpeechRecognition()
        rec.continuous = false
        rec.lang = "en-US"
        rec.interimResults = false

        rec.onstart = () => setIsListening(true)
        rec.onend = () => setIsListening(false)
        rec.onresult = (event: any) => {
          const resultText = event.results[0][0].transcript
          setUserAnswers((prev) => {
            const currentVal = prev[currentSentenceIndex] || ""
            const newVal = currentVal ? `${currentVal.trim()} ${resultText}` : resultText
            
            // Trigger check nếu ở chế độ Easy/Normal
            setTimeout(() => {
              handleAnswerCheck(newVal)
            }, 50)

            return { ...prev, [currentSentenceIndex]: newVal }
          })
        }
        recognitionRef.current = rec
      }
    }
  }, [currentSentenceIndex, difficulty, transcripts])

  // Hàm phát lại phân cảnh câu hiện tại
  const seekAndPlayCurrent = (targetPlayer = player) => {
    if (!targetPlayer || transcripts.length === 0) return
    const activeSentence = transcripts[currentSentenceIndex]
    targetPlayer.seekTo(activeSentence.start_timestamp, true)
    targetPlayer.playVideo()
    setIsPlaying(true)
  }

  const pauseVideo = () => {
    if (player) {
      player.pauseVideo()
    }
    setIsPlaying(false)
  }

  // Phím tắt bàn phím
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua nếu đang mở Modal
      if (showShortcutsModal) return

      // Alt + R: Replay segment
      if (e.altKey && e.key.toLowerCase() === "r") {
        e.preventDefault()
        seekAndPlayCurrent()
      }
      
      // Ctrl + Enter: Check hoặc Đi tiếp
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault()
        const isCurrentCompleted = transcripts[currentSentenceIndex] && completedIds.has(transcripts[currentSentenceIndex].id)
        if (isCurrentCompleted) {
          handleNextSentence()
        } else if (difficulty === "hard") {
          handleManualCheck()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [player, currentSentenceIndex, transcripts, completedIds, difficulty, userAnswers, showShortcutsModal])

  // Hàm chuyển đổi chuẩn hóa văn bản
  const normalizeWord = (w: string) =>
    w.toLowerCase().replace(/[.,?!\"':;…\-—]/g, "").trim()

  const inputWordsString = (text: string) => {
    return text.split(/\s+/).map(normalizeWord).filter(Boolean).join(" ")
  }

  // Đếm số từ đúng bắt đầu từ trái sang phải (correct prefix count)
  const countCorrectPrefixWords = (input: string, target: string) => {
    if (!input || !target) return 0
    const inputWords = input.split(/\s+/).map(normalizeWord).filter(Boolean)
    const targetWords = target.split(/\s+/).map(normalizeWord).filter(Boolean)

    let count = 0
    const maxComparable = Math.min(inputWords.length, targetWords.length)
    for (let i = 0; i < maxComparable; i++) {
      if (inputWords[i] !== targetWords[i]) break
      count++
    }
    return count
  }

  // Đánh dấu hoàn thành một câu phụ đề
  const markAsCompleted = async (idx: number) => {
    if (transcripts.length === 0 || idx >= transcripts.length) return
    const activeSentence = transcripts[idx]

    if (completedIds.has(activeSentence.id)) return

    try {
      await completeTranscript(lessonId, activeSentence.id)
      setCompletedIds((prev) => {
        const next = new Set(prev)
        next.add(activeSentence.id)
        
        // Kiểm tra xem đã hoàn thành toàn bộ bài học chưa
        if (next.size === transcripts.length) {
          // Gửi API hoàn thành toàn bộ Dictation bài học
          void recordLearningHistory({
            lesson_id: lessonId,
            completed_dictation: true
          })
        }
        
        return next
      })

      setIsSuccessText(true)
      setIsWrong(false)
    } catch (err) {
      console.error("Lỗi cập nhật tiến trình câu:", err)
    }
  }

  // Tự động kiểm tra câu trả lời (Easy/Normal)
  const handleAnswerCheck = (text: string) => {
    if (transcripts.length === 0 || currentSentenceIndex >= transcripts.length) return
    const targetText = transcripts[currentSentenceIndex].content

    const normalizedInput = inputWordsString(text)
    const normalizedTarget = inputWordsString(targetText)

    // Cập nhật revealStates tương ứng với các từ đúng từ đầu
    const prefixCount = countCorrectPrefixWords(text, targetText)
    if (prefixCount > 0) {
      setRevealStates((prev) => {
        const sentenceId = transcripts[currentSentenceIndex].id
        const currentReveals = [...(prev[sentenceId] || [])]
        for (let i = 0; i < prefixCount; i++) {
          currentReveals[i] = true
        }
        return { ...prev, [sentenceId]: currentReveals }
      })
    }

    if (normalizedInput === normalizedTarget) {
      void markAsCompleted(currentSentenceIndex)
    }
  }

  // Thủ công kiểm tra câu trả lời (Hard)
  const handleManualCheck = () => {
    if (transcripts.length === 0 || currentSentenceIndex >= transcripts.length) return
    const answerText = userAnswers[currentSentenceIndex] || ""
    const targetText = transcripts[currentSentenceIndex].content

    const normalizedInput = inputWordsString(answerText)
    const normalizedTarget = inputWordsString(targetText)

    if (normalizedInput === normalizedTarget) {
      void markAsCompleted(currentSentenceIndex)
    } else {
      setIsWrong(true)
      setIsSuccessText(false)
      // Vẫn gợi ý chữ cái của các từ gõ đúng ở đầu
      const prefixCount = countCorrectPrefixWords(answerText, targetText)
      if (prefixCount > 0) {
        setRevealStates((prev) => {
          const sentenceId = transcripts[currentSentenceIndex].id
          const currentReveals = [...(prev[sentenceId] || [])]
          for (let i = 0; i < prefixCount; i++) {
            currentReveals[i] = true
          }
          return { ...prev, [sentenceId]: currentReveals }
        })
      }
    }
  }

  // Thay đổi ký tự trong textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setUserAnswers((prev) => ({ ...prev, [currentSentenceIndex]: text }))
    setIsWrong(false)

    if (difficulty === "easy" || difficulty === "normal") {
      handleAnswerCheck(text)
    }
  }

  // Xử lý khi click vào nút "Tiếp theo"
  const handleNextSentence = () => {
    if (currentSentenceIndex < transcripts.length - 1) {
      setCurrentSentenceIndex((prev) => prev + 1)
      setIsSuccessText(false)
      setIsWrong(false)
      // Tự động phát câu tiếp theo
      setTimeout(() => {
        seekAndPlayCurrent()
      }, 300)
    }
  }

  // Xem chi tiết câu trước đó
  const handlePrevSentence = () => {
    if (currentSentenceIndex > 0) {
      setCurrentSentenceIndex((prev) => prev - 1)
      setIsSuccessText(false)
      setIsWrong(false)
      setTimeout(() => {
        seekAndPlayCurrent()
      }, 300)
    }
  }

  // Mở khóa toàn bộ từ hiện tại (Bỏ cuộc câu hiện tại)
  const handleRevealAllWords = () => {
    if (transcripts.length === 0) return
    const currentTranscript = transcripts[currentSentenceIndex]
    setRevealedAll((prev) => ({ ...prev, [currentSentenceIndex]: true }))
    setUserAnswers((prev) => ({ ...prev, [currentSentenceIndex]: currentTranscript.content }))
    void markAsCompleted(currentSentenceIndex)
  }

  // Gợi ý từng từ đơn lẻ khi click nút con mắt
  const handleRevealSingleWord = (wordIdx: number) => {
    if (transcripts.length === 0) return
    const sentenceId = transcripts[currentSentenceIndex].id
    setRevealStates((prev) => {
      const current = [...(prev[sentenceId] || [])]
      current[wordIdx] = true
      return { ...prev, [sentenceId]: current }
    })
  }

  // Thay đổi tốc độ phát
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed)
    if (player) {
      player.setPlaybackRate(speed)
    }
    setShowSpeedMenu(false)
  }

  const toggleListening = () => {
    if (!recognitionRef.current) return
    if (isListening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
    }
  }

  // Micro-recording toggle
  const handleMicToggle = () => {
    if (!recognitionRef.current) {
      alert("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Hãy dùng trình duyệt Chrome.")
      return
    }
    toggleListening()
  }

  // Nhận diện mascot src
  const mascotSrc = useMemo(() => {
    const currentAnswer = userAnswers[currentSentenceIndex] || ""
    const isCompleted = transcripts[currentSentenceIndex] && completedIds.has(transcripts[currentSentenceIndex].id)

    if (isCompleted) {
      return "/owl-speaking-cinematic.webp"
    } else if (currentAnswer.trim().length > 0) {
      return "/owl-writing-cinematic.webp"
    } else {
      return "/owl-sleeping.png"
    }
  }, [userAnswers, currentSentenceIndex, completedIds, transcripts])

  // Trạng thái từ hiển thị (thẻ chữ bên dưới)
  const wordCards = useMemo(() => {
    if (transcripts.length === 0 || currentSentenceIndex >= transcripts.length) return []
    const currentTranscript = transcripts[currentSentenceIndex]
    const originalWords = currentTranscript.content.split(/\s+/).filter(Boolean)
    const answerText = userAnswers[currentSentenceIndex] || ""
    const sentenceReveals = revealStates[currentTranscript.id] || []
    const isAllRevealed = revealedAll[currentSentenceIndex] || false
    const isCompleted = completedIds.has(currentTranscript.id)

    return originalWords.map((word: string, idx: number) => {
      const clean = normalizeWord(word)
      let isCorrect = false

      if (isCompleted || isAllRevealed) {
        isCorrect = true
      } else if (difficulty === "easy" || difficulty === "normal") {
        const correctPrefixCount = countCorrectPrefixWords(answerText, currentTranscript.content)
        isCorrect = idx < correctPrefixCount
      }

      const isRevealed = isCorrect || sentenceReveals[idx] || isAllRevealed || isCompleted

      // Định dạng hiển thị của từ
      let displayValue = word
      if (!isRevealed && clean.length > 0) {
        if (difficulty === "easy") {
          const firstLetter = clean[0]
          const stars = "*".repeat(clean.length - 1)
          displayValue = word.replace(clean, `${firstLetter}${stars}`)
        } else {
          displayValue = word.replace(clean, "*".repeat(clean.length))
        }
      }

      return {
        word,
        displayValue,
        isRevealed,
        isCorrect
      }
    })
  }, [transcripts, currentSentenceIndex, userAnswers, revealStates, revealedAll, completedIds, difficulty])

  // Phần trăm tiến độ hoàn thành bài học
  const completionPercentage = useMemo(() => {
    if (transcripts.length === 0) return 0
    return Math.round((completedIds.size / transcripts.length) * 100)
  }, [completedIds, transcripts])

  // UI Loading
  if (loading) {
    return (
      <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4 text-copy-secondary">
        <div className="size-10 animate-spin rounded-full border-4 border-brand-cyan border-t-transparent" />
        <p className="font-mono text-sm tracking-widest text-brand-cyan uppercase animate-pulse">
          Đang tải dữ liệu bài học...
        </p>
      </div>
    )
  }

  // UI Error
  if (error || !lesson) {
    return (
      <div className="mx-auto flex h-[70vh] max-w-md flex-col items-center justify-center text-center gap-6 px-6">
        <HelpCircle className="size-16 text-destructive/80" />
        <h2 className="text-2xl font-semibold text-white">Xảy ra lỗi</h2>
        <p className="text-copy-muted leading-relaxed">{error || "Tải dữ liệu thất bại."}</p>
        <Link href="/topics" className="product-focus inline-flex h-11 items-center gap-2 rounded-nav border border-stroke bg-surface-panel px-6 font-medium text-white hover:bg-surface-glass transition">
          <ArrowLeft className="size-4" /> Về thư viện chủ đề
        </Link>
      </div>
    )
  }

  const activeTranscript = transcripts[currentSentenceIndex]
  const isCurrentSentenceCompleted = activeTranscript && completedIds.has(activeTranscript.id)

  return (
    <div className="min-h-screen bg-canvas text-white">
      {/* Vùng Header điều khiển phụ */}
      <div className="flex flex-col gap-4 border-b border-stroke-subtle px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-copy-muted md:text-sm">
          <Link href="/topics" className="hover:text-white transition">
            Topics
          </Link>
          <ChevronRight className="size-3 text-copy-subtle" />
          <span className="max-w-[12rem] truncate hover:text-white transition" title={categoryName || "Chủ đề"}>
            {categoryName || "Chủ đề"}
          </span>
          <ChevronRight className="size-3 text-copy-subtle" />
          <span className="truncate text-copy-secondary font-semibold max-w-[16rem]" title={lesson.title}>
            {lesson.title}
          </span>
          <Badge variant="info" className="ml-2 font-mono text-[10px] uppercase">
            {lesson.level}
          </Badge>
        </div>

        {/* Nút ẩn/hiện cột */}
        <div className="flex items-center gap-3">
          <Button
            variant="glass"
            size="sm"
            onClick={() => setShowVideo(!showVideo)}
            className={cn("text-[11px] font-mono tracking-wider uppercase transition", !showVideo && "border-brand-cyan/40 text-brand-cyan bg-brand-cyan/5")}
          >
            <Tv className="size-3.5" />
            {showVideo ? "Ẩn Media" : "Hiện Media"}
          </Button>
          <Button
            variant="glass"
            size="sm"
            onClick={() => setShowTranscript(!showTranscript)}
            className={cn("text-[11px] font-mono tracking-wider uppercase transition", !showTranscript && "border-brand-cyan/40 text-brand-cyan bg-brand-cyan/5")}
          >
            <ListMusic className="size-3.5" />
            {showTranscript ? "Ẩn Transcript" : "Hiện Transcript"}
          </Button>
          <Button
            variant="glass"
            size="sm"
            onClick={() => setShowShortcutsModal(true)}
            className="text-[11px] font-mono tracking-wider uppercase hover:text-brand-cyan"
            title="Xem phím tắt"
          >
            <Keyboard className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Grid Layout 3 cột */}
      <div className="grid h-[calc(100vh-4.5rem)] grid-cols-1 overflow-hidden lg:grid-cols-12">
        {/* CỘT 1: VIDEO (Bên trái) */}
        {showVideo && (
          <div className={cn("flex flex-col border-r border-stroke-subtle bg-canvas-deep p-5 lg:p-6 overflow-y-auto transition-all duration-300", showTranscript ? "lg:col-span-4" : "lg:col-span-5")}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-mono text-xs font-bold tracking-widest text-brand-cyan uppercase">
                VIDEO
              </h3>
              <span className="flex items-center gap-1.5 font-mono text-xs text-copy-muted">
                <Clock className="size-3.5" />
                {activeTranscript ? `${activeTranscript.start_timestamp.toFixed(1)}s - ${activeTranscript.end_timestamp.toFixed(1)}s` : "0:00"}
              </span>
            </div>

            {/* Khung nhúng YouTube Player */}
            <div className="relative aspect-video w-full overflow-hidden rounded-panel border border-stroke bg-black shadow-card">
              <div id="dictation-video-player" className="absolute inset-0 size-full pointer-events-none" />
              {/* Overlay bảo vệ tránh người dùng click trực tiếp vào video gây lệch thời gian */}
              <div className="absolute inset-0 z-10 bg-transparent cursor-default" onClick={seekAndPlayCurrent} />
            </div>

            {/* Bộ điều khiển phát */}
            <div className="mt-6">
              <h4 className="font-mono text-[10px] font-bold tracking-widest text-copy-subtle uppercase mb-3">
                ĐIỀU KHIỂN VIDEO
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {isPlaying ? (
                  <Button variant="glass" size="app" onClick={pauseVideo} className="w-full">
                    <Pause className="size-4" /> TẠM DỪNG
                  </Button>
                ) : (
                  <Button variant="product" size="app" onClick={() => seekAndPlayCurrent()} className="w-full">
                    <Play className="size-4" /> BẮT ĐẦU
                  </Button>
                )}
                <Button variant="glass" size="app" onClick={() => seekAndPlayCurrent()} className="w-full hover:border-action-gold/40 hover:text-action-gold transition">
                  <RotateCcw className="size-4" /> PHÁT LẠI
                </Button>
              </div>
            </div>

            {/* Mascot Cú tương tác */}
            <div className="mt-8 flex flex-col items-center justify-center flex-1 min-h-[160px] rounded-feature border border-stroke-subtle bg-surface-panel/30 p-6 text-center select-none">
              <div className="relative size-32 animate-bounce-slow">
                <Image
                  src={mascotSrc}
                  alt="EngFlex Mascot"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <p className="mt-2 text-xs font-mono text-copy-muted uppercase tracking-widest">
                {isCurrentSentenceCompleted
                  ? "Tuyệt vời! Bạn nghe rất chuẩn!"
                  : userAnswers[currentSentenceIndex]?.trim().length > 0
                  ? "Cú đang chăm chú nghe và ghi chép..."
                  : "Cú đang ngủ gật... Hãy bắt đầu học!"}
              </p>
            </div>
          </div>
        )}

        {/* CỘT 2: WORKSPACE (Ở giữa) */}
        <div className={cn("flex flex-col p-5 lg:p-6 overflow-y-auto transition-all duration-300", 
          showVideo && showTranscript ? "lg:col-span-5" : 
          !showVideo && !showTranscript ? "lg:col-span-12" :
          showVideo && !showTranscript ? "lg:col-span-7" : "lg:col-span-7"
        )}>
          {/* Tabs lựa chọn cấp độ */}
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex rounded-control border border-stroke bg-canvas-deep p-1">
              {(["easy", "normal", "hard"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDifficulty(tab)}
                  className={cn(
                    "px-4 py-1.5 text-xs font-mono font-semibold rounded-control tracking-wider uppercase transition-all duration-200",
                    difficulty === tab
                      ? tab === "easy"
                        ? "bg-status-success/15 text-status-success border border-status-success/35"
                        : tab === "normal"
                        ? "bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/35"
                        : "bg-action-gold/15 text-action-gold border border-action-gold/35"
                      : "text-copy-muted hover:text-white"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Vùng workspace điều hướng câu */}
          <div className="rounded-panel border border-stroke bg-surface-panel p-5 lg:p-6 shadow-card">
            {/* Header Vùng Làm Bài */}
            <div className="flex items-center justify-between border-b border-stroke-subtle pb-4 mb-5">
              {/* Navigation < và > */}
              <div className="flex items-center gap-1.5">
                <Button
                  variant="glass"
                  size="icon-sm"
                  onClick={handlePrevSentence}
                  disabled={currentSentenceIndex === 0}
                  className="rounded-control"
                  title="Câu trước"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="font-mono text-xs text-copy-secondary px-2">
                  {currentSentenceIndex + 1} / {transcripts.length}
                </span>
                <Button
                  variant="glass"
                  size="icon-sm"
                  onClick={handleNextSentence}
                  disabled={currentSentenceIndex === transcripts.length - 1}
                  className="rounded-control"
                  title="Câu tiếp theo"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>

              {/* Tốc độ phát và các nút phụ */}
              <div className="flex items-center gap-2">
                {/* Replay segment */}
                <Button
                  variant="glass"
                  size="icon-sm"
                  onClick={() => seekAndPlayCurrent()}
                  className="rounded-control text-copy-secondary hover:text-brand-cyan"
                  title="Phát lại đoạn âm thanh (Alt+R)"
                >
                  <RotateCcw className="size-3.5" />
                </Button>
                
                {/* Play/Pause */}
                <Button
                  variant="glass"
                  size="icon-sm"
                  onClick={isPlaying ? pauseVideo : () => seekAndPlayCurrent()}
                  className="rounded-control text-copy-secondary hover:text-brand-cyan"
                >
                  {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                </Button>

                {/* Dropdown chọn tốc độ */}
                <div className="relative">
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="h-7 text-xs font-mono rounded-control border-stroke-strong gap-1"
                  >
                    <SlidersHorizontal className="size-3" />
                    {playbackSpeed}x
                  </Button>

                  {showSpeedMenu && (
                    <div className="absolute right-0 mt-2 w-28 rounded-control border border-stroke bg-canvas-deep p-1 z-30 shadow-modal">
                      {[0.5, 0.75, 1, 1.25, 1.5].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => handleSpeedChange(speed)}
                          className={cn(
                            "w-full px-3 py-1.5 text-left font-mono text-xs rounded-control transition",
                            playbackSpeed === speed
                              ? "bg-brand-cyan/10 text-brand-cyan"
                              : "text-copy-muted hover:bg-surface-inner hover:text-white"
                          )}
                        >
                          {speed === 1 ? "Normal" : `${speed}x`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Looping Toggle */}
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => setIsLooping(!isLooping)}
                  className={cn(
                    "h-7 text-xs font-mono rounded-control transition",
                    isLooping ? "border-brand-cyan/30 text-brand-cyan bg-brand-cyan/5" : "text-copy-muted"
                  )}
                  title={isLooping ? "Đang bật lặp đoạn" : "Đang tắt lặp đoạn"}
                >
                  Loop
                </Button>
              </div>
            </div>

            {/* Tiêu đề vùng gõ */}
            <p className="font-mono text-[10px] font-bold tracking-widest text-brand-cyan uppercase mb-3">
              GÕ NHỮNG GÌ BẠN NGHE ĐƯỢC:
            </p>

            {/* Ô nhập Textarea chính */}
            <div className="relative rounded-control border border-stroke bg-canvas-deep/80 focus-within:border-brand-cyan/40 transition">
              <textarea
                id="dictation-textarea"
                value={userAnswers[currentSentenceIndex] || ""}
                onChange={handleTextareaChange}
                disabled={isCurrentSentenceCompleted}
                placeholder={
                  isCurrentSentenceCompleted
                    ? "Bạn đã hoàn thành chính xác câu thoại này!"
                    : "Gõ câu trả lời của bạn ở đây..."
                }
                className="w-full min-h-[110px] bg-transparent p-4 pr-12 text-sm leading-6 outline-none resize-none placeholder-copy-subtle text-white disabled:text-copy-muted"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    if (isCurrentSentenceCompleted) {
                      handleNextSentence()
                    } else if (difficulty === "hard") {
                      handleManualCheck()
                    }
                  }
                }}
              />

              {/* Nút Micro (Voice Typing) */}
              <button
                onClick={handleMicToggle}
                disabled={isCurrentSentenceCompleted}
                className={cn(
                  "absolute right-3.5 bottom-3.5 p-2 rounded-full border transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none",
                  isListening
                    ? "bg-destructive border-destructive text-white animate-pulse"
                    : "bg-surface-inner border-stroke-strong text-copy-secondary hover:border-brand-cyan hover:text-brand-cyan"
                )}
                title={isListening ? "Đang lắng nghe... bấm để dừng" : "Gõ bằng giọng nói (Voice Typing)"}
              >
                {isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
              </button>
            </div>

            {/* Hiển thị lỗi sai */}
            {isWrong && (
              <p className="mt-2 text-xs text-destructive flex items-center gap-1 animate-pulse">
                <span>✕ Câu trả lời chưa chính xác. Hãy kiểm tra các gợi ý bên dưới!</span>
              </p>
            )}

            {/* Dòng thẻ chữ (Word Cards) bên dưới */}
            <div className="mt-6 flex flex-wrap gap-2 items-center justify-center p-3 rounded-control border border-stroke-subtle bg-canvas-deep/40 min-h-[60px]">
              {wordCards.map((card: { word: string; displayValue: string; isRevealed: boolean; isCorrect: boolean }, idx: number) => (
                <div key={idx} className="flex flex-col items-center gap-1 group">
                  {/* Icon con mắt hé lộ gợi ý */}
                  {!card.isRevealed && !isCurrentSentenceCompleted && (
                    <button
                      onClick={() => handleRevealSingleWord(idx)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-copy-subtle hover:text-action-gold cursor-pointer"
                      title="Hé lộ từ này"
                    >
                      <Eye className="size-3" />
                    </button>
                  )}
                  {card.isRevealed && !card.isCorrect && !isCurrentSentenceCompleted && (
                    <div className="h-4" /> // Spacing
                  )}

                  {/* Khung chữ */}
                  <span
                    className={cn(
                      "px-2.5 py-1 text-xs font-mono rounded border transition-all duration-300",
                      card.isCorrect
                        ? "bg-status-success/10 border-status-success/30 text-status-success font-semibold"
                        : card.isRevealed
                        ? "bg-action-gold/10 border-action-gold/30 text-action-gold font-semibold"
                        : "bg-surface-inner border-stroke-strong text-copy-muted"
                    )}
                  >
                    {card.displayValue}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-3 text-[10px] text-copy-subtle leading-normal">
              Các từ được tiết lộ bằng con mắt gợi ý sẽ bị tính là lỗi và ảnh hưởng đến điểm số của bạn.
            </p>

            {/* Vùng Action Buttons */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                variant="glass"
                size="app"
                onClick={handleRevealAllWords}
                disabled={isCurrentSentenceCompleted}
                className="flex-1 text-action-gold border-action-gold/20 hover:border-action-gold/40 hover:bg-action-gold/5"
              >
                HIỆN TẤT CẢ TỪ
              </Button>

              {isCurrentSentenceCompleted ? (
                currentSentenceIndex === transcripts.length - 1 ? (
                  <Button
                    variant="glass"
                    size="app"
                    onClick={() => router.push("/topics")}
                    className="flex-1 border-status-success text-status-success hover:bg-status-success/5"
                  >
                    HOÀN THÀNH BÀI HỌC!
                  </Button>
                ) : (
                  <Button
                    variant="product"
                    size="app"
                    onClick={handleNextSentence}
                    className="flex-1"
                  >
                    TIẾP THEO <ChevronRight className="size-4" />
                  </Button>
                )
              ) : difficulty === "hard" ? (
                <Button
                  variant="product"
                  size="app"
                  onClick={handleManualCheck}
                  className="flex-1"
                >
                  KIỂM TRA
                </Button>
              ) : (
                <Button
                  variant="product"
                  size="app"
                  disabled
                  className="flex-1 opacity-50 cursor-not-allowed"
                >
                  ĐANG GÕ...
                </Button>
              )}
            </div>
          </div>

          {/* Dịch nghĩa tiếng Việt sau khi hoàn thành */}
          {isCurrentSentenceCompleted && activeTranscript?.vietnamese && (
            <div className="mt-5 rounded-panel border border-status-success/20 bg-status-success/5 p-4 text-sm leading-6 text-copy-secondary animate-fade-in">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="size-5 shrink-0 text-status-success mt-0.5" />
                <div>
                  <p className="font-semibold text-white text-xs font-mono tracking-widest text-status-success uppercase mb-1">
                    CHÍNH XÁC - DỊCH NGHĨA:
                  </p>
                  <p className="italic text-slate-200">“{activeTranscript.vietnamese}”</p>
                  {activeTranscript.phonetic && (
                    <p className="mt-1 text-xs text-copy-muted font-mono">Phonetic: {activeTranscript.phonetic}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CỘT 3: TRANSCRIPTS (Bên phải) */}
        {showTranscript && (
          <div className="lg:col-span-3 flex flex-col border-l border-stroke-subtle bg-canvas-deep/80 p-5 lg:p-6 overflow-hidden">
            <div className="flex items-center justify-between border-b border-stroke-subtle pb-4 mb-4">
              <h3 className="font-mono text-xs font-bold tracking-widest text-brand-cyan uppercase">
                BẢN CHÉP
              </h3>
              <Badge variant={completionPercentage === 100 ? "success" : "info"} className="font-mono">
                {completionPercentage}%
              </Badge>
            </div>

            {/* Danh sách cuộn câu thoại */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
              {transcripts.map((t, idx) => {
                const isCompleted = completedIds.has(t.id)
                const isActive = idx === currentSentenceIndex

                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setCurrentSentenceIndex(idx)
                      setIsSuccessText(false)
                      setIsWrong(false)
                      setTimeout(() => {
                        seekAndPlayCurrent()
                      }, 200)
                    }}
                    className={cn(
                      "group p-4 rounded-card border cursor-pointer transition-all duration-300 relative overflow-hidden",
                      isActive
                        ? "border-brand-cyan bg-brand-cyan/5 shadow-[0_0_15px_rgba(110,231,242,0.15)]"
                        : isCompleted
                        ? "border-status-success/20 bg-status-success/5 hover:border-status-success/40"
                        : "border-stroke bg-surface-panel hover:border-stroke-strong hover:bg-surface-glass"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] font-bold text-copy-muted">
                        #{t.sequence + 1}
                      </span>
                      {isCompleted && (
                        <CheckCircle2 className="size-3.5 text-status-success" />
                      )}
                    </div>

                    <p className="text-xs leading-5 break-words">
                      {isCompleted || revealedAll[idx]
                        ? t.content
                        : t.content
                            .split(/\s+/)
                            .map((word: string) => {
                              const clean = normalizeWord(word)
                              return clean.length > 0 ? "*".repeat(clean.length) : word
                            })
                            .join(" ")}
                    </p>

                    {/* Dịch nghĩa nhỏ gọn dưới chân nếu đã hoàn thành */}
                    {isCompleted && t.vietnamese && (
                      <p className="mt-2 text-[10px] text-copy-muted italic border-t border-stroke-subtle pt-1.5 truncate">
                        {t.vietnamese}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal hướng dẫn phím tắt */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-panel border border-stroke bg-canvas-deep p-6 text-white shadow-modal mx-4 relative animate-scale-in">
            <button
              onClick={() => setShowShortcutsModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full border border-stroke-strong bg-surface-inner text-copy-muted hover:text-white transition"
            >
              <X className="size-4" />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <Keyboard className="size-5 text-brand-cyan" />
              <h3 className="text-lg font-semibold font-mono tracking-wide uppercase">
                Phím tắt học tập
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stroke-subtle pb-3">
                <span className="text-sm text-copy-secondary">Phát lại đoạn âm thanh câu hiện tại</span>
                <kbd className="px-2 py-1 rounded bg-surface-inner border border-stroke-strong font-mono text-xs text-brand-cyan">
                  Alt + R
                </kbd>
              </div>
              <div className="flex items-center justify-between border-b border-stroke-subtle pb-3">
                <span className="text-sm text-copy-secondary">Kiểm tra câu trả lời (chế độ Hard)</span>
                <kbd className="px-2 py-1 rounded bg-surface-inner border border-stroke-strong font-mono text-xs text-brand-cyan">
                  Ctrl + Enter
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-copy-secondary">Đi tiếp sang câu tiếp theo</span>
                <kbd className="px-2 py-1 rounded bg-surface-inner border border-stroke-strong font-mono text-xs text-brand-cyan">
                  Ctrl + Enter
                </kbd>
              </div>
            </div>
            <p className="mt-6 text-xs text-copy-subtle text-center">
              Sử dụng phím tắt giúp việc luyện nghe chính tả đạt hiệu quả phản xạ cao hơn!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
