"use client"

import { useEffect, useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { VocabularyCategoryType, VocabularyDeckType } from "@/types/vocabulary"

export interface DeckFormValues {
  name: string
  description?: string
  category_id?: number
  level?: string
}

interface DeckFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: VocabularyCategoryType[]
  initialDeck?: VocabularyDeckType | null
  pending: boolean
  error: string | null
  onSubmit: (values: DeckFormValues) => Promise<void>
}

const levels = ["A1", "A2", "B1", "B2", "C1", "C2"]

export function DeckFormDialog({
  open,
  onOpenChange,
  categories,
  initialDeck,
  pending,
  error,
  onSubmit,
}: DeckFormDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [level, setLevel] = useState("B1")
  const [categoryId, setCategoryId] = useState("none")

  useEffect(() => {
    if (!open) return
    const syncId = window.setTimeout(() => {
      setName(initialDeck?.name ?? "")
      setDescription(initialDeck?.description ?? "")
      setLevel(initialDeck?.level ?? "B1")
      setCategoryId(initialDeck?.category_id ? String(initialDeck.category_id) : "none")
    }, 0)
    return () => window.clearTimeout(syncId)
  }, [initialDeck, open])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) return

    await onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      level,
      category_id: categoryId === "none" ? undefined : Number(categoryId),
    })
  }

  const isEditing = Boolean(initialDeck)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto rounded-panel border border-stroke bg-canvas-deep p-6 text-foreground shadow-modal sm:max-w-lg sm:p-8">
        <form onSubmit={handleSubmit} aria-busy={pending}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {isEditing ? "Chỉnh sửa bộ từ" : "Tạo bộ từ mới"}
            </DialogTitle>
            <DialogDescription className="leading-6 text-copy-muted">
              {isEditing
                ? "Cập nhật tên, mô tả và trình độ của bộ từ cá nhân."
                : "Tạo một không gian riêng để lưu các từ bạn gặp trong quá trình học."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="deck-name">Tên bộ từ</Label>
              <Input
                id="deck-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ví dụ: English for meetings"
                maxLength={120}
                required
                autoFocus
                className="h-11 bg-surface-panel"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="deck-description">Mô tả</Label>
              <Textarea
                id="deck-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Bạn muốn dùng bộ từ này cho mục tiêu nào?"
                maxLength={500}
                className="min-h-24 bg-surface-panel"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="deck-level">Trình độ</Label>
                <Select value={level} onValueChange={(value) => value && setLevel(value)}>
                  <SelectTrigger id="deck-level" className="h-11 w-full bg-surface-panel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="deck-category">Danh mục</Label>
                <Select value={categoryId} onValueChange={(value) => value && setCategoryId(value)}>
                  <SelectTrigger id="deck-category" className="h-11 w-full bg-surface-panel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không phân loại</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-control border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="mt-7 -mx-6 -mb-6 border-stroke bg-surface-inner/50 px-6 py-5 sm:-mx-8 sm:-mb-8 sm:px-8">
            <Button type="button" variant="glass" size="app" onClick={() => onOpenChange(false)} disabled={pending}>
              Hủy
            </Button>
            <Button type="submit" variant="product" size="app" disabled={pending || !name.trim()}>
              {pending ? "Đang lưu…" : isEditing ? "Lưu thay đổi" : "Tạo bộ từ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
