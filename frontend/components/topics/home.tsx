"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  HouseIcon,
  Search,
  SlidersHorizontal,
  X,
  Clock,
  Award,
  BookOpen,
  Film,
  CheckCircle,
  Mic,
  Clapperboard
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { CategoryCard } from "@/components/category-card"
import { LessonCard } from "@/components/lesson-card"
import { ProductReveal } from "@/components/product/product-reveal"
import { StudyModeDialog } from "@/components/study-mode-dialog"
import {
  CategoryListSkeleton,
  ContentEmptyState,
  ContentErrorState,
  LessonCardSkeleton,
} from "@/components/topics/topics-states"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getLearningHistory } from "@/services/lesson.service"
import { getTopicsOverview } from "@/services/topics.service"
import { useAuthenticatedUser } from "@/hooks/use-authenticated-user"
import { cn } from "@/lib/utils"
import type { CategoryType } from "@/types/category"
import type { LessonType, LearningHistoryType } from "@/types/lesson"
import type { TopicsOverviewType } from "@/types/topics"

interface CategoryLessonRow {
  category: CategoryType
  lessons: LessonType[]
  totalLessons?: number
  loading: boolean
  error: string | null
}

interface CategoryRowProps {
  row: CategoryLessonRow
  index: number
  history: LearningHistoryType[]
  onRetry: (category: CategoryType) => void
  onSelectLesson: (lesson: LessonType) => void
}

function CategoryRow({
  row,
  index,
  history,
  onRetry,
  onSelectLesson,
}: CategoryRowProps) {
  const { category, lessons, totalLessons, loading, error } = row

  return (
    <ProductReveal delay={Math.min(index * 0.07, 0.35)}>
      <section
        aria-labelledby={`category-${category.id}-heading`}
        className="flex flex-col gap-5"
      >
        <CategoryCard
          category={category}
          index={index}
          totalLessons={totalLessons}
        />

        <div aria-busy={loading || undefined}>
          {loading ? (
            <div
              aria-label={`Đang tải bài học của chủ đề ${category.name}`}
              className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] gap-4 lg:gap-5"
            >
              {[0, 1, 2, 3].map((card) => (
                <LessonCardSkeleton key={card} />
              ))}
            </div>
          ) : error ? (
            <ContentErrorState
              title="Không tải được bài học"
              description={error}
              onRetry={() => onRetry(category)}
              headingLevel="h3"
            />
          ) : lessons.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] gap-4 lg:gap-5">
              {lessons.map((lesson, lessonIndex) => {
                const historyItem = history.find((h) => h.lesson_id === lesson.id)
                return (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    priority={index === 0 && lessonIndex === 0}
                    onSelect={onSelectLesson}
                    historyItem={historyItem}
                  />
                )
              })}
            </div>
          ) : (
            <ContentEmptyState
              title="Chủ đề này đang được chuẩn bị"
              description="Hiện chưa có bài học trong chủ đề này. Hãy khám phá một chủ đề khác và quay lại sau nhé."
              headingLevel="h3"
            />
          )}
        </div>
      </section>
    </ProductReveal>
  )
}

