"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
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
  GraduationCap,
  MessageSquare,
  ChevronDown,
  VolumeX,
  Info
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  getLessonById,
  getLessonTranscripts,
  assessPronunciation,
  getPronunciationProgress,
  updatePronunciationProgress,
  recordLearningHistory
} from "@/services/lesson.service"
import { getAllCategories } from "@/services/category.service"
import { LessonType, TranscriptType } from "@/types/lesson"
import { WavRecorder } from "@/lib/wav-recorder"
import { cn } from "@/lib/utils"

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: (() => void) | undefined
  }
}

interface ShadowingWorkspaceProps {
  lessonId: number
}

interface WordAssessment {
  word: string
  score: number
  feedback: string
  weakPhonemes: { phoneme: string; score: number }[]
}

interface AssessmentResult {
  text: string
  overallScore: number
  scores: {
    accuracy: number
    fluency: number
    completeness: number
    prosody: number
  }
  feedback: string
  words: WordAssessment[]
}

export default function ShadowingWorkspace({ lessonId }: ShadowingWorkspaceProps) {
  const router = useRouter()

  // State dữ liệu bài học
  const [lesson, setLesson] = useState<LessonType | null>(null)
  const [transcripts, setTranscripts] = useState<TranscriptType[]>([])
  const [categoryName, setCategoryName] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State luyện tập và tiến độ
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(0)
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set())
  const [bestScores, setBestScores] = useState<Map<number, number>>(new Map())
  
  // State bật/tắt hiển thị danh sách câu thoại
  const [showIpa, setShowIpa] = useState(true)
  const [showTrans, setShowTrans] = useState(true)

  // State điều khiển Video
  const [player, setPlayer] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLooping, setIsLooping] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  
  // Toggles đặc trưng của Shadowing
  const [autoPause, setAutoPause] = useState(true)
  const [largeVideo, setLargeVideo] = useState(false)

  // State dịch từ vựng nhanh bằng AI
  const [translateLoading, setTranslateLoading] = useState(false)
  const [translationResult, setTranslationResult] = useState<any | null>(null)
  const [savingWord, setSavingWord] = useState(false)

  const handleTranslateWord = async (word: string) => {
    setTranslateLoading(true)
    setTranslationResult(null)
    try {
      const { translatePhraseAI } = await import("@/services/vocabulary.service")
      const res = await translatePhraseAI(word)
      if (res.data) {
        setTranslationResult(res.data)
      }
    } catch (err) {
      console.error("Lỗi dịch từ vựng:", err)
    } finally {
      setTranslateLoading(false)
    }
  }

  const handleSaveWord = async () => {
    if (!translationResult) return
    const activeTranscript = transcripts[currentSentenceIndex]
    setSavingWord(true)
    try {
      const { getMyVocabularyDecks, createVocabularyDeck, addVocabularyItem } = await import("@/services/vocabulary.service")
      const decksRes = await getMyVocabularyDecks()
      const deckList = decksRes.data || []
      let defaultDeck = deckList.find((d) => d.is_default) || deckList[0]

      if (!defaultDeck) {
        const createRes = await createVocabularyDeck({ name: "Từ vựng mặc định" })
        defaultDeck = createRes.data
      }

      if (defaultDeck) {
        await addVocabularyItem(defaultDeck.id, {
          phrase: translationResult.phrase,
          normalized_phrase: translationResult.phrase.toLowerCase(),
          meaning: translationResult.meaning,
          note: translationResult.note,
          example_sentence: translationResult.example_sentence,
          lesson_id: lessonId,
          transcript_id: activeTranscript?.id
        })
        alert(`Đã lưu "${translationResult.phrase}" vào bộ từ "${defaultDeck.name}"!`)
        setTranslationResult(null)
      }
    } catch (err) {
      console.error("Lỗi lưu từ:", err)
      alert("Không thể lưu từ vựng.")
    } finally {
      setSavingWord(false)
    }
  }
  
  // State hiển thị UI 3 cột
  const [showTranscript, setShowTranscript] = useState(true)
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)

  // State ghi âm và chấm điểm phát âm
  const [recorder, setRecorder] = useState<WavRecorder | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null)
  const [userAudioPlaying, setUserAudioPlaying] = useState(false)
  const userAudioRef = useRef<HTMLAudioElement | null>(null)
  
  const [isAssessing, setIsAssessing] = useState(false)
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null)
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null)

  // Parse YouTube video ID
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  // Khởi tạo WavRecorder
  useEffect(() => {
    setRecorder(new WavRecorder())
    return () => {
      if (userAudioUrl) {
        URL.revokeObjectURL(userAudioUrl)
      }
    }
  }, [])

  // Tải dữ liệu ban đầu
  useEffect(() => {
    let isActive = true

    async function loadData() {
      // Kiểm tra token
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (!token) {
        if (isActive) {
          router.push("/login")
        }
        return
      }

      try {
        setLoading(true)
        const [lessonRes, transcriptsRes, progressRes, categoriesRes] = await Promise.all([
          getLessonById(lessonId),
          getLessonTranscripts(lessonId),
          getPronunciationProgress(lessonId),
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

        // Phục hồi tiến độ phát âm từ cơ sở dữ liệu
        const completedSet = new Set<number>()
        const scoresMap = new Map<number, number>()
        if (progressRes.data) {
          progressRes.data.forEach((item: any) => {
            const score = Number(item.best_score)
            scoresMap.set(item.transcript_id, score)
            // Lấy điểm phát âm trên 60 coi như hoàn thành câu đó
            if (score >= 60) {
              completedSet.add(item.transcript_id)
            }
          })
        }
        setCompletedIds(completedSet)
        setBestScores(scoresMap)

        // Tìm câu chưa hoàn thành đầu tiên
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
        console.error("Lỗi tải dữ liệu Shadowing:", err)
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

    if (!window.YT) {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName("script")[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }

    let ytPlayer: any

    const initPlayer = () => {
      ytPlayer = new window.YT.Player("shadowing-video-player", {
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

  // Kiểm soát giới hạn phát và Tự động dừng (Auto Pause)
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
            if (autoPause) {
              player.pauseVideo()
              setIsPlaying(false)
            } else if (isLooping) {
              player.seekTo(start, true)
            } else {
              player.pauseVideo()
              setIsPlaying(false)
            }
          } else if (currentTime < start - 0.5) {
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
  }, [player, currentSentenceIndex, transcripts, isPlaying, isLooping, autoPause])

  // Phím tắt bàn phím
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showShortcutsModal) return

      // Alt + R: Replay segment
      if (e.altKey && e.key.toLowerCase() === "r") {
        e.preventDefault()
        seekAndPlayCurrent()
      }

      // Ctrl + Enter: Đi tiếp sang câu mới nếu câu hiện tại đã đạt điểm pass (>= 60)
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault()
        const isCurrentCompleted = transcripts[currentSentenceIndex] && completedIds.has(transcripts[currentSentenceIndex].id)
        if (isCurrentCompleted) {
          handleNextSentence()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [player, currentSentenceIndex, transcripts, completedIds, showShortcutsModal])

  // Ghi nhận phát video hiện tại
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

  // Thu âm giọng nói
  const startRecording = async () => {
    if (!recorder) return
    try {
      setUserAudioUrl(null)
      setRecordedBlob(null)
      setAssessmentResult(null)
      setSelectedWordIndex(null)
      await recorder.start()
      setIsRecording(true)
    } catch (e) {
      console.error(e)
      alert("Không thể truy cập microphone. Vui lòng bật quyền micro trong cài đặt trình duyệt.")
    }
  }

  const stopRecording = async () => {
    if (!recorder || !isRecording) return
    try {
      const blob = recorder.stop()
      setIsRecording(false)
      setRecordedBlob(blob)
      setUserAudioUrl(URL.createObjectURL(blob))

      // Tự động gọi API đánh giá phát âm ngay khi ghi âm xong
      await handleAssess(blob)
    } catch (e) {
      console.error(e)
      setIsRecording(false)
    }
  }

  // Gọi API Azure Speech đánh giá phát âm
  const handleAssess = async (blob: Blob) => {
    if (transcripts.length === 0 || currentSentenceIndex >= transcripts.length) return
    const activeSentence = transcripts[currentSentenceIndex]

    setIsAssessing(true)
    try {
      const result = await assessPronunciation({
        audio: blob,
        referenceText: activeSentence.content,
        lessonId: lessonId,
        transcriptId: activeSentence.id
      })

      const data = result.data || result
      setAssessmentResult(data)

      const score = Number(data.overallScore ?? 0)

      // Gọi API đồng bộ cập nhật điểm số tốt nhất (best score)
      await updatePronunciationProgress(activeSentence.id)

      // Cập nhật local state lưu điểm số
      setBestScores((prev) => {
        const next = new Map(prev)
        const currentBest = next.get(activeSentence.id) || 0
        if (score > currentBest) {
          next.set(activeSentence.id, score)
        }
        return next
      })

      // Đánh dấu hoàn thành nếu điểm >= 60
      if (score >= 60) {
        setCompletedIds((prev) => {
          const next = new Set(prev)
          next.add(activeSentence.id)

          // Nếu hoàn thành toàn bộ câu thoại của bài học
          if (next.size === transcripts.length) {
            void recordLearningHistory({
              lesson_id: lessonId,
              completed_pronunciation: true
            })
          }
          return next
        })
      }
    } catch (err) {
      console.error("Lỗi đánh giá phát âm:", err)
      alert("Đánh giá phát âm thất bại. Vui lòng thu âm lại rõ ràng hơn.")
    } finally {
      setIsAssessing(false)
    }
  }

  // Nghe lại đoạn ghi âm của mình
  const playUserRecording = () => {
    if (!userAudioUrl) return
    if (userAudioRef.current) {
      userAudioRef.current.pause()
    }

    const audio = new Audio(userAudioUrl)
    userAudioRef.current = audio
    audio.play()
    setUserAudioPlaying(true)
    audio.onended = () => setUserAudioPlaying(false)
  }

  // Chuyển sang câu tiếp theo
  const handleNextSentence = () => {
    if (currentSentenceIndex < transcripts.length - 1) {
      setCurrentSentenceIndex((prev) => prev + 1)
      setAssessmentResult(null)
      setSelectedWordIndex(null)
      setRecordedBlob(null)
      setUserAudioUrl(null)
      setTimeout(() => {
        seekAndPlayCurrent()
      }, 300)
    }
  }

  // Lùi câu trước
  const handlePrevSentence = () => {
    if (currentSentenceIndex > 0) {
      setCurrentSentenceIndex((prev) => prev - 1)
      setAssessmentResult(null)
      setSelectedWordIndex(null)
      setRecordedBlob(null)
      setUserAudioUrl(null)
      setTimeout(() => {
        seekAndPlayCurrent()
      }, 300)
    }
  }

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed)
    if (player) {
      player.setPlaybackRate(speed)
    }
    setShowSpeedMenu(false)
  }

  // Phân tách từ và căn chỉnh IPA tương ứng
  const alignedWords = useMemo(() => {
    if (transcripts.length === 0 || currentSentenceIndex >= transcripts.length) return []
    const activeSentence = transcripts[currentSentenceIndex]
    const originalWords = activeSentence.content.split(/\s+/).filter(Boolean)
    
    // Xử lý chuỗi phonetic (IPA)
    const ipaText = activeSentence.phonetic || ""
    const ipaWords = ipaText.split(/\s+/).filter(Boolean)

    return originalWords.map((word, idx) => {
      let cleanWord = word.toLowerCase().replace(/[.,?!\"':;…\-—]/g, "").trim()
      
      let rawIpa = ipaWords[idx] || ""
      // Đảm bảo bọc IPA bằng ký tự gạch chéo
      if (rawIpa && !rawIpa.startsWith("/")) {
        rawIpa = `/${rawIpa}/`
      }

      // Kiểm tra xem đã có kết quả chấm điểm phát âm cho từ này chưa
      let score: number | null = null
      let wordFeedback = ""
      let weakPhonemes: { phoneme: string; score: number }[] = []

      if (assessmentResult?.words && assessmentResult.words.length > 0) {
        // Khớp từ theo thứ tự vị trí
        const matchedAssessment = assessmentResult.words[idx]
        if (matchedAssessment) {
          score = matchedAssessment.score
          wordFeedback = matchedAssessment.feedback
          weakPhonemes = matchedAssessment.weakPhonemes
        }
      }

      return {
        word,
        cleanWord,
        ipa: rawIpa,
        score,
        feedback: wordFeedback,
        weakPhonemes
      }
    })
  }, [transcripts, currentSentenceIndex, assessmentResult])

  // Tiến trình hoàn thành tổng thể bài học (%)
  const completionPercentage = useMemo(() => {
    if (transcripts.length === 0) return 0
    return Math.round((completedIds.size / transcripts.length) * 100)
  }, [completedIds, transcripts])

  // Điểm số tốt nhất hiển thị cho câu hiện tại
  const currentSentenceBestScore = useMemo(() => {
    if (transcripts.length === 0) return 0
    const activeSentence = transcripts[currentSentenceIndex]
    return bestScores.get(activeSentence.id) || 0
  }, [bestScores, currentSentenceIndex, transcripts])

  // Giao diện Loading
  if (loading) {
    return (
      <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4 text-copy-secondary">
        <div className="size-10 animate-spin rounded-full border-4 border-brand-cyan border-t-transparent" />
        <p className="font-mono text-sm tracking-widest text-brand-cyan uppercase animate-pulse">
          Đang tải dữ liệu Shadowing...
        </p>
      </div>
    )
  }

  // Giao diện Lỗi tải trang
  if (error || !lesson) {
    return (
      <div className="mx-auto flex h-[70vh] max-w-md flex-col items-center justify-center text-center gap-6 px-6">
        <HelpCircle className="size-16 text-destructive/80" />
        <h2 className="text-2xl font-semibold text-foreground">Xảy ra lỗi</h2>
        <p className="text-copy-muted leading-relaxed">{error || "Tải dữ liệu thất bại."}</p>
        <Link href="/topics" className="product-focus inline-flex h-11 items-center gap-2 rounded-nav border border-stroke bg-surface-panel px-6 font-medium text-foreground hover:bg-surface-glass transition">
          <ArrowLeft className="size-4" /> Về thư viện chủ đề
        </Link>
      </div>
    )
  }

  const activeTranscript = transcripts[currentSentenceIndex]

  return (
    <div className="min-h-screen bg-canvas text-foreground">
      {/* Vùng Header điều hướng phụ */}
      <div className="flex flex-col gap-4 border-b border-stroke-subtle px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-copy-muted md:text-sm">
          <Link href="/topics" className="hover:text-foreground transition">
            Topics
          </Link>
          <ChevronRight className="size-3 text-copy-subtle" />
          <span className="max-w-[12rem] truncate hover:text-foreground transition" title={categoryName || "Chủ đề"}>
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

      {/* Grid Layout chính 2 cột */}
      <div className="grid h-[calc(100vh-4.5rem)] grid-cols-1 overflow-hidden lg:grid-cols-12">
        {/* CỘT TRÁI (VIDEO & WORKSPACE): Chiếm 8 hoặc 12 cột */}
        <div className={cn("flex flex-col p-5 lg:p-6 overflow-y-auto border-r border-stroke-subtle", showTranscript ? "lg:col-span-8" : "lg:col-span-12")}>
          
          {/* Vùng phát Video YouTube */}
          <div className="w-full flex flex-col items-center mb-6">
            <div
              className={cn(
                "relative overflow-hidden rounded-panel border border-stroke bg-black shadow-card transition-all duration-300",
                largeVideo ? "w-full aspect-video" : "w-full max-w-2xl aspect-video"
              )}
            >
              <div id="shadowing-video-player" className="absolute inset-0 size-full pointer-events-none" />
              <div className="absolute inset-0 z-10 bg-transparent cursor-default" onClick={seekAndPlayCurrent} />
            </div>

            {/* Menu phụ điều khiển Video */}
            <div className={cn("mt-4 flex flex-wrap items-center justify-between gap-4 w-full", !largeVideo && "max-w-2xl")}>
              {/* Toggles */}
              <div className="flex items-center gap-5">
                <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs font-mono text-copy-secondary">
                  <input
                    type="checkbox"
                    checked={autoPause}
                    onChange={(e) => setAutoPause(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-8 h-4 bg-surface-inner border border-stroke-strong peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-surface-panel after:content-[''] after:absolute after:top-[2px] after:start-[3px] after:bg-copy-muted after:border-stroke-strong after:border after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-brand-cyan/20 peer-checked:border-brand-cyan/40 peer-checked:after:bg-brand-cyan" />
                  Tự động dừng
                </label>
                <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs font-mono text-copy-secondary">
                  <input
                    type="checkbox"
                    checked={largeVideo}
                    onChange={(e) => setLargeVideo(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-8 h-4 bg-surface-inner border border-stroke-strong peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-surface-panel after:content-[''] after:absolute after:top-[2px] after:start-[3px] after:bg-copy-muted after:border-stroke-strong after:border after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-brand-cyan/20 peer-checked:border-brand-cyan/40 peer-checked:after:bg-brand-cyan" />
                  Video kích thước lớn
                </label>
              </div>

              {/* BẮT ĐẦU + Tua lại + Tốc độ */}
              <div className="flex items-center gap-3">
                {isPlaying ? (
                  <Button variant="glass" onClick={pauseVideo} size="sm" className="h-8">
                    <Pause className="size-3.5" /> TẠM DỪNG
                  </Button>
                ) : (
                  <Button variant="product" onClick={() => seekAndPlayCurrent()} size="sm" className="h-8">
                    <Play className="size-3.5" /> BẮT ĐẦU
                  </Button>
                )}

                {/* Dropdown chọn tốc độ */}
                <div className="relative">
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="h-8 text-xs font-mono rounded-control border-stroke-strong gap-1"
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
                              : "text-copy-muted hover:bg-surface-inner hover:text-foreground"
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
                    "h-8 text-xs font-mono rounded-control transition",
                    isLooping ? "border-brand-cyan/30 text-brand-cyan bg-brand-cyan/5" : "text-copy-muted"
                  )}
                >
                  Loop
                </Button>
              </div>
            </div>
          </div>

          {/* Vùng Làm Bài Shadowing */}
          <div className="rounded-panel border border-stroke bg-surface-panel p-5 lg:p-6 shadow-card mb-6 relative">
            
            {/* Header Luyện Tập (Tiến & Lùi câu) */}
            <div className="flex items-center justify-between border-b border-stroke-subtle pb-4 mb-5">
              <div className="flex items-center gap-1.5">
                <Button
                  variant="glass"
                  size="icon-sm"
                  onClick={handlePrevSentence}
                  disabled={currentSentenceIndex === 0}
                  className="rounded-control"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="font-mono text-xs text-copy-secondary px-2">
                  #{currentSentenceIndex + 1} / {transcripts.length}
                </span>
                <Button
                  variant="glass"
                  size="icon-sm"
                  onClick={handleNextSentence}
                  disabled={currentSentenceIndex === transcripts.length - 1}
                  className="rounded-control"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>

              {/* Hiển thị điểm số tốt nhất (Best Score) */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-copy-muted">Best Score:</span>
                <Badge
                  variant={
                    currentSentenceBestScore >= 80
                      ? "success"
                      : currentSentenceBestScore >= 60
                      ? "attention"
                      : "neutral"
                  }
                  className="font-mono font-semibold"
                >
                  {currentSentenceBestScore > 0 ? `${currentSentenceBestScore.toFixed(0)}` : "--"}
                </Badge>
              </div>
            </div>

            {/* Khối dịch từ vựng nhanh (Clickable sentence words) */}
            {activeTranscript && (
              <div className="flex flex-wrap gap-1.5 items-center justify-center p-3 rounded-control border border-stroke bg-canvas-deep/40 text-center mb-5">
                <span className="text-[10px] font-mono text-copy-muted block w-full uppercase mb-1">Click vào từ tiếng Anh bất kỳ để dịch nhanh bằng AI:</span>
                {activeTranscript.content.split(/\s+/).map((word, idx) => {
                  const cleanWord = word.replace(/^[.,\/#!$%\^&\*;:{}=\-_`~()?"'“]+/g, "").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'”]+$/g, "")
                  if (!cleanWord) return <span key={idx} className="text-copy-muted text-xs font-mono">{word}</span>
                  return (
                    <span
                      key={idx}
                      onClick={() => handleTranslateWord(cleanWord)}
                      className="text-xs hover:text-brand-cyan hover:underline cursor-pointer transition select-none font-mono text-copy-secondary"
                    >
                      {word}
                    </span>
                  )
                })}
              </div>
            )}

            {/* POPUP DỊCH NHANH BẰNG AI DEEPSEEK */}
            {(translateLoading || translationResult) && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="w-full max-w-sm rounded-panel border border-stroke bg-canvas-deep p-6 text-foreground shadow-modal mx-4 relative animate-scale-in">
                  <button
                    type="button"
                    onClick={() => {
                      setTranslationResult(null)
                      setTranslateLoading(false)
                    }}
                    className="absolute right-4 top-4 p-1.5 rounded-full border border-stroke-strong bg-surface-inner text-copy-muted hover:text-foreground transition"
                  >
                    <X className="size-4" />
                  </button>

                  <h3 className="text-xs font-semibold font-mono tracking-wide uppercase text-brand-cyan mb-4 flex items-center gap-2">
                    <Sparkles className="size-4 text-brand-cyan animate-pulse" /> Dịch thuật thông minh AI
                  </h3>

                  {translateLoading ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                      <div className="size-6 animate-spin rounded-full border-2 border-brand-cyan border-t-transparent" />
                      <span className="text-xs text-copy-muted font-mono animate-pulse">DeepSeek đang dịch từ...</span>
                    </div>
                  ) : (
                    translationResult && (
                      <div className="space-y-4">
                        <div className="bg-canvas-deep border border-stroke p-3 rounded-card text-center">
                          <h4 className="text-base font-bold text-foreground">{translationResult.phrase}</h4>
                          <p className="text-xs font-mono text-copy-muted mt-1">{translationResult.phonetic}</p>
                          <span className="inline-block text-[9px] font-mono text-brand-cyan bg-brand-cyan/15 px-2 py-0.5 rounded mt-2 uppercase">{translationResult.note}</span>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono text-copy-muted uppercase block mb-1">Nghĩa dịch</span>
                          <p className="text-xs font-semibold text-status-success">{translationResult.meaning}</p>
                        </div>

                        {translationResult.example_sentence && (
                          <div className="border-t border-stroke/40 pt-3">
                            <span className="text-[10px] font-mono text-copy-muted uppercase block mb-1">Ví dụ minh hoạ</span>
                            <p className="text-xs text-copy-secondary italic leading-relaxed">“{translationResult.example_sentence}”</p>
                            {translationResult.example_translation && (
                              <p className="text-xs text-copy-muted italic leading-relaxed mt-1">→ “{translationResult.example_translation}”</p>
                            )}
                          </div>
                        )}

                        <div className="border-t border-stroke/40 pt-4 flex items-center justify-end gap-2">
                          <Button
                            variant="glass"
                            size="sm"
                            type="button"
                            onClick={() => setTranslationResult(null)}
                            className="font-mono text-xs uppercase"
                          >
                            Đóng
                          </Button>
                          <Button
                            variant="product"
                            size="sm"
                            type="button"
                            onClick={handleSaveWord}
                            disabled={savingWord}
                            className="font-mono text-xs uppercase"
                          >
                            {savingWord ? "Đang lưu..." : "Lưu từ"}
                          </Button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Dòng chữ target hiển thị từ & phiên âm IPA tương ứng */}
            <div className="flex flex-wrap gap-x-5 gap-y-7 items-center justify-center p-6 rounded-control border border-stroke-subtle bg-canvas-deep/40 min-h-[140px] text-center">
              {alignedWords.map((item, idx) => {
                const hasScore = item.score !== null
                const scoreVal = item.score ?? 0

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedWordIndex(idx === selectedWordIndex ? null : idx)
                    }}
                    className={cn(
                      "flex flex-col items-center gap-2 cursor-pointer transition select-none group rounded-md p-1.5 hover:bg-surface-inner",
                      selectedWordIndex === idx && "bg-surface-inner ring-1 ring-brand-cyan/20"
                    )}
                  >
                    {/* Từ English */}
                    <span
                      className={cn(
                        "text-lg lg:text-xl font-medium border-b border-transparent transition duration-300",
                        hasScore
                          ? scoreVal >= 80
                            ? "text-status-success font-semibold border-status-success/30"
                            : scoreVal >= 60
                            ? "text-action-gold font-semibold border-action-gold/30"
                            : "text-destructive font-semibold border-destructive/30"
                          : "text-foreground"
                      )}
                    >
                      {item.word}
                    </span>

                    {/* Phiên âm IPA bên dưới */}
                    {item.ipa && (
                      <span className="font-mono text-xs text-copy-subtle">
                        {item.ipa}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Chi tiết phát âm từng từ khi Click */}
            {selectedWordIndex !== null && alignedWords[selectedWordIndex] && (
              <div className="mt-4 p-4 rounded-control border border-brand-cyan/20 bg-brand-cyan/5 text-xs text-copy-secondary animate-fade-in">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-mono text-[10px] text-brand-cyan font-bold tracking-widest uppercase mb-2">
                      ĐÁNH GIÁ TỪ: “{alignedWords[selectedWordIndex].word}”
                    </p>
                    <p>Accuracy Score: <span className="font-mono font-bold text-foreground">{alignedWords[selectedWordIndex].score?.toFixed(0)}/100</span></p>
                    <p>{alignedWords[selectedWordIndex].feedback}</p>
                    
                    {alignedWords[selectedWordIndex].weakPhonemes.length > 0 && (
                      <p className="text-destructive mt-1">
                        Âm vị phát âm sai:{" "}
                        <span className="font-bold font-mono">
                          {alignedWords[selectedWordIndex].weakPhonemes.map(p => `/${p.phoneme}/`).join(", ")}
                        </span>
                      </p>
                    )}

                    <div className="mt-3.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTranslateWord(alignedWords[selectedWordIndex].word)}
                        className="h-7 text-[10px] font-mono uppercase tracking-wider text-brand-cyan border-brand-cyan/20 bg-brand-cyan/5 hover:bg-brand-cyan/15 gap-1.5"
                      >
                        <Sparkles className="size-3" /> Tra từ AI DeepSeek
                      </Button>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedWordIndex(null)}
                    className="p-1 text-copy-subtle hover:text-foreground rounded-full"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Bảng điểm tổng quan sau khi chấm điểm */}
            {assessmentResult && (
              <div className="mt-5 p-4 rounded-control border border-stroke-strong bg-canvas-deep/60 grid grid-cols-2 gap-4 md:grid-cols-4 animate-scale-in">
                <div className="flex flex-col items-center justify-center p-2 rounded bg-surface-inner/30 border border-stroke-subtle">
                  <span className="text-[10px] font-mono text-copy-muted uppercase">Overall</span>
                  <span className="text-xl font-bold font-mono text-foreground mt-1">
                    {assessmentResult.overallScore.toFixed(0)}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded bg-surface-inner/30 border border-stroke-subtle">
                  <span className="text-[10px] font-mono text-copy-muted uppercase">Accuracy</span>
                  <span className="text-xl font-bold font-mono text-foreground mt-1">
                    {assessmentResult.scores.accuracy.toFixed(0)}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded bg-surface-inner/30 border border-stroke-subtle">
                  <span className="text-[10px] font-mono text-copy-muted uppercase">Fluency</span>
                  <span className="text-xl font-bold font-mono text-foreground mt-1">
                    {assessmentResult.scores.fluency.toFixed(0)}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded bg-surface-inner/30 border border-stroke-subtle">
                  <span className="text-[10px] font-mono text-copy-muted uppercase">Prosody</span>
                  <span className="text-xl font-bold font-mono text-foreground mt-1">
                    {assessmentResult.scores.prosody.toFixed(0)}
                  </span>
                </div>

                <div className="col-span-2 md:col-span-4 mt-2 border-t border-stroke-subtle pt-2">
                  <p className="text-xs text-copy-secondary italic leading-relaxed text-center">
                    “{assessmentResult.feedback}”
                  </p>
                </div>
              </div>
            )}

            {/* Vùng Action Ghi Âm */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
              <Button
                variant="glass"
                size="app"
                onClick={playUserRecording}
                disabled={!userAudioUrl || isRecording || userAudioPlaying}
                className={cn("flex-1", userAudioPlaying && "text-brand-cyan border-brand-cyan/40 bg-brand-cyan/5 animate-pulse")}
              >
                {userAudioPlaying ? (
                  <>
                    <Volume1 className="size-4 animate-bounce" /> ĐANG PHÁT LẠI...
                  </>
                ) : (
                  <>
                    <Volume2 className="size-4" /> PHÁT LẠI GHI ÂM
                  </>
                )}
              </Button>

              {isRecording ? (
                <Button
                  variant="default"
                  size="app"
                  onClick={stopRecording}
                  className="flex-1 bg-destructive border border-destructive/40 text-copy-primary animate-pulse"
                >
                  <MicOff className="size-4" /> DỪNG GHI ÂM
                </Button>
              ) : (
                <Button
                  variant="product"
                  size="app"
                  onClick={startRecording}
                  disabled={isAssessing}
                  className="flex-1"
                >
                  <Mic className="size-4" /> {isAssessing ? "ĐANG CHẤM ĐIỂM..." : "GHI ÂM"}
                </Button>
              )}
            </div>
          </div>

          {/* Vùng Bình Luận Mockup */}
          <div className="rounded-panel border border-stroke bg-surface-panel/40 p-4 shadow-card">
            <div className="flex items-center justify-between cursor-pointer text-copy-secondary hover:text-foreground transition">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <MessageSquare className="size-4 text-brand-cyan" />
                BÌNH LUẬN
                <Badge variant="neutral" className="text-[10px]">6912</Badge>
              </span>
              <ChevronDown className="size-4 text-copy-subtle" />
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (BẢN CHÉP): Chiếm 4 cột */}
        {showTranscript && (
          <div className="lg:col-span-4 flex flex-col border-l border-stroke-subtle bg-canvas-deep/80 p-5 lg:p-6 overflow-hidden">
            
            {/* Header Bản chép */}
            <div className="flex flex-col gap-4 border-b border-stroke-subtle pb-4 mb-4">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-xs font-bold tracking-widest text-brand-cyan uppercase">
                  BẢN CHÉP
                </h3>
                <Badge variant={completionPercentage === 100 ? "success" : "info"} className="font-mono">
                  {completionPercentage}%
                </Badge>
              </div>

              {/* Nút gạt IPA và Trans */}
              <div className="flex items-center gap-4 border-t border-stroke-subtle pt-3">
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-mono text-copy-muted">
                  <input
                    type="checkbox"
                    checked={showIpa}
                    onChange={(e) => setShowIpa(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-7 h-3.5 bg-surface-inner border border-stroke-strong peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface-panel after:content-[''] after:absolute after:top-[2px] after:start-[3px] after:bg-copy-subtle after:border after:border-stroke-strong after:rounded-full after:h-2 after:w-2 after:transition-all peer-checked:bg-brand-cyan/20 peer-checked:border-brand-cyan/40 peer-checked:after:bg-brand-cyan" />
                  IPA
                </label>

                <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-mono text-copy-muted">
                  <input
                    type="checkbox"
                    checked={showTrans}
                    onChange={(e) => setShowTrans(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-7 h-3.5 bg-surface-inner border border-stroke-strong peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface-panel after:content-[''] after:absolute after:top-[2px] after:start-[3px] after:bg-copy-subtle after:border after:border-stroke-strong after:rounded-full after:h-2 after:w-2 after:transition-all peer-checked:bg-brand-cyan/20 peer-checked:border-brand-cyan/40 peer-checked:after:bg-brand-cyan" />
                  Trans
                </label>
              </div>
            </div>

            {/* Danh sách các câu thoại trong Bản chép */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {transcripts.map((t, idx) => {
                const isActive = idx === currentSentenceIndex
                const sentenceBestScore = bestScores.get(t.id) || 0
                const isCompleted = completedIds.has(t.id)

                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setCurrentSentenceIndex(idx)
                      setAssessmentResult(null)
                      setSelectedWordIndex(null)
                      setRecordedBlob(null)
                      setUserAudioUrl(null)
                      setTimeout(() => {
                        seekAndPlayCurrent()
                      }, 200)
                    }}
                    className={cn(
                      "group p-4 rounded-card border cursor-pointer transition-all duration-300 relative overflow-hidden",
                      isActive
                        ? "border-brand-cyan bg-brand-cyan/5 shadow-[0_0_15px_var(--engflex-cyan-tint)]"
                        : isCompleted
                        ? "border-status-success/20 bg-status-success/5 hover:border-status-success/40"
                        : "border-stroke bg-surface-panel hover:border-stroke-strong hover:bg-surface-glass"
                    )}
                  >
                    {/* Header card câu thoại */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[9px] font-bold text-copy-muted">
                        #{t.sequence + 1}
                      </span>
                      {sentenceBestScore > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-copy-secondary font-bold">
                            Score: {sentenceBestScore.toFixed(0)}
                          </span>
                          {isCompleted && (
                            <CheckCircle2 className="size-3 text-status-success" />
                          )}
                        </div>
                      ) : null}
                    </div>

                    {/* Câu tiếng Anh gốc */}
                    <p className="text-xs leading-5 break-words font-medium">
                      {t.content}
                    </p>

                    {/* Phiên âm IPA toàn câu (nếu bật showIpa) */}
                    {showIpa && t.phonetic && (
                      <p className="mt-1.5 font-mono text-[10px] text-copy-subtle break-words">
                        {t.phonetic}
                      </p>
                    )}

                    {/* Bản dịch nghĩa tiếng Việt (nếu bật showTrans) */}
                    {showTrans && t.vietnamese && (
                      <p className="mt-2 text-[10px] text-copy-muted italic border-t border-stroke-subtle pt-2">
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

      {/* Modal phím tắt học tập */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-panel border border-stroke bg-canvas-deep p-6 text-foreground shadow-modal mx-4 relative animate-scale-in">
            <button
              onClick={() => setShowShortcutsModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full border border-stroke-strong bg-surface-inner text-copy-muted hover:text-foreground transition"
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
              <div className="flex items-center justify-between">
                <span className="text-sm text-copy-secondary">Đi tiếp sang câu tiếp theo</span>
                <kbd className="px-2 py-1 rounded bg-surface-inner border border-stroke-strong font-mono text-xs text-brand-cyan">
                  Ctrl + Enter
                </kbd>
              </div>
            </div>
            <p className="mt-6 text-xs text-copy-subtle text-center">
              Nhại giọng phát âm giúp bạn rèn nhịp điệu và ngữ điệu tự nhiên như người bản xứ!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
