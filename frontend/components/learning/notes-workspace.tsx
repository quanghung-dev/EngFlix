"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CalendarDays,
  ExternalLink,
  Pencil,
  Search,
  Trash2,
} from "lucide-react"

import { AsyncContentState } from "@/components/product/async-content-state"
import { ProductPageHeader } from "@/components/product/page-header"
import { ProductReveal } from "@/components/product/product-reveal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useAuthenticatedUser } from "@/hooks/use-authenticated-user"
import { cn } from "@/lib/utils"
import {
  deleteBookmark,
  getAllBookmarks,
  updateBookmarkNote,
  type BookmarkType,
} from "@/services/bookmark.service"

const PAGE_SIZE = 6

function normalizeSearch(value: string) {
  return value.trim().toLocaleLowerCase("vi-VN")
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function NotesSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2" aria-hidden="true">
      {Array.from({ length: 4 }, (_, index) => (
        <Card key={index} variant="product" className="min-h-72 border-action-gold/15">
          <CardContent>
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="mt-6 h-6 w-full" />
            <Skeleton className="mt-3 h-6 w-4/5" />
            <Skeleton className="mt-8 h-16 w-full" />
            <Skeleton className="mt-8 h-4 w-1/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function NotesWorkspace() {
  const { user, resolved } = useAuthenticatedUser()
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<BookmarkType | null>(null)
  const [noteDraft, setNoteDraft] = useState("")
  const [editError, setEditError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<BookmarkType | null>(null)
  const [deletingPending, setDeletingPending] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!resolved || !user) return
    let active = true

    async function loadBookmarks() {
      setLoading(true)
      setError(null)
      try {
        const response = await getAllBookmarks()
        if (active) setBookmarks(response.data ?? [])
      } catch {
        if (active) setError("Không thể tải ghi chú lúc này. Nội dung của bạn vẫn an toàn; hãy thử lại sau.")
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadBookmarks()
    return () => {
      active = false
    }
  }, [reloadKey, resolved, user])

  const filteredBookmarks = useMemo(() => {
    const normalized = normalizeSearch(query)
    if (!normalized) return bookmarks
    return bookmarks.filter((bookmark) =>
      [
        bookmark.lesson_title,
        bookmark.original_content,
        bookmark.vietnamese_content,
        bookmark.note,
      ].some((value) => value?.toLocaleLowerCase("vi-VN").includes(normalized))
    )
  }, [bookmarks, query])

  const totalPages = Math.max(1, Math.ceil(filteredBookmarks.length / PAGE_SIZE))
  const visibleBookmarks = filteredBookmarks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function updateQuery(value: string) {
    setQuery(value)
    setPage(1)
  }

  function openEditor(bookmark: BookmarkType) {
    setEditing(bookmark)
    setNoteDraft(bookmark.note ?? "")
    setEditError(null)
  }

  async function saveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editing) return
    setSaving(true)
    setEditError(null)
    try {
      await updateBookmarkNote(editing.id, noteDraft.trim())
      setBookmarks((items) =>
        items.map((item) => (item.id === editing.id ? { ...item, note: noteDraft.trim() || null } : item))
      )
      setEditing(null)
      setFeedback("Đã lưu thay đổi ghi chú.")
    } catch {
      setEditError("Không thể lưu thay đổi. Nội dung bạn vừa nhập vẫn được giữ trong hộp thoại.")
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    setDeletingPending(true)
    setDeleteError(null)
    try {
      await deleteBookmark(deleting.id)
      setBookmarks((items) => items.filter((item) => item.id !== deleting.id))
      setDeleting(null)
      setDeleteError(null)
      setFeedback("Đã xóa ghi chú khỏi thư viện.")
    } catch {
      const message = "Không thể xóa ghi chú. Hãy thử lại."
      setDeleteError(message)
      setFeedback(message)
    } finally {
      setDeletingPending(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
      <ProductReveal eager>
        <ProductPageHeader
          title="Những câu đáng nhớ, ở cùng một nơi."
          description="Tìm lại câu thoại đã lưu, bổ sung ngữ cảnh của riêng bạn và quay về bài học khi cần luyện thêm."
          actions={
            <Link href="/topics" className={cn(buttonVariants({ variant: "product", size: "app" }))}>
              Khám phá bài học
              <ArrowRight aria-hidden="true" />
            </Link>
          }
          aside={
            <div className="rounded-panel border border-action-gold/20 bg-action-gold/10 px-5 py-4 text-action-gold">
              <p className="text-micro uppercase tracking-meta">Đã lưu</p>
              <p className="mt-1 text-3xl font-semibold text-foreground">{bookmarks.length}</p>
            </div>
          }
        />
      </ProductReveal>

      <ProductReveal delay={0.07} className="mt-8">
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-copy-muted" aria-hidden="true" />
          <Input
            type="search"
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            placeholder="Tìm theo câu, bài học, bản dịch hoặc ghi chú…"
            aria-label="Tìm trong ghi chú"
            className="h-12 rounded-nav bg-surface-panel pl-11"
          />
        </div>
        <p className="mt-3 text-sm text-copy-muted" aria-live="polite">
          {query ? `${filteredBookmarks.length} kết quả phù hợp` : "Tìm kiếm được thực hiện trên các ghi chú đã tải."}
        </p>
      </ProductReveal>

      <section aria-label="Danh sách ghi chú" className="mt-8" aria-busy={loading}>
        {!resolved ? (
          <NotesSkeleton />
        ) : !user ? (
          <AsyncContentState
            kind="empty"
            title="Đăng nhập để mở sổ tay"
            description="Ghi chú của bạn được đồng bộ theo tài khoản và chỉ bạn mới có thể xem."
            action={
              <Link href="/login" className={cn(buttonVariants({ variant: "product", size: "app" }))}>
                Đăng nhập
              </Link>
            }
          />
        ) : loading ? (
          <NotesSkeleton />
        ) : error ? (
          <AsyncContentState
            kind="error"
            title="Chưa thể mở sổ tay"
            description={error}
            onRetry={() => setReloadKey((key) => key + 1)}
          />
        ) : bookmarks.length === 0 ? (
          <AsyncContentState
            kind="empty"
            title="Sổ tay đang chờ câu đầu tiên"
            description="Trong Dictation hoặc Shadowing, hãy lưu một câu bạn muốn quay lại. Câu đó sẽ xuất hiện tại đây."
            icon={<Bookmark className="size-7" aria-hidden="true" />}
            action={
              <Link href="/topics" className={cn(buttonVariants({ variant: "product", size: "app" }))}>
                Chọn bài để luyện
              </Link>
            }
          />
        ) : visibleBookmarks.length === 0 ? (
          <AsyncContentState
            kind="empty"
            title="Không tìm thấy ghi chú phù hợp"
            description="Thử một từ khóa ngắn hơn hoặc xóa nội dung tìm kiếm để xem toàn bộ sổ tay."
            action={<Button variant="glass" size="app" onClick={() => updateQuery("")}>Xóa tìm kiếm</Button>}
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {visibleBookmarks.map((bookmark, index) => (
              <ProductReveal key={bookmark.id} delay={(index % PAGE_SIZE) * 0.07}>
                <Card variant="product" className="h-full min-h-72 border-action-gold/15 bg-action-gold/5 transition duration-300 hover:-translate-y-1 hover:border-action-gold/30 motion-reduce:transform-none">
                  <CardContent className="flex h-full flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <Link
                        href={`/lessons/${bookmark.lesson_id}/dictation`}
                        className="product-focus inline-flex min-h-11 items-center gap-2 rounded-control text-sm font-medium text-brand-cyan hover:underline"
                      >
                        {bookmark.lesson_title}
                        <ExternalLink className="size-4" aria-hidden="true" />
                      </Link>
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-micro text-copy-muted">
                        <CalendarDays className="size-3.5" aria-hidden="true" />
                        {formatDate(bookmark.created_at)}
                      </span>
                    </div>

                    <blockquote className="mt-5 text-balance text-xl font-semibold leading-8 text-action-gold">
                      “{bookmark.original_content}”
                    </blockquote>
                    {bookmark.phonetic_content && (
                      <p className="mt-2 text-xs leading-5 text-copy-muted">{bookmark.phonetic_content}</p>
                    )}
                    {bookmark.vietnamese_content && (
                      <p className="mt-4 rounded-panel border border-stroke-subtle bg-surface-inner px-4 py-3 text-sm leading-6 text-copy-secondary">
                        {bookmark.vietnamese_content}
                      </p>
                    )}

                    <div className="mt-auto border-t border-stroke-subtle pt-5">
                      <p className="text-micro uppercase tracking-meta text-copy-muted">Ghi chú của bạn</p>
                      <p className="mt-2 min-h-10 whitespace-pre-wrap text-sm leading-6 text-foreground">
                        {bookmark.note || <span className="italic text-copy-muted">Chưa có ghi chú riêng.</span>}
                      </p>
                      <div className="mt-4 flex justify-end gap-2">
                        <Button variant="ghost" size="icon-app" onClick={() => openEditor(bookmark)} aria-label={`Sửa ghi chú cho câu ${bookmark.original_content}`}>
                          <Pencil aria-hidden="true" />
                        </Button>
                        <Button variant="destructive" size="icon-app" onClick={() => { setDeleteError(null); setDeleting(bookmark) }} aria-label={`Xóa ghi chú cho câu ${bookmark.original_content}`}>
                          <Trash2 aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ProductReveal>
            ))}
          </div>
        )}
      </section>

      {!loading && !error && totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Phân trang ghi chú">
          <Button variant="glass" size="icon-app" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1} aria-label="Trang ghi chú trước">
            <ArrowLeft aria-hidden="true" />
          </Button>
          <span className="text-xs text-copy-muted">Trang {page}/{totalPages}</span>
          <Button variant="glass" size="icon-app" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page === totalPages} aria-label="Trang ghi chú tiếp theo">
            <ArrowRight aria-hidden="true" />
          </Button>
        </nav>
      )}

      <p className="sr-only" aria-live="polite">{feedback}</p>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && !saving && setEditing(null)}>
        <DialogContent className="rounded-panel border border-stroke bg-canvas-deep p-6 text-foreground shadow-modal sm:max-w-lg sm:p-8">
          <form onSubmit={saveNote}>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Cập nhật ghi chú</DialogTitle>
              <DialogDescription className="leading-6 text-copy-muted">
                Nội dung chỉ thay đổi sau khi lưu thành công. Nếu có lỗi, phần bạn đang viết sẽ được giữ lại.
              </DialogDescription>
            </DialogHeader>
            {editing && (
              <blockquote className="mt-5 rounded-panel border border-action-gold/15 bg-action-gold/5 p-4 text-sm leading-6 text-action-gold">
                “{editing.original_content}”
              </blockquote>
            )}
            <div className="mt-5 grid gap-2">
              <Label htmlFor="bookmark-note">Ghi chú của bạn</Label>
              <Textarea
                id="bookmark-note"
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                placeholder="Điều gì khiến câu này đáng nhớ?"
                maxLength={1000}
                className="min-h-32 bg-surface-panel"
                autoFocus
              />
            </div>
            {editError && <p role="alert" className="mt-4 rounded-control border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{editError}</p>}
            <DialogFooter className="mt-6 -mx-6 -mb-6 border-stroke bg-surface-inner/50 px-6 py-5 sm:-mx-8 sm:-mb-8 sm:px-8">
              <Button type="button" variant="glass" size="app" onClick={() => setEditing(null)} disabled={saving}>Hủy</Button>
              <Button type="submit" variant="product" size="app" disabled={saving}>{saving ? "Đang lưu…" : "Lưu ghi chú"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => {
        if (!open && !deletingPending) {
          setDeleting(null)
          setDeleteError(null)
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa ghi chú này?</AlertDialogTitle>
            <AlertDialogDescription>
              Câu đã lưu sẽ bị gỡ khỏi sổ tay. Thao tác này không xóa nội dung bài học gốc.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError ? <p role="alert" className="rounded-control border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{deleteError}</p> : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingPending}>Giữ lại</AlertDialogCancel>
            <AlertDialogAction variant="destructive" size="app" onClick={() => void confirmDelete()} disabled={deletingPending}>
              {deletingPending ? "Đang xóa…" : "Xóa ghi chú"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
