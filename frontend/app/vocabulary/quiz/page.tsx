"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Volume2,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCw,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Brain,
  HelpCircle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { getVocabularyQuiz, QuizQuestionType } from "@/services/vocabulary.service"

export default function VocabularyQuizPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Quản lý trạng thái game
  const [quizState, setQuizState] = useState<"loading" | "intro" | "playing" | "finished">("loading")
  const [questions, setQuestions] = useState<QuizQuestionType[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Trạng thái câu hiện tại
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [timer, setTimer] = useState(10)
  const [score, setScore] = useState(0)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Theo dõi đăng nhập
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user)
      } else {
        router.push("/login")
      }
    })
    return () => unsubscribe()
  }, [])

  // Tải bộ câu hỏi từ API
  const loadQuiz = async () => {
    try {
      setQuizState("loading")
      const res = await getVocabularyQuiz()
      if (res.data && res.data.length > 0) {
        setQuestions(res.data)
        setQuizState("intro")
        setCurrentIndex(0)
        setScore(0)
      } else {
        // Dự phòng trống
        setQuizState("finished")
      }
    } catch (err) {
      console.error("Lỗi tải câu hỏi trắc nghiệm:", err)
      setQuizState("finished")
    }
  }

  useEffect(() => {
    if (currentUser) {
      void loadQuiz()
    }
  }, [currentUser])

  // Phát âm từ vựng (TTS)
  const speakWord = (phrase: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(phrase)
      utterance.lang = "en-US"
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }

  // Tự động đọc từ khi chuyển câu hỏi
  useEffect(() => {
    if (quizState === "playing" && questions[currentIndex]) {
      speakWord(questions[currentIndex].phrase)
    }
  }, [quizState, currentIndex])

  // Khởi động đồng hồ đếm ngược 10 giây
  useEffect(() => {
    if (quizState !== "playing" || isAnswered) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    setTimer(10)

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          // Hết giờ -> Tự động đánh dấu là sai
          if (timerRef.current) clearInterval(timerRef.current)
          handleTimeOut()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [quizState, currentIndex, isAnswered])

  // Xử lý khi hết giờ làm bài
  const handleTimeOut = () => {
    setIsAnswered(true)
    setSelectedAnswer("") // rỗng nghĩa là không chọn gì (hết giờ)
  }

  // Bắt đầu chơi game
  const startGame = () => {
    setQuizState("playing")
    setIsAnswered(false)
    setSelectedAnswer(null)
  }

  // Chọn đáp án
  const handleSelectAnswer = (choice: string) => {
    if (isAnswered) return // đã trả lời thì khoá nút

    setIsAnswered(true)
    setSelectedAnswer(choice)

    const correct = questions[currentIndex].meaning
    if (choice === correct) {
      setScore((prev) => prev + 1)
    }
  }

  // Tiến hành sang câu tiếp theo
  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1)
      setIsAnswered(false)
      setSelectedAnswer(null)
    } else {
      setQuizState("finished")
    }
  }

  const currentQuestion = questions[currentIndex]

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-canvas p-6 text-white overflow-y-auto flex items-center justify-center">
      
      {/* KHUNG GAMEPLAY CHÍNH */}
      <div className="w-full max-w-xl rounded-panel border border-stroke bg-surface-panel p-8 shadow-modal relative overflow-hidden">
        
        {/* Nút thoát */}
        <div className="absolute top-4 left-4">
          <Link
            href="/vocabulary"
            className="text-xs font-mono text-copy-muted hover:text-brand-cyan flex items-center gap-1 transition"
          >
            <ChevronLeft className="size-4" /> Thoát Luyện tập
          </Link>
        </div>

        {/* TRẠNG THÁI 1: LOADING */}
        {quizState === "loading" && (
          <div className="flex h-60 flex-col items-center justify-center gap-4 py-8">
            <div className="size-8 animate-spin rounded-full border-4 border-brand-cyan border-t-transparent" />
            <p className="font-mono text-xs text-brand-cyan uppercase tracking-widest animate-pulse">
              Đang chuẩn bị phòng thi...
            </p>
          </div>
        )}

        {/* TRẠNG THÁI 2: INTRO (MÀN HÌNH BẮT ĐẦU) */}
        {quizState === "intro" && (
          <div className="text-center py-8 space-y-6">
            <div className="size-20 bg-brand-cyan/10 border border-brand-cyan/20 rounded-full flex items-center justify-center mx-auto text-brand-cyan shadow-[0_0_20px_rgba(110,231,242,0.15)] animate-bounce">
              <Brain className="size-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold">Luyện phản xạ Trắc nghiệm</h2>
              <p className="text-xs text-copy-muted max-w-sm mx-auto">
                Ôn tập nhanh {questions.length} từ vựng từ bộ từ cá nhân của bạn. 
                Bạn có 10 giây để chọn nghĩa tiếng Việt chính xác cho mỗi từ!
              </p>
            </div>

            <div className="border-t border-stroke/40 pt-6 flex justify-center">
              <Button
                variant="product"
                onClick={startGame}
                className="font-mono text-xs uppercase px-8 py-5 gap-2"
              >
                Bắt đầu ngay <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* TRẠNG THÁI 3: PLAYING (ĐANG CHƠI) */}
        {quizState === "playing" && currentQuestion && (
          <div className="space-y-6 pt-6">
            
            {/* Header thanh tiến trình câu hỏi */}
            <div className="flex items-center justify-between text-xs font-mono text-copy-muted">
              <span>CÂU HỎI {currentIndex + 1} / {questions.length}</span>
              <span className="text-emerald-400">Đúng: {score} câu</span>
            </div>

            {/* Thanh Progress bar */}
            <div className="w-full h-1.5 bg-canvas-deep rounded-full overflow-hidden">
              <div
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                className="h-full bg-brand-cyan transition-all duration-300"
              />
            </div>

            {/* Vòng tròn đếm ngược thời gian (SVG circular timer) */}
            <div className="flex items-center justify-center py-2">
              <div className="relative size-16 flex items-center justify-center">
                <svg className="size-full rotate-[-90deg]">
                  <circle cx="32" cy="32" r="28" className="stroke-stroke/20 fill-none" strokeWidth="3" />
                  <circle
                    cx="32" cy="32" r="28"
                    className="stroke-brand-cyan fill-none transition-all duration-1000"
                    strokeWidth="3"
                    strokeDasharray={175}
                    strokeDashoffset={175 - (timer / 10) * 175}
                  />
                </svg>
                <span className="absolute text-xs font-mono font-bold text-brand-cyan">{timer}s</span>
              </div>
            </div>

            {/* Từ vựng cần đoán (Phần chính) */}
            <div className="text-center bg-canvas-deep rounded-card border border-stroke p-6 space-y-3 relative group">
              <span className="text-[10px] font-mono text-copy-muted uppercase tracking-wider block">Chọn nghĩa đúng của từ</span>
              <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                {currentQuestion.phrase}
                <button
                  onClick={() => speakWord(currentQuestion.phrase)}
                  className="p-1.5 rounded-full bg-surface-inner text-copy-subtle hover:text-white hover:bg-stroke transition shrink-0"
                  title="Nghe phát âm"
                >
                  <Volume2 className="size-4" />
                </button>
              </h3>
              <span className="text-[10px] font-mono text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded italic">
                {currentQuestion.note}
              </span>
            </div>

            {/* 4 Lựa chọn câu hỏi (Choices) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion.choices.map((choice) => {
                const isCorrectChoice = choice === currentQuestion.meaning
                const isSelected = choice === selectedAnswer
                
                // Trực quan màu sắc nút bấm sau khi đã trả lời
                let btnStyle = "bg-surface-inner border-stroke hover:bg-stroke hover:border-stroke-strong"
                let icon = null

                if (isAnswered) {
                  if (isCorrectChoice) {
                    btnStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold"
                    icon = <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  } else if (isSelected) {
                    btnStyle = "bg-destructive/10 border-destructive text-destructive font-bold"
                    icon = <XCircle className="size-4 text-destructive shrink-0" />
                  } else {
                    btnStyle = "bg-surface-inner border-stroke opacity-40"
                  }
                }

                return (
                  <button
                    key={choice}
                    disabled={isAnswered}
                    onClick={() => handleSelectAnswer(choice)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-control border text-left text-xs transition duration-200 gap-3",
                      btnStyle
                    )}
                  >
                    <span>{choice}</span>
                    {icon}
                  </button>
                )
              })}
            </div>

            {/* Nút điều hướng tiếp theo */}
            {isAnswered && (
              <div className="border-t border-stroke/40 pt-5 flex justify-end animate-fade-in">
                <Button
                  variant="product"
                  onClick={handleNext}
                  className="font-mono text-xs uppercase px-6 py-4 gap-1"
                >
                  {currentIndex + 1 < questions.length ? "Câu tiếp theo" : "Xem kết quả"}{" "}
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            )}

          </div>
        )}

        {/* TRẠNG THÁI 4: FINISHED (MÀN HÌNH KẾT QUẢ) */}
        {quizState === "finished" && (
          <div className="text-center py-6 space-y-6">
            <div className="size-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <CheckCircle2 className="size-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold">Luyện tập hoàn thành!</h2>
              <p className="text-xs text-copy-muted">
                {questions.length > 0 
                  ? `Bạn đã hoàn thành bài kiểm tra với số điểm tuyệt vời.`
                  : `Bạn chưa lưu từ vựng nào để tạo câu hỏi trắc nghiệm.`
                }
              </p>
            </div>

            {questions.length > 0 && (
              <div className="max-w-xs mx-auto rounded-card border border-stroke bg-canvas-deep p-4 grid grid-cols-2 gap-4 divide-x divide-stroke">
                <div>
                  <span className="text-[10px] font-mono text-copy-muted block uppercase">Đúng</span>
                  <span className="text-xl font-bold font-mono mt-1 block text-emerald-400">
                    {score}/{questions.length}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-copy-muted block uppercase">XP tích luỹ</span>
                  <span className="text-xl font-bold font-mono mt-1 block text-yellow-400 flex items-center justify-center gap-1">
                    +{score * 10} XP <Sparkles className="size-4 text-yellow-400" />
                  </span>
                </div>
              </div>
            )}

            <div className="border-t border-stroke/40 pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              {questions.length > 0 && (
                <Button
                  variant="product"
                  onClick={loadQuiz}
                  className="w-full sm:w-auto font-mono text-xs uppercase px-6 gap-1"
                >
                  <RotateCw className="size-3.5" /> Luyện tập lại
                </Button>
              )}
              <Link href="/vocabulary" className="w-full sm:w-auto">
                <Button
                  variant="glass"
                  className="w-full font-mono text-xs uppercase px-6"
                >
                  Quay lại bộ từ
                </Button>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
