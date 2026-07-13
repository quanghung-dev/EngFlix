"use client"

import {
  ArrowLeft,
  BookOpenCheck,
  Edit3,
  Layers3,
  Play,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react"

import { ProductReveal } from "@/components/product/product-reveal"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { VocabularyItemList } from "@/components/vocabulary/vocabulary-item-list"
import type { VocabularyDeckType, VocabularyItemType } from "@/types/vocabulary"

interface VocabularyDeckDetailProps {
  deck: VocabularyDeckType
  categoryName?: string
  items: VocabularyItemType[]
  loading: boolean
  error: string | null
  isOwner: boolean
  page: number
  totalPages: number
  pendingDeckId: number | null
  pendingItemId: number | null
  studyPending: boolean
  onBack: () => void
  onRetry: () => void
  onPageChange: (page: number) => void
  onStartStudy: () => void
  onAddItem: () => void
  onEditDeck: () => void
  onDeleteDeck: () => void
  onEditItem: (item: VocabularyItemType) => void
  onDeleteItem: (item: VocabularyItemType) => void
}

export function VocabularyDeckDetail({
  deck,
  categoryName,
  items,
  loading,
  error,
  isOwner,
  page,
  totalPages,
  pendingDeckId,
  pendingItemId,
  studyPending,
  onBack,
  onRetry,
  onPageChange,
  onStartStudy,
  onAddItem,
  onEditDeck,
  onDeleteDeck,
  onEditItem,
  onDeleteItem,
}: VocabularyDeckDetailProps) {
  return (
    <div className="space-y-8">
      <ProductReveal eager>
        <Button variant="ghost" size="app" onClick={onBack}>
          <ArrowLeft aria-hidden="true" />
          Trở về danh sách bộ từ
        </Button>
      </ProductReveal>

      <ProductReveal eager delay={0.07}>
        <section className="grid gap-6 rounded-card border border-stroke bg-surface-panel p-6 shadow-card sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <div className="flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-cyan">
              <span>{deck.is_default ? "Bộ từ thư viện" : "Bộ từ cá nhân"}</span>
              {deck.level && <span>· {deck.level}</span>}
              {categoryName && <span>· {categoryName}</span>}
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{deck.name}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-copy-muted sm:text-base">
              {deck.description || "Mở từng mục từ để nghe phát âm, đọc ngữ cảnh và luyện lại bằng flashcard."}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:max-w-md lg:justify-end">
            <Button
              variant="product"
              size="app"
              disabled={loading || items.length === 0 || studyPending}
              onClick={onStartStudy}
            >
              <Play aria-hidden="true" />
              {studyPending ? "Đang chuẩn bị…" : "Học bằng flashcard"}
            </Button>
            {isOwner && (
              <>
                <Button variant="glass" size="app" onClick={onAddItem}>
                  <Plus aria-hidden="true" />
                  Thêm từ
                </Button>
                <Button variant="ghost" size="icon-app" aria-label="Chỉnh sửa bộ từ" onClick={onEditDeck}>
                  <Edit3 aria-hidden="true" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon-app"
                  aria-label="Xóa bộ từ"
                  disabled={pendingDeckId === deck.id}
                  onClick={onDeleteDeck}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </>
            )}
          </div>
        </section>
      </ProductReveal>

      <div className="grid gap-4 sm:grid-cols-3">
        <ProductReveal delay={0.14}>
          <Card variant="inner" className="h-full">
            <CardContent>
              <Layers3 className="size-5 text-brand-cyan" aria-hidden="true" />
              <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.16em] text-copy-muted">Mục từ trang này</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">{loading ? "—" : items.length}</p>
            </CardContent>
          </Card>
        </ProductReveal>
        <ProductReveal delay={0.21}>
          <Card variant="inner" className="h-full">
            <CardContent>
              <BookOpenCheck className="size-5 text-action-gold" aria-hidden="true" />
              <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.16em] text-copy-muted">Chế độ ôn</p>
              <p className="mt-2 text-xl font-semibold text-foreground">Danh sách & flashcard</p>
            </CardContent>
          </Card>
        </ProductReveal>
        <ProductReveal delay={0.28}>
          <Card variant="inner" className="h-full">
            <CardContent>
              <ShieldCheck className="size-5 text-status-success" aria-hidden="true" />
              <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.16em] text-copy-muted">Quyền truy cập</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{isOwner ? "Bạn có thể chỉnh sửa" : "Chỉ đọc"}</p>
            </CardContent>
          </Card>
        </ProductReveal>
      </div>

      <ProductReveal delay={0.35}>
        <section aria-labelledby="vocabulary-items-title" className="space-y-5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-cyan">Nội dung bộ từ</p>
            <h2 id="vocabulary-items-title" className="mt-2 text-2xl font-semibold text-foreground">Từ và ngữ cảnh</h2>
          </div>
          <VocabularyItemList
            items={items}
            loading={loading}
            error={error}
            isOwner={isOwner}
            page={page}
            totalPages={totalPages}
            pendingItemId={pendingItemId}
            onRetry={onRetry}
            onPageChange={onPageChange}
            onEdit={onEditItem}
            onDelete={onDeleteItem}
          />
        </section>
      </ProductReveal>
    </div>
  )
}
