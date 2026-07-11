"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Notebook,
  Edit2,
  Trash2,
  X,
  Plus,
  Bookmark,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Info,
  Calendar,
  AlertTriangle,
  FileText
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { getAllBookmarks, updateBookmarkNote, deleteBookmark, BookmarkType } from "@/services/bookmark.service"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function NotesPage() {
  const router = useRouter()

  // State dữ liệu ghi chú
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State Modal chỉnh sửa ghi chú
  const [editingBookmark, setEditingBookmark] = useState<BookmarkType | null>(null)
  const [editingNoteText, setEditingNoteText] = useState("")
  const [savingNote, setSavingNote] = useState(false)

  // Khởi tạo và tải ghi chú
  useEffect(() => {
    let isActive = true

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (isActive) {
          router.push("/login")
        }
        return
      }

      try {
        setLoading(true)
        setError(null)

        const res = await getAllBookmarks()
        if (!isActive) return

        const data = res.data || []
        setBookmarks(data)
        setLoading(false)
      } catch (err) {
        console.error("Lỗi tải danh sách ghi chú:", err)
        if (isActive) {
          setError("Không thể tải danh sách ghi chú câu. Vui lòng tải lại trang.")
          setLoading(false)
        }
      }
    })

    return () => {
      isActive = false
      unsubscribe()
    }
  }, [])

  // Định dạng thời gian theo chuẩn screenshot (E.g. May 29, 2026 07:43)
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString)
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const month = months[date.getMonth()]
      const day = date.getDate()
      const year = date.getFullYear()
      const hours = String(date.getHours()).padStart(2, "0")
      const minutes = String(date.getMinutes()).padStart(2, "0")
      return `${month} ${day}, ${year} ${hours}:${minutes}`
    } catch (e) {
      return isoString
    }
  }

  // Mở modal chỉnh sửa ghi chú
  const handleOpenEdit = (bookmark: BookmarkType) => {
    setEditingBookmark(bookmark)
    setEditingNoteText(bookmark.note || "")
  }

  // Thực hiện lưu ghi chú sau khi sửa
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBookmark) return

    setSavingNote(true)
    try {
      // Gọi API backend thực tế
      await updateBookmarkNote(editingBookmark.id, editingNoteText.trim())
      setBookmarks((prev) =>
        prev.map((b) =>
          b.id === editingBookmark.id ? { ...b, note: editingNoteText.trim() } : b
        )
      )
      setEditingBookmark(null)
    } catch (err) {
      console.error("Lỗi cập nhật ghi chú:", err)
      alert("Không thể lưu thay đổi ghi chú.")
    } finally {
      setSavingNote(false)
    }
  }

  // Xóa ghi chú (bỏ bookmark)
  const handleDeleteNote = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa ghi chú câu này không?")) return

    try {
      await deleteBookmark(id)
      setBookmarks((prev) => prev.filter((b) => b.id !== id))
    } catch (err) {
      console.error("Lỗi xóa ghi chú:", err)
      alert("Xóa ghi chú thất bại.")
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-canvas p-6 text-white overflow-y-auto">
      
      {/* Header trang ghi chú */}
      <div className="flex items-center gap-4 pb-6 border-b border-stroke mb-8">
        <div className="size-14 relative shrink-0">
          <Image
            src="/owl-speaking-cinematic.webp"
            alt="EngFlex Owl"
            width={56}
            height={56}
            className="size-full object-contain"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Ghi chú của tôi
          </h1>
          <p className="text-xs text-copy-muted mt-1">
            Tất cả ghi chú câu của bạn ở một nơi
          </p>
        </div>
      </div>

      {/* Hiển thị Loading / Lỗi */}
      {loading ? (
        <div className="flex h-60 flex-col items-center justify-center gap-4 text-copy-secondary">
          <div className="size-8 animate-spin rounded-full border-4 border-brand-cyan border-t-transparent" />
          <p className="font-mono text-xs text-brand-cyan uppercase tracking-widest animate-pulse">
            Đang tải ghi chú...
          </p>
        </div>
      ) : error ? (
        <div className="flex h-60 flex-col items-center justify-center text-center gap-4 max-w-md mx-auto">
          <AlertTriangle className="size-12 text-destructive" />
          <h3 className="font-semibold text-lg">Đã có lỗi xảy ra</h3>
          <p className="text-xs text-copy-muted leading-relaxed">{error}</p>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="flex h-60 flex-col items-center justify-center text-center gap-4 max-w-sm mx-auto">
          <Notebook className="size-16 text-copy-subtle/30" />
          <h3 className="text-base font-semibold text-copy-secondary">Chưa có ghi chú nào</h3>
          <p className="text-xs text-copy-muted">
            Khi học bài ở trang Dictation hay Shadowing, bạn hãy nhấn nút Lưu/Bookmark các câu thoại khó để quản lý ghi chú tại đây.
          </p>
        </div>
      ) : (
        /* Grid danh sách Ghi chú Câu (Yellow/Gold Cards) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="rounded-panel border border-[#eab308]/20 bg-[#eab308]/5 p-5 flex flex-col justify-between shadow-card hover:border-[#eab308]/40 hover:bg-[#eab308]/10 transition-all duration-300 relative group min-h-[220px]"
            >
              
              {/* Liên kết bài học ở đầu card */}
              <Link
                href={`/lessons/${bookmark.lesson_id}/dictation`}
                className="text-[11px] font-semibold text-brand-cyan hover:underline inline-flex items-center gap-1 mb-2 max-w-fit"
                title="Vào học câu thoại này"
              >
                {bookmark.lesson_title} <ExternalLink className="size-3" />
              </Link>

              {/* Câu tiếng Anh gốc */}
              <h3 className="text-base font-bold text-[#fef08a] leading-snug">
                {bookmark.original_content}
              </h3>

              {/* Phiên âm IPA */}
              {bookmark.phonetic_content && (
                <p className="font-mono text-xs text-copy-muted mt-1">
                  {bookmark.phonetic_content}
                </p>
              )}

              {/* Khung chứa dịch nghĩa tiếng Việt (Rounded bubble) */}
              {bookmark.vietnamese_content && (
                <div className="my-3 rounded-full border border-[#eab308]/10 bg-canvas-deep/60 px-4 py-2 text-xs text-[#fef08a]/80 break-words leading-relaxed max-w-fit">
                  {bookmark.vietnamese_content}
                </div>
              )}

              {/* Vùng ghi chú riêng */}
              <div className="border-t border-[#eab308]/10 pt-3 mt-auto flex items-end justify-between">
                <div className="space-y-1 pr-4">
                  <span className="text-[10px] font-mono text-copy-muted block">Ghi chú:</span>
                  <p className="text-xs text-white leading-relaxed break-all">
                    {bookmark.note || <span className="italic text-copy-muted">Trống</span>}
                  </p>
                </div>

                {/* Các nút chỉnh sửa / xóa */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(bookmark)}
                    className="size-8 rounded-full border border-[#eab308]/20 bg-surface-panel flex items-center justify-center text-[#eab308] hover:bg-[#eab308]/15 transition"
                    title="Chỉnh sửa ghi chú"
                  >
                    <Edit2 className="size-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(bookmark.id)}
                    className="size-8 rounded-full border border-destructive/20 bg-surface-panel flex items-center justify-center text-destructive hover:bg-destructive/15 transition"
                    title="Xóa ghi chú"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Thời gian ghi chú */}
              <div className="text-[9px] font-mono text-copy-muted mt-3">
                {formatTime(bookmark.created_at)}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* MODAL CHỈNH SỬA GHI CHÚ */}
      {editingBookmark && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={handleSaveNote}
            className="w-full max-w-md rounded-panel border border-stroke bg-canvas-deep p-6 text-white shadow-modal mx-4 relative animate-scale-in"
          >
            <button
              type="button"
              onClick={() => setEditingBookmark(null)}
              className="absolute right-4 top-4 p-1.5 rounded-full border border-stroke-strong bg-surface-inner text-copy-subtle hover:text-white transition"
            >
              <X className="size-4" />
            </button>

            <h3 className="text-base font-semibold font-mono tracking-wide uppercase text-brand-cyan mb-4 flex items-center gap-1.5">
              <Notebook className="size-4" /> Cập nhật ghi chú câu
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-copy-secondary font-medium">Nội dung câu</label>
                <p className="text-xs text-copy-muted italic leading-relaxed bg-surface-panel p-3 rounded-control border border-stroke">
                  “{editingBookmark.original_content}”
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-copy-secondary font-medium">Ghi chú của bạn</label>
                <textarea
                  required
                  placeholder="Nhập ghi chú cá nhân của bạn cho câu này..."
                  value={editingNoteText}
                  onChange={(e) => setEditingNoteText(e.target.value)}
                  className="w-full p-3 bg-surface-panel border border-stroke text-xs text-white rounded-control h-24 outline-none focus:border-brand-cyan transition"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-stroke pt-4">
              <Button
                type="button"
                variant="glass"
                onClick={() => setEditingBookmark(null)}
                className="font-mono text-xs uppercase"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="product"
                disabled={savingNote}
                className="font-mono text-xs uppercase"
              >
                {savingNote ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </div>
      )}

    </div>
  )
}