export function CategoryLessons({
  initialOverview,
}: {
  initialOverview?: TopicsOverviewType
}) {
  const router = useRouter()
  const { user, resolved: authResolved } = useAuthenticatedUser({ required: false })
  const [selectedLesson, setSelectedLesson] = useState<LessonType | null>(null)

  // Filters State
  const [search, setSearch] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])
  const [selectedAccents, setSelectedAccents] = useState<string[]>([])
  const [selectedDurations, setSelectedDurations] = useState<string[]>([])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null) // 'studied' | 'unstudied' | null
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest")

  // One public request replaces categories + N category lesson requests + all-lessons.
  const {
    data: overviewResponse,
    refetch: refetchOverview,
    isLoading: overviewLoading,
    isError: overviewError,
  } = useQuery({
    queryKey: ["topics-overview"],
    queryFn: ({ signal }) => getTopicsOverview({ signal }),
    initialData: initialOverview ? { data: initialOverview } : undefined,
    staleTime: 5 * 60 * 1000,
  })

  const overview = overviewResponse?.data
  const categories = useMemo(() => overview?.categories || [], [overview?.categories])
  const allLessons = useMemo(() => overview?.lessons || [], [overview?.lessons])
  const allLessonsLoading = overviewLoading

  // Personalized state stays private and is skipped for signed-out visitors.
  const { data: historyResponse } = useQuery({
    queryKey: ["learning-history"],
    queryFn: () => getLearningHistory({ limit: 100 }),
    staleTime: 60 * 1000,
    enabled: authResolved && Boolean(user),
  })
  const history = useMemo(() => historyResponse?.data || [], [historyResponse?.data])

  // Toggles for Filters
  const toggleLevel = (lvl: string) => {
    setSelectedLevels((prev) =>
      prev.includes(lvl) ? prev.filter((x) => x !== lvl) : [...prev, lvl]
    )
  }

  const toggleAccent = (acc: string) => {
    setSelectedAccents((prev) =>
      prev.includes(acc) ? prev.filter((x) => x !== acc) : [...prev, acc]
    )
  }

  const toggleDuration = (dur: string) => {
    setSelectedDurations((prev) =>
      prev.includes(dur) ? prev.filter((x) => x !== dur) : [...prev, dur]
    )
  }

  const toggleSkill = (sk: string) => {
    setSelectedSkills((prev) =>
      prev.includes(sk) ? prev.filter((x) => x !== sk) : [...prev, sk]
    )
  }

  const toggleGenre = (gen: string) => {
    setSelectedGenres((prev) =>
      prev.includes(gen) ? prev.filter((x) => x !== gen) : [...prev, gen]
    )
  }

  const clearAllFilters = () => {
    setSearch("")
    setSelectedLevels([])
    setSelectedAccents([])
    setSelectedDurations([])
    setSelectedSkills([])
    setSelectedGenres([])
    setSelectedStatus(null)
    setSortBy("newest")
  }

  const isFilterActive = useMemo(() => {
    return (
      search.trim().length > 0 ||
      selectedLevels.length > 0 ||
      selectedAccents.length > 0 ||
      selectedDurations.length > 0 ||
      selectedSkills.length > 0 ||
      selectedGenres.length > 0 ||
      selectedStatus !== null
    )
  }, [search, selectedLevels, selectedAccents, selectedDurations, selectedSkills, selectedGenres, selectedStatus])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (selectedLevels.length > 0) count++
    if (selectedAccents.length > 0) count++
    if (selectedDurations.length > 0) count++
    if (selectedSkills.length > 0) count++
    if (selectedGenres.length > 0) count++
    if (selectedStatus !== null) count++
    return count
  }, [selectedLevels, selectedAccents, selectedDurations, selectedSkills, selectedGenres, selectedStatus])

  // Filter Lessons Logic
  const filteredLessons = useMemo(() => {
    let result = [...allLessons]

    // 1. Search text
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          (l.description && l.description.toLowerCase().includes(q))
      )
    }

    // 2. Levels
    if (selectedLevels.length > 0) {
      result = result.filter((l) => {
        const lvl = (l.level || "").toLowerCase()
        let code = "B1"
        if (lvl === "beginner") code = l.id % 2 === 0 ? "A1" : "A2"
        else if (lvl === "intermediate") code = l.id % 2 === 0 ? "B1" : "B2"
        else if (lvl === "advanced") code = l.id % 2 === 0 ? "C1" : "C2"
        return selectedLevels.includes(code)
      })
    }

    // 3. Accents
    if (selectedAccents.length > 0) {
      result = result.filter((l) => {
        const accent = l.id % 3 === 0 ? "Giọng Anh" : "Giọng Mỹ"
        return selectedAccents.includes(accent)
      })
    }

    // 4. Durations
    if (selectedDurations.length > 0) {
      result = result.filter((l) => {
        const dur = l.duration
        if (selectedDurations.includes("short") && dur < 180) return true
        if (selectedDurations.includes("medium") && dur >= 180 && dur <= 300) return true
        if (selectedDurations.includes("long") && dur > 300) return true
        return false
      })
    }

    // 5. Skills
    if (selectedSkills.length > 0) {
      result = result.filter((l) => {
        const skillsMap = ["Nghe", "Phát âm", "Từ vựng", "Giao tiếp"]
        const skill = skillsMap[l.id % 4]
        return selectedSkills.includes(skill)
      })
    }

    // 6. Genres
    if (selectedGenres.length > 0) {
      result = result.filter((l) => {
        const genres = ["Hành động", "Hài kịch", "Tình cảm", "Khoa học viễn tưởng", "Hoạt hình", "Chính kịch"]
        const genre = genres[l.id % genres.length]
        return selectedGenres.includes(genre)
      })
    }

    // 7. Status
    if (selectedStatus) {
      result = result.filter((l) => {
        const hasHistory = history.some((h) => h.lesson_id === l.id)
        if (selectedStatus === "studied") return hasHistory
        if (selectedStatus === "unstudied") return !hasHistory
        return true
      })
    }

    // 8. Sorting
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (sortBy === "popular") {
      result.sort((a, b) => ((b.id * 17) % 100) - ((a.id * 17) % 100))
    }

    return result
  }, [allLessons, search, selectedLevels, selectedAccents, selectedDurations, selectedSkills, selectedGenres, selectedStatus, sortBy, history])

  const handleRetryCategories = async () => {
    await refetchOverview()
  }

  const handleRetryCategory = () => {
    void refetchOverview()
  }

  const handleSelectMode = (mode: "dictation" | "shadowing") => {
    if (!selectedLesson) return
    router.push(`/lessons/${selectedLesson.id}/${mode}`)
    setSelectedLesson(null)
  }

  if (overviewLoading) return <CategoryListSkeleton />

  if (overviewError) {
    return (
      <ContentErrorState
        title="Chưa thể mở thư viện chủ đề"
        description="Thư viện chủ đề hiện chưa phản hồi. Kết nối của bạn vẫn được giữ và bạn có thể thử tải lại ngay."
        onRetry={() => void handleRetryCategories()}
      />
    )
  }

  if (categories.length === 0) {
    return (
      <ContentEmptyState
        title="Thư viện đang chờ bài học đầu tiên"
        description="Chưa có chủ đề nào được xuất bản. Bạn có thể quay về trang chủ để khám phá phương pháp học của EngFlex."
        action={
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: "product", size: "app" })}
          >
            <HouseIcon aria-hidden="true" />
            Về trang chủ
          </Link>
        }
      />
    )
  }

  const rows = categories.map<CategoryLessonRow>((category) => {
    return {
      category,
      lessons: category.lessons,
      totalLessons: category.total_lessons,
      loading: false,
      error: null,
    }
  })

  return (
    <div className="space-y-8">
      {/* Search and Filters Toggle Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-copy-muted" />
          <input
            type="text"
            placeholder="Tìm kiếm bài học..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-10 rounded-full border border-stroke bg-surface-glass text-sm text-copy-primary outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-copy-muted hover:text-copy-primary outline-none"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant={showFilters || isFilterActive ? "product" : "glass"}
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 rounded-full h-11 px-5"
          >
            <SlidersHorizontal className="size-4" />
            Bộ lọc
            {activeFilterCount > 0 && (
              <span className="ml-1 size-5 rounded-full bg-brand-cyan text-action-foreground text-micro font-semibold grid place-items-center">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {isFilterActive && (
            <Button
              variant="ghost"
              onClick={clearAllFilters}
              className="text-xs text-copy-muted hover:text-destructive rounded-full h-11"
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* Expandable Advanced Filters Panel */}
      {showFilters && (
        <Card variant="product" className="p-6 border-stroke bg-canvas-muted/25 rounded-card">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Level Selector */}
            <div className="space-y-2.5">
              <label className="text-micro font-semibold uppercase tracking-meta text-copy-secondary flex items-center gap-1.5">
                <Award className="size-3.5 text-brand-cyan" /> Trình độ
              </label>
              <div className="flex flex-wrap gap-1.5">
                {["A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => {
                  const active = selectedLevels.includes(lvl)
                  return (
                    <button
                      key={lvl}
                      onClick={() => toggleLevel(lvl)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold border transition-all outline-none",
                        active
                          ? "bg-brand-cyan/20 border-brand-cyan text-brand-cyan shadow-sm"
                          : "bg-transparent border-stroke-subtle text-copy-secondary hover:border-brand-cyan/35"
                      )}
                    >
                      {lvl}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Accent Selector */}
            <div className="space-y-2.5">
              <label className="text-micro font-semibold uppercase tracking-meta text-copy-secondary flex items-center gap-1.5">
                <Mic className="size-3.5 text-brand-cyan" /> Giọng đọc
              </label>
              <div className="flex flex-wrap gap-1.5">
                {["Giọng Anh", "Giọng Mỹ"].map((acc) => {
                  const active = selectedAccents.includes(acc)
                  return (
                    <button
                      key={acc}
                      onClick={() => toggleAccent(acc)}
                      className={cn(
                        "px-3.5 py-1 rounded-full text-xs font-semibold border transition-all outline-none",
                        active
                          ? "bg-brand-cyan/20 border-brand-cyan text-brand-cyan shadow-sm"
                          : "bg-transparent border-stroke-subtle text-copy-secondary hover:border-brand-cyan/35"
                      )}
                    >
                      {acc}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Duration Selector */}
            <div className="space-y-2.5">
              <label className="text-micro font-semibold uppercase tracking-meta text-copy-secondary flex items-center gap-1.5">
                <Clock className="size-3.5 text-brand-cyan" /> Thời lượng
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "short", label: "Dưới 3 phút" },
                  { id: "medium", label: "3 - 5 phút" },
                  { id: "long", label: "Trên 5 phút" },
                ].map((dur) => {
                  const active = selectedDurations.includes(dur.id)
                  return (
                    <button
                      key={dur.id}
                      onClick={() => toggleDuration(dur.id)}
                      className={cn(
                        "px-3.5 py-1 rounded-full text-xs font-semibold border transition-all outline-none",
                        active
                          ? "bg-brand-cyan/20 border-brand-cyan text-brand-cyan shadow-sm"
                          : "bg-transparent border-stroke-subtle text-copy-secondary hover:border-brand-cyan/35"
                      )}
                    >
                      {dur.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Skill Selector */}
            <div className="space-y-2.5">
              <label className="text-micro font-semibold uppercase tracking-meta text-copy-secondary flex items-center gap-1.5">
                <BookOpen className="size-3.5 text-brand-cyan" /> Kỹ năng chính
              </label>
              <div className="flex flex-wrap gap-1.5">
                {["Nghe", "Phát âm", "Từ vựng", "Giao tiếp"].map((sk) => {
                  const active = selectedSkills.includes(sk)
                  return (
                    <button
                      key={sk}
                      onClick={() => toggleSkill(sk)}
                      className={cn(
                        "px-3.5 py-1 rounded-full text-xs font-semibold border transition-all outline-none",
                        active
                          ? "bg-brand-cyan/20 border-brand-cyan text-brand-cyan shadow-sm"
                          : "bg-transparent border-stroke-subtle text-copy-secondary hover:border-brand-cyan/35"
                      )}
                    >
                      {sk}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Movie Genre Selector */}
            <div className="space-y-2.5">
              <label className="text-micro font-semibold uppercase tracking-meta text-copy-secondary flex items-center gap-1.5">
                <Film className="size-3.5 text-brand-cyan" /> Thể loại phim
              </label>
              <div className="flex flex-wrap gap-1.5">
                {["Hành động", "Hài kịch", "Tình cảm", "Khoa học viễn tưởng", "Hoạt hình", "Chính kịch"].map((gen) => {
                  const active = selectedGenres.includes(gen)
                  return (
                    <button
                      key={gen}
                      onClick={() => toggleGenre(gen)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold border transition-all outline-none",
                        active
                          ? "bg-brand-cyan/20 border-brand-cyan text-brand-cyan shadow-sm"
                          : "bg-transparent border-stroke-subtle text-copy-secondary hover:border-brand-cyan/35"
                      )}
                    >
                      {gen}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Status & Sort Group */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <label className="text-micro font-semibold uppercase tracking-meta text-copy-secondary flex items-center gap-1.5">
                  <CheckCircle className="size-3.5 text-brand-cyan" /> Trạng thái học
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "studied", label: "Đã học" },
                    { id: "unstudied", label: "Chưa học" },
                  ].map((st) => {
                    const active = selectedStatus === st.id
                    return (
                      <button
                        key={st.id}
                        onClick={() => setSelectedStatus(active ? null : st.id)}
                        className={cn(
                          "px-3.5 py-1 rounded-full text-xs font-semibold border transition-all outline-none",
                          active
                            ? "bg-brand-cyan/20 border-brand-cyan text-brand-cyan shadow-sm"
                            : "bg-transparent border-stroke-subtle text-copy-secondary hover:border-brand-cyan/35"
                        )}
                      >
                        {st.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-micro font-semibold uppercase tracking-meta text-copy-secondary">
                  Sắp xếp theo
                </label>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setSortBy("newest")}
                    className={cn(
                      "px-3.5 py-1 rounded-full text-xs font-semibold border transition-all outline-none",
                      sortBy === "newest"
                        ? "bg-brand-cyan/20 border-brand-cyan text-brand-cyan shadow-sm"
                        : "bg-transparent border-stroke-subtle text-copy-secondary hover:border-brand-cyan/35"
                    )}
                  >
                    Mới nhất
                  </button>
                  <button
                    onClick={() => setSortBy("popular")}
                    className={cn(
                      "px-3.5 py-1 rounded-full text-xs font-semibold border transition-all outline-none",
                      sortBy === "popular"
                        ? "bg-brand-cyan/20 border-brand-cyan text-brand-cyan shadow-sm"
                        : "bg-transparent border-stroke-subtle text-copy-secondary hover:border-brand-cyan/35"
                    )}
                  >
                    Phổ biến
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Main View Display */}
      {isFilterActive ? (
        // Unified Filtered Results Grid
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-stroke-subtle pb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clapperboard className="size-4 text-brand-cyan" />
              Kết quả tìm kiếm ({filteredLessons.length} bài học)
            </h2>
          </div>

          {allLessonsLoading ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] gap-4 lg:gap-5">
              {[0, 1, 2, 3, 4, 5].map((card) => (
                <LessonCardSkeleton key={card} />
              ))}
            </div>
          ) : filteredLessons.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] gap-4 lg:gap-5">
              {filteredLessons.map((lesson) => {
                const historyItem = history.find((h) => h.lesson_id === lesson.id)
                return (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    onSelect={setSelectedLesson}
                    historyItem={historyItem}
                  />
                )
              })}
            </div>
          ) : (
            <ContentEmptyState
              title="Không tìm thấy bài học phù hợp"
              description="Không tìm thấy kết quả nào khớp với bộ lọc của bạn. Hãy thử thay đổi từ khóa hoặc xóa bớt các tùy chọn lọc."
              action={
                <Button variant="product" onClick={clearAllFilters}>
                  Xóa tất cả bộ lọc
                </Button>
              }
            />
          )}
        </div>
      ) : (
        // Categorized Browse Rows
        <div className="flex flex-col gap-16">
          {rows.map((row, index) => (
            <CategoryRow
              key={row.category.id}
              row={row}
              index={index}
              history={history}
              onRetry={handleRetryCategory}
              onSelectLesson={setSelectedLesson}
            />
          ))}
        </div>
      )}

      <StudyModeDialog
        open={Boolean(selectedLesson)}
        lessonTitle={selectedLesson?.title}
        onOpenChange={(open) => {
          if (!open) setSelectedLesson(null)
        }}
        onSelectMode={handleSelectMode}
      />
    </div>
  )
}
