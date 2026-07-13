"use client"

import Link from "next/link"
import {
  BookOpen,
  Edit3,
  FolderOpen,
  Library,
  LockKeyhole,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react"

import { AsyncContentState } from "@/components/product/async-content-state"
import { ProductReveal } from "@/components/product/product-reveal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { VocabularyCategoryType, VocabularyDeckType } from "@/types/vocabulary"

export type VocabularyTab = "library" | "mine"

interface VocabularyBrowserProps {
  activeTab: VocabularyTab
  onTabChange: (tab: VocabularyTab) => void
  categories: VocabularyCategoryType[]
  selectedCategory: number | null
  onCategoryChange: (categoryId: number | null) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  libraryDecks: VocabularyDeckType[]
  myDecks: VocabularyDeckType[]
  libraryLoading: boolean
  mineLoading: boolean
  libraryError: string | null
  categoryNotice: string | null
  mineError: string | null
  isAuthenticated: boolean
  pendingDeckId: number | null
  onRetryLibrary: () => void
  onRetryMine: () => void
  onOpenDeck: (deck: VocabularyDeckType) => void
  onCreateDeck: () => void
  onEditDeck: (deck: VocabularyDeckType) => void
  onDeleteDeck: (deck: VocabularyDeckType) => void
}

function matchesSearch(deck: VocabularyDeckType, searchQuery: string) {
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("vi")
  if (!normalizedQuery) return true

  return [deck.name, deck.description, deck.level]
    .filter((value): value is string => Boolean(value))
    .some((value) => value.toLocaleLowerCase("vi").includes(normalizedQuery))
}

interface DeckGridProps {
  decks: VocabularyDeckType[]
  searchQuery: string
  emptyTitle: string
  emptyDescription: string
  ownerActions?: boolean
  pendingDeckId: number | null
  onOpenDeck: (deck: VocabularyDeckType) => void
  onEditDeck: (deck: VocabularyDeckType) => void
  onDeleteDeck: (deck: VocabularyDeckType) => void
}

function DeckGrid({
  decks,
  searchQuery,
  emptyTitle,
  emptyDescription,
  ownerActions = false,
  pendingDeckId,
  onOpenDeck,
  onEditDeck,
  onDeleteDeck,
}: DeckGridProps) {
  const filteredDecks = decks.filter((deck) => matchesSearch(deck, searchQuery))

  if (filteredDecks.length === 0) {
    return (
      <AsyncContentState
        kind="empty"
        title={searchQuery.trim() ? "Không tìm thấy bộ từ phù hợp" : emptyTitle}
        description={
          searchQuery.trim()
            ? "Hãy thử một từ khóa ngắn hơn hoặc đổi danh mục đang chọn."
            : emptyDescription
        }
      />
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {filteredDecks.map((deck, index) => (
        <ProductReveal key={deck.id} delay={Math.min(index, 8) * 0.07}>
          <Card
            variant="product"
            className="h-full transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-brand-cyan/30 motion-reduce:transform-none"
          >
            <CardHeader className="gap-4">
              <div className="flex items-start justify-between gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-control border border-brand-cyan/20 bg-brand-cyan/10 text-brand-cyan">
                  {deck.is_default ? (
                    <Library className="size-5" aria-hidden="true" />
                  ) : (
                    <FolderOpen className="size-5" aria-hidden="true" />
                  )}
                </span>
                <div className="flex flex-wrap justify-end gap-2">
                  {deck.level && <Badge variant="outline">{deck.level}</Badge>}
                  <Badge variant={deck.is_default ? "secondary" : "outline"}>
                    {deck.is_default ? "Thư viện" : "Cá nhân"}
                  </Badge>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-foreground">{deck.name}</h3>
                <p className="mt-2 line-clamp-3 min-h-[3.75rem] text-sm leading-6 text-copy-muted">
                  {deck.description || "Một bộ từ được sắp xếp để bạn mở, nghe và ôn lại theo nhịp riêng."}
                </p>
              </div>
            </CardHeader>

            <CardContent className="mt-auto">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-copy-muted">
                {typeof deck.word_count === "number"
                  ? `${deck.word_count} từ vựng`
                  : "Mở bộ từ để xem nội dung"}
              </p>
            </CardContent>

            <CardFooter className="mt-1 flex-wrap justify-between gap-3 border-stroke bg-surface-inner/60">
              <Button
                variant="glass"
                size="app"
                className="flex-1"
                onClick={() => onOpenDeck(deck)}
              >
                <BookOpen aria-hidden="true" />
                Mở bộ từ
              </Button>
              {ownerActions && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon-app"
                    aria-label={`Chỉnh sửa bộ từ ${deck.name}`}
                    onClick={() => onEditDeck(deck)}
                  >
                    <Edit3 aria-hidden="true" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon-app"
                    disabled={pendingDeckId === deck.id}
                    aria-label={`Xóa bộ từ ${deck.name}`}
                    onClick={() => onDeleteDeck(deck)}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </ProductReveal>
      ))}
    </div>
  )
}

export function VocabularyBrowser({
  activeTab,
  onTabChange,
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  libraryDecks,
  myDecks,
  libraryLoading,
  mineLoading,
  libraryError,
  categoryNotice,
  mineError,
  isAuthenticated,
  pendingDeckId,
  onRetryLibrary,
  onRetryMine,
  onOpenDeck,
  onCreateDeck,
  onEditDeck,
  onDeleteDeck,
}: VocabularyBrowserProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        if (value === "library" || value === "mine") onTabChange(value)
      }}
      className="gap-7"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <TabsList
          variant="line"
          aria-label="Chọn nguồn bộ từ"
          className="h-12 w-full justify-start overflow-x-auto border-b border-stroke-subtle p-0 lg:w-auto"
        >
          <TabsTrigger value="library" className="h-11 min-w-36 px-4">
            <Library aria-hidden="true" />
            Thư viện
          </TabsTrigger>
          <TabsTrigger value="mine" className="h-11 min-w-36 px-4">
            <FolderOpen aria-hidden="true" />
            Của tôi
          </TabsTrigger>
        </TabsList>

        <div className="relative w-full lg:max-w-sm">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-copy-muted"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm theo tên, mô tả hoặc trình độ"
            aria-label="Tìm bộ từ vựng"
            className="h-12 bg-surface-inner pl-11"
          />
        </div>
      </div>

      <TabsContent value="library" className="space-y-7">
        {categoryNotice && (
          <p role="status" className="rounded-control border border-action-gold/25 bg-action-gold/10 p-4 text-sm leading-6 text-copy-secondary">
            {categoryNotice}
          </p>
        )}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2" aria-label="Lọc theo danh mục">
            <Button
              variant={selectedCategory === null ? "product" : "glass"}
              size="app"
              className="shrink-0"
              onClick={() => onCategoryChange(null)}
            >
              Tất cả
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "product" : "glass"}
                size="app"
                className="shrink-0"
                onClick={() => onCategoryChange(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        )}

        {libraryLoading ? (
          <AsyncContentState
            kind="loading"
            title="Đang mở thư viện từ vựng"
            description="EngFlex đang tải các bộ từ mặc định và danh mục liên quan."
          />
        ) : libraryError ? (
          <AsyncContentState
            kind="error"
            title="Chưa thể tải thư viện"
            description={libraryError}
            onRetry={onRetryLibrary}
          />
        ) : (
          <DeckGrid
            decks={libraryDecks}
            searchQuery={searchQuery}
            emptyTitle="Danh mục này chưa có bộ từ"
            emptyDescription="Hãy chọn một danh mục khác hoặc quay lại toàn bộ thư viện."
            pendingDeckId={pendingDeckId}
            onOpenDeck={onOpenDeck}
            onEditDeck={onEditDeck}
            onDeleteDeck={onDeleteDeck}
          />
        )}
      </TabsContent>

      <TabsContent value="mine" className="space-y-7">
        {!isAuthenticated ? (
          <AsyncContentState
            kind="empty"
            icon={<LockKeyhole className="size-7" aria-hidden="true" />}
            title="Đăng nhập để tạo kho từ riêng"
            description="Thư viện mặc định luôn có thể xem. Khi đăng nhập, bạn có thể tạo bộ từ, thêm ghi chú và luyện quiz từ nội dung của mình."
            action={
              <Button nativeButton={false} render={<Link href="/login" />} variant="product" size="app">
                Đăng nhập để tiếp tục
              </Button>
            }
          />
        ) : mineLoading ? (
          <AsyncContentState
            kind="loading"
            title="Đang tải bộ từ của bạn"
            description="Các bộ từ cá nhân đang được đồng bộ với tài khoản hiện tại."
          />
        ) : mineError ? (
          <AsyncContentState
            kind="error"
            title="Chưa thể tải bộ từ cá nhân"
            description={mineError}
            onRetry={onRetryMine}
          />
        ) : myDecks.length === 0 ? (
          <AsyncContentState
            kind="empty"
            icon={<Sparkles className="size-7" aria-hidden="true" />}
            title="Bộ từ đầu tiên đang chờ bạn"
            description="Tạo một bộ theo chủ đề bạn quan tâm, rồi thêm những từ gặp trong bài học hoặc ngoài đời."
            action={
              <Button variant="product" size="app" onClick={onCreateDeck}>
                <Plus aria-hidden="true" />
                Tạo bộ từ đầu tiên
              </Button>
            }
          />
        ) : (
          <DeckGrid
            decks={myDecks}
            searchQuery={searchQuery}
            emptyTitle="Bạn chưa có bộ từ nào"
            emptyDescription="Tạo một bộ từ cá nhân để bắt đầu."
            ownerActions
            pendingDeckId={pendingDeckId}
            onOpenDeck={onOpenDeck}
            onEditDeck={onEditDeck}
            onDeleteDeck={onDeleteDeck}
          />
        )}
      </TabsContent>
    </Tabs>
  )
}
