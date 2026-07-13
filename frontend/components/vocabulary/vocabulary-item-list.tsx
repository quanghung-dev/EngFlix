"use client"

import { useState } from "react"
import { Edit3, Search, Trash2, Volume2 } from "lucide-react"

import { useSpeech } from "@/components/learning/use-speech"
import { AsyncContentState } from "@/components/product/async-content-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { VocabularyItemType } from "@/types/vocabulary"

interface VocabularyItemListProps {
  items: VocabularyItemType[]
  loading: boolean
  error: string | null
  isOwner: boolean
  page: number
  totalPages: number
  pendingItemId: number | null
  onRetry: () => void
  onPageChange: (page: number) => void
  onEdit: (item: VocabularyItemType) => void
  onDelete: (item: VocabularyItemType) => void
}

export function VocabularyItemList({
  items,
  loading,
  error,
  isOwner,
  page,
  totalPages,
  pendingItemId,
  onRetry,
  onPageChange,
  onEdit,
  onDelete,
}: VocabularyItemListProps) {
  const { speak, supported } = useSpeech()
  const [query, setQuery] = useState("")
  const normalizedQuery = query.trim().toLocaleLowerCase("vi")
  const filteredItems = normalizedQuery
    ? items.filter((item) =>
        [item.phrase, item.meaning, item.note, item.example_sentence]
          .filter((value): value is string => Boolean(value))
          .some((value) => value.toLocaleLowerCase("vi").includes(normalizedQuery))
      )
    : items

  if (loading) {
    return (
      <AsyncContentState
        kind="loading"
        title="Đang tải danh sách từ"
        description="EngFlex đang sắp xếp từ, nghĩa và ví dụ của bộ này."
      />
    )
  }

  if (error) {
    return (
      <AsyncContentState
        kind="error"
        title="Chưa thể tải nội dung bộ từ"
        description={error}
        onRetry={onRetry}
      />
    )
  }

  if (items.length === 0) {
    return (
      <AsyncContentState
        kind="empty"
        title="Bộ từ này chưa có nội dung"
        description={
          isOwner
            ? "Thêm từ đầu tiên để bắt đầu ôn bằng danh sách hoặc flashcard."
            : "Bộ từ mặc định này chưa có mục từ để hiển thị."
        }
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="relative max-w-md">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-copy-muted"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm trong bộ từ đang mở"
          aria-label="Tìm trong bộ từ đang mở"
          className="h-12 bg-surface-inner pl-11"
        />
      </div>

      {filteredItems.length === 0 ? (
        <AsyncContentState
          kind="empty"
          title="Không có từ nào khớp tìm kiếm"
          description="Hãy thử tìm bằng từ tiếng Anh, nghĩa tiếng Việt hoặc một phần câu ví dụ."
        />
      ) : (
        <>
          <Card variant="product" className="hidden py-0 md:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">Danh sách từ vựng trong bộ đang mở</caption>
                <thead className="border-b border-stroke bg-surface-inner/70 font-mono text-[11px] uppercase tracking-[0.15em] text-copy-muted">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-medium">Từ / cụm từ</th>
                    <th scope="col" className="px-6 py-4 font-medium">Nghĩa</th>
                    <th scope="col" className="px-6 py-4 font-medium">Ngữ cảnh</th>
                    <th scope="col" className="px-6 py-4 text-right font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke-subtle">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="align-top transition-colors duration-300 hover:bg-surface-inner/40">
                      <th scope="row" className="px-6 py-5 font-medium text-white">
                        <div className="flex items-start gap-3">
                          <Button
                            variant="ghost"
                            size="icon-app"
                            disabled={!supported}
                            aria-label={`Nghe phát âm ${item.phrase}`}
                            onClick={() => speak(item.phrase)}
                          >
                            <Volume2 aria-hidden="true" />
                          </Button>
                          <div>
                            <span className="block text-base">{item.phrase}</span>
                            {item.note && (
                              <span className="mt-1 block font-mono text-xs font-normal text-copy-muted">
                                {item.note}
                              </span>
                            )}
                          </div>
                        </div>
                      </th>
                      <td className="max-w-xs px-6 py-5 leading-6 text-copy-secondary">{item.meaning}</td>
                      <td className="max-w-sm px-6 py-5 text-sm italic leading-6 text-copy-muted">
                        {item.example_sentence || "Chưa có câu ví dụ."}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          {isOwner ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon-app"
                                aria-label={`Chỉnh sửa ${item.phrase}`}
                                onClick={() => onEdit(item)}
                              >
                                <Edit3 aria-hidden="true" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon-app"
                                disabled={pendingItemId === item.id}
                                aria-label={`Xóa ${item.phrase}`}
                                onClick={() => onDelete(item)}
                              >
                                <Trash2 aria-hidden="true" />
                              </Button>
                            </>
                          ) : (
                            <span className="text-xs text-copy-muted">Chỉ đọc</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid gap-4 md:hidden">
            {filteredItems.map((item) => (
              <Card key={item.id} variant="product">
                <CardContent className="space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{item.phrase}</h3>
                      {item.note && (
                        <p className="mt-1 font-mono text-xs text-copy-muted">{item.note}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-app"
                      disabled={!supported}
                      aria-label={`Nghe phát âm ${item.phrase}`}
                      onClick={() => speak(item.phrase)}
                    >
                      <Volume2 aria-hidden="true" />
                    </Button>
                  </div>
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-brand-cyan">Nghĩa</p>
                    <p className="mt-2 leading-6 text-copy-secondary">{item.meaning}</p>
                  </div>
                  {item.example_sentence && (
                    <p className="border-l-2 border-brand-cyan/30 pl-4 text-sm italic leading-6 text-copy-muted">
                      “{item.example_sentence}”
                    </p>
                  )}
                  {isOwner && (
                    <div className="flex justify-end gap-2 border-t border-stroke-subtle pt-4">
                      <Button variant="glass" size="app" onClick={() => onEdit(item)}>
                        <Edit3 aria-hidden="true" />
                        Sửa
                      </Button>
                      <Button
                        variant="destructive"
                        size="app"
                        disabled={pendingItemId === item.id}
                        onClick={() => onDelete(item)}
                      >
                        <Trash2 aria-hidden="true" />
                        Xóa
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {totalPages > 1 && !normalizedQuery && (
        <nav className="flex items-center justify-between gap-4 border-t border-stroke-subtle pt-5" aria-label="Phân trang từ vựng">
          <Button variant="glass" size="app" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            Trang trước
          </Button>
          <span className="font-mono text-xs text-copy-muted" aria-live="polite">
            Trang {page} / {totalPages}
          </span>
          <Button
            variant="glass"
            size="app"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Trang sau
          </Button>
        </nav>
      )}
    </div>
  )
}
