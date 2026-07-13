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
import { Textarea } from "@/components/ui/textarea"
import type { VocabularyItemType } from "@/types/vocabulary"

export interface ItemFormValues {
  phrase: string
  normalized_phrase: string
  meaning: string
  example_sentence?: string
  note?: string
  lesson_id?: number
  transcript_id?: number
}

interface ItemFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialItem?: VocabularyItemType | null
  pending: boolean
  error: string | null
  onSubmit: (values: ItemFormValues) => Promise<void>
}

export function ItemFormDialog({
  open,
  onOpenChange,
  initialItem,
  pending,
  error,
  onSubmit,
}: ItemFormDialogProps) {
  const [phrase, setPhrase] = useState("")
  const [meaning, setMeaning] = useState("")
  const [note, setNote] = useState("")
  const [example, setExample] = useState("")

  useEffect(() => {
    if (!open) return
    const syncId = window.setTimeout(() => {
      setPhrase(initialItem?.phrase ?? "")
      setMeaning(initialItem?.meaning ?? "")
      setNote(initialItem?.note ?? "")
      setExample(initialItem?.example_sentence ?? "")
    }, 0)
    return () => window.clearTimeout(syncId)
  }, [initialItem, open])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanPhrase = phrase.trim()
    if (!cleanPhrase || !meaning.trim()) return

    await onSubmit({
      phrase: cleanPhrase,
      normalized_phrase: cleanPhrase.toLocaleLowerCase("en-US"),
      meaning: meaning.trim(),
      note: note.trim() || undefined,
      example_sentence: example.trim() || undefined,
      lesson_id: initialItem?.lesson_id ?? undefined,
      transcript_id: initialItem?.transcript_id ?? undefined,
    })
  }

  const isEditing = Boolean(initialItem)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto rounded-panel border border-stroke bg-canvas-deep p-6 text-foreground shadow-modal sm:max-w-lg sm:p-8">
        <form onSubmit={handleSubmit} aria-busy={pending}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {isEditing ? "Chỉnh sửa từ vựng" : "Thêm từ vào bộ"}
            </DialogTitle>
            <DialogDescription className="leading-6 text-copy-muted">
              Cung cấp nghĩa rõ ràng và một câu ví dụ để lần ôn sau có đủ ngữ cảnh.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="vocabulary-phrase">Từ hoặc cụm từ tiếng Anh</Label>
              <Input
                id="vocabulary-phrase"
                value={phrase}
                onChange={(event) => setPhrase(event.target.value)}
                placeholder="Ví dụ: follow through"
                maxLength={180}
                required
                autoFocus
                className="h-11 bg-surface-panel"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="vocabulary-meaning">Nghĩa tiếng Việt</Label>
              <Input
                id="vocabulary-meaning"
                value={meaning}
                onChange={(event) => setMeaning(event.target.value)}
                placeholder="Ví dụ: theo đuổi đến cùng"
                maxLength={300}
                required
                className="h-11 bg-surface-panel"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="vocabulary-note">Phiên âm / ghi chú ngắn</Label>
              <Input
                id="vocabulary-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="/ˈfɒləʊ θruː/ · phrasal verb"
                maxLength={300}
                className="h-11 bg-surface-panel"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="vocabulary-example">Câu ví dụ</Label>
              <Textarea
                id="vocabulary-example"
                value={example}
                onChange={(event) => setExample(event.target.value)}
                placeholder="She always follows through on her promises."
                maxLength={800}
                className="min-h-24 bg-surface-panel"
              />
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
            <Button type="submit" variant="product" size="app" disabled={pending || !phrase.trim() || !meaning.trim()}>
              {pending ? "Đang lưu…" : isEditing ? "Lưu thay đổi" : "Thêm từ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
