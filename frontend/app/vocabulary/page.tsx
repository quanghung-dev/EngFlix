"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  Plus,
  Trash2,
  Edit,
  GraduationCap,
  Play,
  Volume2,
  X,
  Search,
  CheckCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Info,
  FolderOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  BookOpenText,
  User,
  Tags,
  AlertTriangle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  getVocabularyCategories,
  getVocabularyDecks,
  getMyVocabularyDecks,
  createVocabularyDeck,
  deleteVocabularyDeck,
  getVocabularyItems,
  addVocabularyItem,
  deleteVocabularyItem,
  updateVocabularyItem
} from "@/services/vocabulary.service"
import {
  VocabularyCategoryType,
  VocabularyDeckType,
  VocabularyItemType
} from "@/types/vocabulary"

export default function VocabularyPage() {
  const router = useRouter()

  // State Tabs chính
  const [activeTab, setActiveTab] = useState<"library" | "mine">("library")

  // State dữ liệu bộ từ
  const [categories, setCategories] = useState<VocabularyCategoryType[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [decks, setDecks] = useState<VocabularyDeckType[]>([])
  const [myDecks, setMyDecks] = useState<VocabularyDeckType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State tìm kiếm & bộ lọc
  const [searchQuery, setSearchQuery] = useState("")

  // State Modal Tạo bộ từ mới
  const [showCreateDeckModal, setShowCreateDeckModal] = useState(false)
  const [newDeckName, setNewDeckName] = useState("")
  const [newDeckDesc, setNewDeckDesc] = useState("")
  const [newDeckLevel, setNewDeckLevel] = useState("B1")
  const [newDeckCategory, setNewDeckCategory] = useState<number | undefined>(undefined)
  const [creatingDeck, setCreatingDeck] = useState(false)

  // State xem chi tiết bộ từ
  const [activeDeck, setActiveDeck] = useState<VocabularyDeckType | null>(null)
  const [deckItems, setDeckItems] = useState<VocabularyItemType[]>([])
  const [loadingItems, setLoadingItems] = useState(false)

  // State Modal Thêm từ mới vào bộ từ cá nhân
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [newPhrase, setNewPhrase] = useState("")
  const [newMeaning, setNewMeaning] = useState("")
  const [newExample, setNewExample] = useState("")
  const [newNote, setNewNote] = useState("")
  const [addingItem, setAddingItem] = useState(false)

  // State Chế độ học Flashcard
  const [studyMode, setStudyMode] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [masteredCount, setMasteredCount] = useState(0)
  const [studyCompleted, setStudyCompleted] = useState(false)

  // Tải danh mục và các bộ từ vựng mặc định
  useEffect(() => {
    let isActive = true

    async function loadInitialData() {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (!token) {
        if (isActive) {
          router.push("/login")
        }
        return
      }

      try {
        setLoading(true)
        setError(null)

        const [categoriesRes, decksRes] = await Promise.all([
          getVocabularyCategories(),
          getVocabularyDecks()
        ])

        if (!isActive) return

        setCategories(categoriesRes.data || [])
        setDecks(decksRes.data || [])

        // Tải các bộ từ cá nhân nếu đã đăng nhập
        try {
          const myDecksRes = await getMyVocabularyDecks()
          if (isActive) {
            setMyDecks(myDecksRes.data || [])
          }
        } catch (myDeckErr) {
          console.error("Lỗi tải bộ từ cá nhân:", myDeckErr)
        }

        setLoading(false)
      } catch (err: any) {
        console.error("Lỗi tải dữ liệu từ vựng:", err)
        if (isActive) {
          setError("Không thể tải kho từ vựng. Vui lòng tải lại trang.")
          setLoading(false)
        }
      }
    }

    void loadInitialData()
    return () => {
      isActive = false
    }
  }, [])

  // Mỗi khi đổi category, tải lại danh sách bộ từ hệ thống tương ứng
  useEffect(() => {
    let isActive = true
    async function filterDecks() {
      if (loading) return // tránh reload khi đang tải lần đầu
      try {
        const decksRes = await getVocabularyDecks({
          category_id: selectedCategory || undefined
        })
        if (isActive) {
          setDecks(decksRes.data || [])
        }
      } catch (err) {
        console.error("Lỗi lọc bộ từ:", err)
      }
    }
    void filterDecks()
    return () => {
      isActive = false
    }
  }, [selectedCategory])

  // Lọc bộ từ theo tìm kiếm (Client-side)
  const filteredDecks = useMemo(() => {
    const list = activeTab === "library" ? decks : myDecks
    if (!searchQuery) return list
    return list.filter((deck) =>
      deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (deck.description && deck.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [activeTab, decks, myDecks, searchQuery])

  // Xem chi tiết một bộ từ vựng
  const handleOpenDeck = async (deck: VocabularyDeckType) => {
    setActiveDeck(deck)
    setLoadingItems(true)
    setDeckItems([])
    setStudyMode(false)
    setStudyCompleted(false)
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setMasteredCount(0)

    try {
      const itemsRes = await getVocabularyItems(deck.id)
      setDeckItems(itemsRes.data || [])
    } catch (err) {
      console.error("Lỗi tải chi tiết từ vựng:", err)
    } finally {
      setLoadingItems(false)
    }
  }

  // Phát âm tiếng Anh (sử dụng Web Speech Synthesis API)
  const speakPhrase = (phrase: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel() // hủy phát âm cũ
      const utterance = new SpeechSynthesisUtterance(phrase)
      utterance.lang = "en-US"
      window.speechSynthesis.speak(utterance)
    }
  }

  // Tạo mới một bộ từ vựng cá nhân
  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDeckName.trim()) return

    setCreatingDeck(true)
    try {
      const res = await createVocabularyDeck({
        name: newDeckName,
        description: newDeckDesc || undefined,
        category_id: newDeckCategory,
        level: newDeckLevel
      })

      if (res.data) {
        setMyDecks((prev) => [res.data, ...prev])
        setShowCreateDeckModal(false)
        setNewDeckName("")
        setNewDeckDesc("")
        setNewDeckLevel("B1")
        setNewDeckCategory(undefined)
      }
    } catch (err) {
      console.error("Lỗi tạo bộ từ:", err)
      alert("Đã xảy ra lỗi khi tạo bộ từ mới.")
    } finally {
      setCreatingDeck(false)
    }
  }

  // Xóa bộ từ vựng cá nhân
  const handleDeleteDeck = async (deckId: number, e: React.MouseEvent) => {
    e.stopPropagation() // ngăn cản việc mở chi tiết bộ từ
    if (!confirm("Bạn có chắc chắn muốn xóa bộ từ vựng này không?")) return

    try {
      await deleteVocabularyDeck(deckId)
      setMyDecks((prev) => prev.filter((d) => d.id !== deckId))
      if (activeDeck?.id === deckId) {
        setActiveDeck(null)
      }
    } catch (err) {
      console.error("Lỗi xóa bộ từ:", err)
      alert("Không thể xóa bộ từ vựng này.")
    }
  }

  // Thêm từ vựng mới vào bộ từ vựng cá nhân hiện tại
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeDeck || !newPhrase.trim() || !newMeaning.trim()) return

    setAddingItem(true)
    try {
      // Chuẩn hóa phrase viết thường làm normalized_phrase
      const normalized = newPhrase.trim().toLowerCase()
      const res = await addVocabularyItem(activeDeck.id, {
        phrase: newPhrase.trim(),
        normalized_phrase: normalized,
        meaning: newMeaning.trim(),
        example_sentence: newExample.trim() || undefined,
        note: newNote.trim() || undefined
      })

      if (res.data) {
        setDeckItems((prev) => [...prev, res.data])
        setShowAddItemModal(false)
        setNewPhrase("")
        setNewMeaning("")
        setNewExample("")
        setNewNote("")
      }
    } catch (err) {
      console.error("Lỗi thêm từ vựng:", err)
      alert("Đã xảy ra lỗi khi thêm từ mới.")
    } finally {
      setAddingItem(false)
    }
  }

  // Xóa từ vựng khỏi bộ từ cá nhân
  const handleDeleteItem = async (itemId: number) => {
    if (!activeDeck) return
    if (!confirm("Bạn có muốn xóa từ vựng này khỏi bộ từ không?")) return

    try {
      await deleteVocabularyItem(activeDeck.id, itemId)
      setDeckItems((prev) => prev.filter((item) => item.id !== itemId))
    } catch (err) {
      console.error("Lỗi xóa từ vựng:", err)
      alert("Không thể xóa từ vựng này.")
    }
  }

  // Chế độ học Flashcard: Lựa chọn Đã thuộc / Chưa thuộc
  const handleCardFeedback = (mastered: boolean) => {
    if (mastered) {
      setMasteredCount((prev) => prev + 1)
    }

    setIsFlipped(false)

    // Đợi hiệu ứng lật mặt trước hoàn tất rồi chuyển slide
    setTimeout(() => {
      if (currentCardIndex < deckItems.length - 1) {
        setCurrentCardIndex((prev) => prev + 1)
      } else {
        setStudyCompleted(true)
      }
    }, 200)
  }

  // Khởi động lại vòng học Flashcard
  const handleRestartStudy = () => {
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setMasteredCount(0)
    setStudyCompleted(false)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-canvas p-6 text-white overflow-y-auto">
      
      {/* 1. Tiêu đề Dashboard */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-stroke pb-6 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <BookOpenText className="size-6 text-brand-cyan" />
            Kho từ vựng cá nhân
          </h1>
          <p className="text-sm text-copy-muted mt-1 leading-relaxed">
            Quản lý các bộ từ vựng cá nhân, ôn tập từ mới và ghi nhớ hiệu quả bằng công cụ Flashcards 3D.
          </p>
        </div>

        <Button
          variant="product"
          size="sm"
          onClick={() => setShowCreateDeckModal(true)}
          className="font-mono text-xs uppercase gap-1.5 self-start md:self-auto"
        >
          <Plus className="size-4" /> Tạo bộ từ mới
        </Button>
      </div>

      {/* 2. Menu Điều hướng & Tìm kiếm */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        {/* Switch Tabs */}
        <div className="flex bg-surface-panel p-1 rounded-control border border-stroke max-w-fit">
          <button
            onClick={() => {
              setActiveTab("library")
              setActiveDeck(null)
            }}
            className={cn(
              "px-4 py-2 text-xs font-mono tracking-wider uppercase rounded-control transition",
              activeTab === "library"
                ? "bg-brand-cyan/10 text-brand-cyan font-bold"
                : "text-copy-muted hover:text-white"
            )}
          >
            Thư viện hệ thống
          </button>
          <button
            onClick={() => {
              setActiveTab("mine")
              setActiveDeck(null)
            }}
            className={cn(
              "px-4 py-2 text-xs font-mono tracking-wider uppercase rounded-control transition",
              activeTab === "mine"
                ? "bg-brand-cyan/10 text-brand-cyan font-bold"
                : "text-copy-muted hover:text-white"
            )}
          >
            Bộ từ của tôi
          </button>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 size-4 text-copy-subtle" />
          <Input
            placeholder="Tìm kiếm bộ từ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-control bg-surface-panel border-stroke"
          />
        </div>
      </div>

      {/* 3. Phân loại danh mục (Category Chips) - Chỉ hiển thị ở Tab Thư viện */}
      {activeTab === "library" && categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 pb-2 overflow-x-auto">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "px-3 py-1.5 text-xs rounded-full border transition font-medium",
              selectedCategory === null
                ? "bg-brand-cyan/10 border-brand-cyan text-brand-cyan"
                : "border-stroke bg-surface-panel/40 text-copy-secondary hover:text-white"
            )}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-full border transition font-medium",
                selectedCategory === cat.id
                  ? "bg-brand-cyan/10 border-brand-cyan text-brand-cyan"
                  : "border-stroke bg-surface-panel/40 text-copy-secondary hover:text-white"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* 4. Hiển thị Lỗi hoặc Loading */}
      {loading ? (
        <div className="flex h-60 flex-col items-center justify-center gap-4 text-copy-secondary">
          <div className="size-8 animate-spin rounded-full border-4 border-brand-cyan border-t-transparent" />
          <p className="font-mono text-xs text-brand-cyan uppercase tracking-widest animate-pulse">
            Đang tải kho từ vựng...
          </p>
        </div>
      ) : error ? (
        <div className="flex h-60 flex-col items-center justify-center text-center gap-4 max-w-md mx-auto">
          <AlertTriangle className="size-12 text-destructive" />
          <h3 className="font-semibold text-lg">Đã có lỗi xảy ra</h3>
          <p className="text-xs text-copy-muted leading-relaxed">{error}</p>
        </div>
      ) : (
        /* 5. Giao diện Grid các bộ từ (Decks Grid) */
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredDecks.length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center gap-4">
              <FolderOpen className="size-16 text-copy-subtle/40" />
              <h3 className="text-base font-semibold text-copy-secondary">Không tìm thấy bộ từ vựng nào</h3>
              <p className="text-xs text-copy-muted max-w-sm">
                {activeTab === "library"
                  ? "Không có bộ từ hệ thống nào phù hợp với danh mục hoặc bộ lọc hiện tại."
                  : "Bạn chưa tạo bộ từ cá nhân nào. Hãy bấm nút 'Tạo bộ từ mới' ở góc phải để bắt đầu."}
              </p>
            </div>
          ) : (
            filteredDecks.map((deck) => (
              <div
                key={deck.id}
                onClick={() => handleOpenDeck(deck)}
                className="group relative flex flex-col rounded-panel border border-stroke bg-surface-panel p-5 cursor-pointer shadow-card transition-all duration-300 hover:border-brand-cyan/40 hover:bg-surface-glass hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
              >
                {/* Level badge */}
                {deck.level && (
                  <Badge variant="info" className="absolute right-4 top-4 font-mono text-[9px] uppercase">
                    {deck.level}
                  </Badge>
                )}

                {/* Deck icon */}
                <div className="mb-4 flex size-11 items-center justify-center rounded-nav border border-brand-cyan/20 bg-brand-cyan/10 text-brand-cyan">
                  <BookOpen className="size-5" />
                </div>

                <h3 className="font-semibold text-sm text-white group-hover:text-brand-cyan transition duration-300">
                  {deck.name}
                </h3>
                <p className="text-xs text-copy-muted mt-2 line-clamp-2 leading-relaxed">
                  {deck.description || "Không có mô tả chi tiết."}
                </p>

                {/* Meta thông tin chân card */}
                <div className="mt-auto pt-4 border-t border-stroke-subtle flex items-center justify-between text-[11px] text-copy-muted font-mono">
                  <span>SYSTEM</span>
                  {!deck.is_default && (
                    <button
                      onClick={(e) => handleDeleteDeck(deck.id, e)}
                      className="p-1 rounded text-copy-subtle hover:text-destructive hover:bg-destructive/10 transition"
                      title="Xóa bộ từ"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 6. VÙNG CHI TIẾT BỘ TỪ (DECK EXPANDED VIEW) */}
      {activeDeck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-4xl h-[85vh] rounded-panel border border-stroke bg-canvas-deep p-6 text-white shadow-modal flex flex-col relative animate-scale-in">
            
            {/* Nút đóng modal */}
            <button
              onClick={() => setActiveDeck(null)}
              className="absolute right-4 top-4 p-1.5 rounded-full border border-stroke-strong bg-surface-inner text-copy-subtle hover:text-white transition"
            >
              <X className="size-4" />
            </button>

            {/* A. GIAO DIỆN HỌC FLASHCARD (Nếu bật StudyMode) */}
            {studyMode ? (
              <div className="flex-1 flex flex-col justify-between">
                
                {/* Header Flashcard */}
                <div className="flex items-center justify-between border-b border-stroke pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="size-5 text-brand-cyan" />
                    <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-cyan">
                      Luyện tập Flashcard: {activeDeck.name}
                    </h3>
                  </div>
                  <span className="font-mono text-xs text-copy-secondary">
                    {currentCardIndex + 1} / {deckItems.length}
                  </span>
                </div>

                {/* Kết quả hoàn thành ôn tập */}
                {studyCompleted ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 animate-scale-in">
                    <div className="size-16 rounded-full bg-status-success/10 border border-status-success flex items-center justify-center text-status-success">
                      <Check className="size-8" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Hoàn thành buổi học!</h2>
                      <p className="text-sm text-copy-muted mt-2">
                        Bạn đã ghi nhớ được <span className="font-bold text-brand-cyan">{masteredCount}</span> trên tổng số <span className="font-bold text-white">{deckItems.length}</span> từ.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button variant="glass" onClick={handleRestartStudy} className="font-mono text-xs uppercase gap-1.5">
                        <RotateCcw className="size-4" /> Luyện tập lại
                      </Button>
                      <Button variant="product" onClick={() => setStudyMode(false)} className="font-mono text-xs uppercase">
                        Quay lại danh sách
                      </Button>
                    </div>
                  </div>
                ) : deckItems.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
                    <HelpCircle className="size-12 text-copy-subtle" />
                    <h3 className="font-semibold text-sm">Không có thẻ từ để luyện tập</h3>
                    <p className="text-xs text-copy-muted">Hãy thêm từ vựng vào bộ trước khi bắt đầu ôn luyện.</p>
                  </div>
                ) : (
                  /* Thẻ 3D lật mặt */
                  <div className="flex-1 flex flex-col items-center justify-center py-4">
                    <div
                      onClick={() => setIsFlipped(!isFlipped)}
                      className={cn(
                        "relative w-full max-w-md h-64 cursor-pointer select-none transition-all duration-500 [transform-style:preserve-3d]",
                        isFlipped && "[transform:rotateY(180deg)]"
                      )}
                    >
                      {/* MẶT TRƯỚC (Front: Word + IPA) */}
                      <div className="absolute inset-0 size-full rounded-panel border border-stroke bg-surface-panel p-6 flex flex-col items-center justify-center text-center shadow-card [backface-visibility:hidden]">
                        {activeDeck.level && (
                          <Badge variant="info" className="absolute top-4 right-4 font-mono text-[9px] uppercase">
                            {activeDeck.level}
                          </Badge>
                        )}
                        <h2 className="text-2xl font-bold text-white tracking-wide">
                          {deckItems[currentCardIndex].phrase}
                        </h2>
                        {deckItems[currentCardIndex].note && (
                          <span className="font-mono text-xs text-copy-subtle mt-2">
                            {deckItems[currentCardIndex].note}
                          </span>
                        )}

                        {/* Nút bấm nghe âm thanh */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation() // không kích hoạt lật thẻ
                            speakPhrase(deckItems[currentCardIndex].phrase)
                          }}
                          className="mt-6 p-3 rounded-full border border-stroke bg-surface-inner text-copy-secondary hover:text-brand-cyan hover:border-brand-cyan transition duration-300 shadow-sm"
                          title="Nghe phát âm"
                        >
                          <Volume2 className="size-5 animate-pulse" />
                        </button>

                        <span className="text-[10px] text-copy-muted font-mono uppercase tracking-widest absolute bottom-4">
                          Click để lật xem nghĩa
                        </span>
                      </div>

                      {/* MẶT SAU (Back: Meaning + Example) */}
                      <div className="absolute inset-0 size-full rounded-panel border border-brand-cyan/20 bg-canvas-deep p-6 flex flex-col items-center justify-center text-center shadow-card [backface-visibility:hidden] [transform:rotateY(180deg)]">
                        <span className="text-[10px] font-mono text-brand-cyan uppercase tracking-widest mb-2 font-bold">
                          ĐỊNH NGHĨA & NGHĨA
                        </span>
                        
                        <p className="text-xl font-bold text-white px-4 leading-normal">
                          {deckItems[currentCardIndex].meaning}
                        </p>

                        {deckItems[currentCardIndex].example_sentence && (
                          <div className="mt-4 border-t border-stroke-subtle pt-3 max-w-xs">
                            <p className="text-xs text-copy-secondary italic leading-relaxed">
                              “{deckItems[currentCardIndex].example_sentence}”
                            </p>
                          </div>
                        )}

                        <span className="text-[10px] text-copy-muted font-mono uppercase tracking-widest absolute bottom-4">
                          Click để lật lại mặt trước
                        </span>
                      </div>
                    </div>

                    {/* Vùng lựa chọn kết quả */}
                    <div className="mt-8 flex items-center justify-center gap-4 w-full max-w-xs">
                      <Button
                        variant="glass"
                        onClick={() => handleCardFeedback(false)}
                        className="flex-1 font-mono text-xs uppercase text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                      >
                        Chưa thuộc
                      </Button>
                      <Button
                        variant="product"
                        onClick={() => handleCardFeedback(true)}
                        className="flex-1 font-mono text-xs uppercase"
                      >
                        Đã thuộc
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* B. GIAO DIỆN XEM DANH SÁCH TỪ CHỈ TIẾT */
              <div className="flex flex-col h-full overflow-hidden">
                {/* Header chi tiết */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-stroke pb-4 mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <BookOpen className="size-5 text-brand-cyan" />
                      {activeDeck.name}
                    </h2>
                    <p className="text-xs text-copy-muted mt-1">
                      {activeDeck.description || "Không có mô tả chi tiết."}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => setStudyMode(true)}
                      disabled={deckItems.length === 0}
                      className="font-mono text-xs uppercase gap-1.5"
                    >
                      <Play className="size-3.5" /> Luyện tập Flashcard
                    </Button>

                    {!activeDeck.is_default && (
                      <Button
                        variant="product"
                        size="sm"
                        onClick={() => setShowAddItemModal(true)}
                        className="font-mono text-xs uppercase gap-1.5"
                      >
                        <Plus className="size-3.5" /> Thêm từ mới
                      </Button>
                    )}
                  </div>
                </div>

                {/* Danh sách từ vựng */}
                {loadingItems ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 text-copy-secondary">
                    <div className="size-6 animate-spin rounded-full border-4 border-brand-cyan border-t-transparent" />
                    <span className="font-mono text-xs uppercase tracking-widest text-brand-cyan">
                      Đang tải danh sách từ...
                    </span>
                  </div>
                ) : deckItems.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
                    <FolderOpen className="size-16 text-copy-subtle/30" />
                    <h3 className="text-base font-semibold text-copy-secondary">Bộ từ vựng trống</h3>
                    <p className="text-xs text-copy-muted max-w-sm">
                      {activeDeck.is_default
                        ? "Bộ từ hệ thống này chưa được cập nhật từ vựng."
                        : "Bộ từ vựng cá nhân của bạn hiện chưa có từ nào. Hãy bấm 'Thêm từ mới' ở trên để bổ sung từ vựng."}
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto pr-1">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-stroke text-copy-muted font-mono uppercase tracking-wider">
                          <th className="py-3 px-4">Từ vựng / IPA</th>
                          <th className="py-3 px-4">Nghĩa dịch</th>
                          <th className="py-3 px-4">Ví dụ câu mẫu</th>
                          <th className="py-3 px-4 text-center">Âm thanh</th>
                          {!activeDeck.is_default && <th className="py-3 px-4 text-right">Xóa</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {deckItems.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-stroke-subtle hover:bg-surface-inner/40 transition duration-200"
                          >
                            {/* Từ vựng */}
                            <td className="py-3 px-4 font-semibold text-white">
                              <div>{item.phrase}</div>
                              {item.note && (
                                <div className="text-[10px] text-copy-subtle font-mono mt-1">
                                  {item.note}
                                </div>
                              )}
                            </td>

                            {/* Nghĩa */}
                            <td className="py-3 px-4 text-copy-secondary">
                              {item.meaning}
                            </td>

                            {/* Ví dụ */}
                            <td className="py-3 px-4 text-copy-muted italic max-w-xs truncate" title={item.example_sentence || ""}>
                              {item.example_sentence ? `“${item.example_sentence}”` : "--"}
                            </td>

                            {/* Phím nghe phát âm */}
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => speakPhrase(item.phrase)}
                                className="p-2 rounded-full hover:bg-surface-inner text-copy-secondary hover:text-brand-cyan transition"
                                title="Nghe phát âm"
                              >
                                <Volume2 className="size-4" />
                              </button>
                            </td>

                            {/* Xóa (chỉ cho My Decks) */}
                            {!activeDeck.is_default && (
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-1.5 rounded text-copy-subtle hover:text-destructive hover:bg-destructive/10 transition"
                                  title="Xóa từ"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. MODAL TẠO BỘ TỪ MỚI (CREATE DECK MODAL) */}
      {showCreateDeckModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={handleCreateDeck}
            className="w-full max-w-md rounded-panel border border-stroke bg-canvas-deep p-6 text-white shadow-modal mx-4 relative animate-scale-in"
          >
            <button
              type="button"
              onClick={() => setShowCreateDeckModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full border border-stroke-strong bg-surface-inner text-copy-subtle hover:text-white transition"
            >
              <X className="size-4" />
            </button>

            <h3 className="text-base font-semibold font-mono tracking-wide uppercase text-brand-cyan mb-4 flex items-center gap-1.5">
              <Plus className="size-4" /> Tạo bộ từ mới
            </h3>

            <div className="space-y-4">
              {/* Tên bộ từ */}
              <div className="space-y-1.5">
                <label className="text-xs text-copy-secondary font-medium">Tên bộ từ *</label>
                <Input
                  required
                  placeholder="Ví dụ: Từ vựng IELTS, Movie Slangs..."
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  className="bg-surface-panel border-stroke text-xs rounded-control h-10"
                />
              </div>

              {/* Mô tả */}
              <div className="space-y-1.5">
                <label className="text-xs text-copy-secondary font-medium">Mô tả chi tiết</label>
                <textarea
                  placeholder="Ghi chú thêm về mục đích của bộ từ..."
                  value={newDeckDesc}
                  onChange={(e) => setNewDeckDesc(e.target.value)}
                  className="w-full p-3 bg-surface-panel border border-stroke text-xs text-white rounded-control h-20 outline-none focus:border-brand-cyan transition"
                />
              </div>

              {/* Trình độ */}
              <div className="space-y-1.5">
                <label className="text-xs text-copy-secondary font-medium">Trình độ phù hợp</label>
                <select
                  value={newDeckLevel}
                  onChange={(e) => setNewDeckLevel(e.target.value)}
                  className="w-full p-2.5 bg-surface-panel border border-stroke text-xs text-white rounded-control outline-none focus:border-brand-cyan transition"
                >
                  {["A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              {/* Danh mục liên kết */}
              <div className="space-y-1.5">
                <label className="text-xs text-copy-secondary font-medium">Danh mục bài học</label>
                <select
                  value={newDeckCategory || ""}
                  onChange={(e) => setNewDeckCategory(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full p-2.5 bg-surface-panel border border-stroke text-xs text-white rounded-control outline-none focus:border-brand-cyan transition"
                >
                  <option value="">Không phân loại</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-stroke pt-4">
              <Button
                type="button"
                variant="glass"
                onClick={() => setShowCreateDeckModal(false)}
                className="font-mono text-xs uppercase"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="product"
                disabled={creatingDeck}
                className="font-mono text-xs uppercase"
              >
                {creatingDeck ? "Đang tạo..." : "Xác nhận tạo"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* 8. MODAL THÊM TỪ MỚI VÀO BỘ CÁ NHÂN (ADD ITEM MODAL) */}
      {showAddItemModal && activeDeck && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={handleAddItem}
            className="w-full max-w-md rounded-panel border border-stroke bg-canvas-deep p-6 text-white shadow-modal mx-4 relative animate-scale-in"
          >
            <button
              type="button"
              onClick={() => setShowAddItemModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full border border-stroke-strong bg-surface-inner text-copy-subtle hover:text-white transition"
            >
              <X className="size-4" />
            </button>

            <h3 className="text-base font-semibold font-mono tracking-wide uppercase text-brand-cyan mb-4 flex items-center gap-1.5">
              <Plus className="size-4" /> Thêm từ vựng vào bộ
            </h3>

            <div className="space-y-4">
              {/* Từ vựng */}
              <div className="space-y-1.5">
                <label className="text-xs text-copy-secondary font-medium">Từ vựng / Cụm từ (tiếng Anh) *</label>
                <Input
                  required
                  placeholder="Ví dụ: Delivery Service, Kiki..."
                  value={newPhrase}
                  onChange={(e) => setNewPhrase(e.target.value)}
                  className="bg-surface-panel border-stroke text-xs rounded-control h-10"
                />
              </div>

              {/* Nghĩa tiếng Việt */}
              <div className="space-y-1.5">
                <label className="text-xs text-copy-secondary font-medium">Nghĩa dịch (tiếng Việt) *</label>
                <Input
                  required
                  placeholder="Ví dụ: Dịch vụ giao hàng..."
                  value={newMeaning}
                  onChange={(e) => setNewMeaning(e.target.value)}
                  className="bg-surface-panel border-stroke text-xs rounded-control h-10"
                />
              </div>

              {/* Phiên âm IPA (Lưu vào Note) */}
              <div className="space-y-1.5">
                <label className="text-xs text-copy-secondary font-medium">Phiên âm IPA / Loại từ (không bắt buộc)</label>
                <Input
                  placeholder="Ví dụ: /dɪˈlɪv.ər.i ˈsɜː.vɪs/ (noun)"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="bg-surface-panel border-stroke text-xs rounded-control h-10"
                />
              </div>

              {/* Ví dụ mẫu */}
              <div className="space-y-1.5">
                <label className="text-xs text-copy-secondary font-medium">Ví dụ minh họa (tiếng Anh)</label>
                <textarea
                  placeholder="Ví dụ: We started a delivery service last week."
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  className="w-full p-3 bg-surface-panel border border-stroke text-xs text-white rounded-control h-20 outline-none focus:border-brand-cyan transition"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-stroke pt-4">
              <Button
                type="button"
                variant="glass"
                onClick={() => setShowAddItemModal(false)}
                className="font-mono text-xs uppercase"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="product"
                disabled={addingItem}
                className="font-mono text-xs uppercase"
              >
                {addingItem ? "Đang thêm..." : "Thêm từ mới"}
              </Button>
            </div>
          </form>
        </div>
      )}

    </div>
  )
}
