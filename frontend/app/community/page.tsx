"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Globe,
  Heart,
  MessageCircle,
  Send,
  Trash2,
  Image as ImageIcon,
  RotateCw,
  Plus,
  ShieldCheck,
  Crown,
  Award,
  Calendar,
  User,
  ArrowRight
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import {
  getPostsFeed,
  createPost,
  deletePost,
  toggleLikePost,
  getPostComments,
  createComment,
  PostType,
  CommentType
} from "@/services/post.service"

export default function CommunityPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)

  // State bài viết
  const [posts, setPosts] = useState<PostType[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // State nhập bài viết mới
  const [newContent, setNewContent] = useState("")
  const [newImageUrl, setNewImageUrl] = useState("")
  const [showImageInput, setShowImageInput] = useState(false)

  // State quản lý bình luận cho từng bài viết (key: postId)
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({})
  const [commentsData, setCommentsData] = useState<Record<number, CommentType[]>>({})
  const [commentsLoading, setCommentsLoading] = useState<Record<number, boolean>>({})
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({})

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

  // Tải danh sách bài đăng cộng đồng
  const loadPosts = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      const res = await getPostsFeed()
      setPosts(res.data || [])
    } catch (err) {
      console.error("Lỗi tải bảng tin cộng đồng:", err)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) {
      void loadPosts(true)
    }
  }, [currentUser])

  // Đăng bài viết mới
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newContent.trim() || submitting) return

    setSubmitting(true)
    try {
      const res = await createPost({
        content: newContent.trim(),
        imageUrl: newImageUrl.trim() || null
      })
      if (res.data) {
        setPosts((prev) => [res.data, ...prev])
        setNewContent("")
        setNewImageUrl("")
        setShowImageInput(false)
      }
    } catch (err) {
      console.error("Lỗi đăng bài viết:", err)
      alert("Đăng bài viết thất bại.")
    } finally {
      setSubmitting(false)
    }
  }

  // Xóa bài viết
  const handleDeletePost = async (postId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return

    try {
      await deletePost(postId)
      setPosts((prev) => prev.filter((p) => p.id !== postId))
    } catch (err) {
      console.error("Lỗi xóa bài viết:", err)
      alert("Xóa bài viết thất bại.")
    }
  }

  // Thích hoặc hủy thích bài viết
  const handleLikePost = async (postId: number) => {
    try {
      const res = await toggleLikePost(postId)
      if (res.data) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, is_liked: res.data.is_liked, likes_count: res.data.likes_count }
              : p
          )
        )
      }
    } catch (err) {
      console.error("Lỗi like bài viết:", err)
    }
  }

  // Bật/tắt xem bình luận của 1 bài đăng
  const toggleComments = async (postId: number) => {
    const isExpanded = !!expandedComments[postId]
    setExpandedComments((prev) => ({ ...prev, [postId]: !isExpanded }))

    // Nếu chưa mở bình luận và chưa tải dữ liệu, tiến hành tải
    if (!isExpanded && !commentsData[postId]) {
      await loadComments(postId)
    }
  }

  // Tải danh sách bình luận của bài viết
  const loadComments = async (postId: number) => {
    setCommentsLoading((prev) => ({ ...prev, [postId]: true }))
    try {
      const res = await getPostComments(postId)
      setCommentsData((prev) => ({ ...prev, [postId]: res.data || [] }))
    } catch (err) {
      console.error(`Lỗi tải bình luận bài viết ${postId}:`, err)
    } finally {
      setCommentsLoading((prev) => ({ ...prev, [postId]: false }))
    }
  }

  // Gửi bình luận mới
  const handleSendComment = async (postId: number, e: React.FormEvent) => {
    e.preventDefault()
    const text = commentInputs[postId]?.trim()
    if (!text) return

    // Xóa input text trước
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }))

    try {
      const res = await createComment(postId, text)
      if (res.data) {
        setCommentsData((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), res.data]
        }))
        // Cập nhật số lượng bình luận hiển thị trên bài viết
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p
          )
        )
      }
    } catch (err) {
      console.error("Lỗi gửi bình luận:", err)
      alert("Bình luận thất bại.")
    }
  }

  // Trả về icon huy hiệu tương ứng
  const renderBadge = (badgeType: "verify" | "medal" | "crown" | "none") => {
    switch (badgeType) {
      case "verify":
        return (
          <span title="Người dùng xác thực">
            <ShieldCheck className="size-3.5 text-brand-cyan fill-brand-cyan/10" />
          </span>
        )
      case "crown":
        return (
          <span title="Học viên Vip">
            <Crown className="size-3.5 text-[#f7c76f]" />
          </span>
        )
      case "medal":
        return (
          <span title="Top tuần">
            <Award className="size-3.5 text-[#9af7c5]" />
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-canvas p-6 text-white overflow-y-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-stroke mb-8">
        <div className="size-14 relative shrink-0">
          <Image
            src="/owl-writing-cinematic.webp"
            alt="EngFlex Owl"
            width={56}
            height={56}
            className="size-full object-contain"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Cộng đồng EngFlex
          </h1>
          <p className="text-xs text-copy-muted mt-1">
            Chia sẻ cảm nghĩ, kinh nghiệm và giao lưu cùng các học viên khác
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* BOX ĐĂNG BÀI VIẾT MỚI (CREATE POST BOX) */}
        {currentUser && (
          <form
            onSubmit={handleCreatePost}
            className="rounded-panel border border-stroke bg-surface-panel p-5 space-y-4 shadow-card"
          >
            <div className="flex gap-3">
              <div className="size-10 rounded-full border border-stroke-strong bg-surface-inner flex items-center justify-center font-bold text-brand-cyan shrink-0">
                {currentUser.displayName?.charAt(0).toUpperCase() || currentUser.email?.charAt(0).toUpperCase()}
              </div>
              <textarea
                required
                placeholder="Bạn đang nghĩ gì thế? Chia sẻ tiến độ học tập nào..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="flex-1 min-h-[80px] bg-transparent text-sm text-white placeholder:text-copy-subtle outline-none resize-none"
              />
            </div>

            {/* Dòng đính kèm ảnh bằng URL */}
            {showImageInput && (
              <div className="pl-13 animate-fade-in">
                <Input
                  placeholder="Dán đường dẫn ảnh URL (E.g. https://.../image.jpg)"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="bg-surface-inner border-stroke text-xs rounded-control h-10"
                />
              </div>
            )}

            {/* Chân Box gửi bài */}
            <div className="border-t border-stroke/40 pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                className={cn(
                  "flex items-center gap-1.5 text-xs text-copy-muted hover:text-white transition",
                  showImageInput && "text-brand-cyan"
                )}
              >
                <ImageIcon className="size-4" /> Đính kèm ảnh
              </button>

              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  variant="product"
                  disabled={submitting || !newContent.trim()}
                  className="h-9 px-5 font-mono text-xs uppercase gap-1.5"
                >
                  <Send className="size-3.5" /> {submitting ? "Đang đăng..." : "Đăng bài"}
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* NÚT LÀM MỚI BẢNG TIN */}
        <div className="flex justify-end">
          <Button
            variant="glass"
            size="sm"
            onClick={() => void loadPosts(true)}
            className="font-mono text-[10px] uppercase gap-1"
          >
            <RotateCw className="size-3" /> Tải lại bảng tin
          </Button>
        </div>

        {/* FEED BÀI VIẾT (POSTS LIST) */}
        {loading ? (
          <div className="flex h-40 flex-col items-center justify-center gap-3 text-copy-secondary">
            <div className="size-6 animate-spin rounded-full border-4 border-brand-cyan border-t-transparent" />
            <span className="font-mono text-xs uppercase tracking-widest text-brand-cyan animate-pulse">
              Đang tải bảng tin...
            </span>
          </div>
        ) : posts.length === 0 ? (
          <div className="h-60 flex flex-col items-center justify-center text-center text-copy-muted text-xs gap-3">
            <Globe className="size-12 text-copy-subtle/30" />
            Bảng tin trống. Hãy là người đầu tiên chia sẻ cảm nghĩ của bạn!
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => {
              const isOwnPost = post.user_id === currentUser?.uid
              return (
                <div
                  key={post.id}
                  className="rounded-panel border border-stroke bg-surface-panel p-5 flex flex-col gap-4 shadow-card hover:border-stroke-strong transition duration-300 animate-fade-in"
                >
                  
                  {/* Header bài đăng (Tác giả) */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      
                      {/* Avatar tác giả -> Click dẫn về trang cá nhân */}
                      <Link
                        href={`/profile/${post.user_id}`}
                        className="relative shrink-0 cursor-pointer hover:brightness-110 transition"
                        title={`Xem trang cá nhân của ${post.username}`}
                      >
                        <div className="size-10 rounded-full border border-stroke-strong overflow-hidden bg-surface-inner flex items-center justify-center font-bold text-copy-secondary">
                          {post.avatar_url ? (
                            <img src={post.avatar_url} alt="" className="size-full object-cover" />
                          ) : (
                            post.username.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-surface-panel border border-stroke px-1.5 py-0.5 rounded text-[8px] font-mono font-bold text-status-success scale-90">
                          Lv.{post.level}
                        </div>
                      </Link>

                      {/* Tên và thời gian đăng */}
                      <div>
                        <Link
                          href={`/profile/${post.user_id}`}
                          className="font-bold text-sm text-white hover:text-brand-cyan hover:underline transition flex items-center gap-1.5"
                        >
                          {post.username}
                          {renderBadge(post.badge_type)}
                        </Link>
                        <span className="text-[10px] text-copy-muted font-mono block mt-0.5">
                          {new Date(post.created_at).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>

                    </div>

                    {/* Nút xoá (chỉ hiển thị nếu là bài viết của chính mình) */}
                    {isOwnPost && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 rounded-full border border-stroke-strong bg-surface-inner text-copy-subtle hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition shrink-0"
                        title="Xoá bài viết"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Nội dung bài viết */}
                  <p className="text-sm text-copy-secondary leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>

                  {/* Hình ảnh đính kèm (nếu có) */}
                  {post.image_url && (
                    <div className="relative rounded-card overflow-hidden border border-stroke-strong max-h-[350px] bg-canvas-deep">
                      <img
                        src={post.image_url}
                        alt="Đính kèm"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Ẩn ảnh nếu đường dẫn URL bị lỗi
                          (e.target as HTMLImageElement).style.display = "none"
                        }}
                      />
                    </div>
                  )}

                  {/* Thanh tương tác ở chân bài viết (Like / Comment) */}
                  <div className="border-t border-stroke/40 pt-3 flex items-center gap-4">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className={cn(
                        "flex items-center gap-1.5 text-xs font-mono transition",
                        post.is_liked
                          ? "text-brand-cyan font-bold"
                          : "text-copy-muted hover:text-white"
                      )}
                    >
                      <Heart className={cn("size-4", post.is_liked && "fill-brand-cyan/20")} />
                      <span>{post.likes_count}</span> Thích
                    </button>

                    <button
                      onClick={() => toggleComments(post.id)}
                      className={cn(
                        "flex items-center gap-1.5 text-xs font-mono transition",
                        expandedComments[post.id]
                          ? "text-brand-cyan font-bold"
                          : "text-copy-muted hover:text-white"
                      )}
                    >
                      <MessageCircle className="size-4" />
                      <span>{post.comments_count}</span> Bình luận
                    </button>
                  </div>

                  {/* PHẦN BÌNH LUẬN CHI TIẾT (COMMENT BOX) */}
                  {expandedComments[post.id] && (
                    <div className="border-t border-stroke/30 pt-4 mt-2 space-y-4 animate-fade-in">
                      
                      {/* Danh sách bình luận đã viết */}
                      {commentsLoading[post.id] ? (
                        <div className="flex justify-center py-4">
                          <div className="size-5 animate-spin rounded-full border-2 border-brand-cyan border-t-transparent" />
                        </div>
                      ) : (
                        <div className="space-y-3 pl-3 border-l border-stroke">
                          {(commentsData[post.id] || []).length === 0 ? (
                            <p className="text-[11px] text-copy-muted italic">Chưa có bình luận nào.</p>
                          ) : (
                            (commentsData[post.id] || []).map((comment) => (
                              <div key={comment.id} className="flex gap-2.5 items-start text-xs animate-fade-in">
                                <Link href={`/profile/${comment.user_id}`} className="shrink-0">
                                  <div className="size-7 rounded-full border border-stroke-strong bg-surface-inner flex items-center justify-center font-bold text-[10px] text-copy-secondary">
                                    {comment.avatar_url ? (
                                      <img src={comment.avatar_url} alt="" className="size-full rounded-full object-cover" />
                                    ) : (
                                      comment.username.charAt(0).toUpperCase()
                                    )}
                                  </div>
                                </Link>
                                <div className="flex-1 bg-canvas-deep/80 rounded-card p-2.5 border border-stroke-subtle">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-white flex items-center gap-1">
                                      {comment.username}
                                      {renderBadge(comment.badge_type)}
                                      <span className="text-[8px] font-mono font-bold text-status-success bg-surface-panel px-1 py-0.5 rounded">Lv.{comment.level}</span>
                                    </span>
                                    <span className="text-[8px] text-copy-muted font-mono">
                                      {new Date(comment.created_at).toLocaleDateString("vi-VN", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-copy-secondary leading-relaxed">{comment.content}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {/* Khung soạn thảo bình luận */}
                      <form
                        onSubmit={(e) => handleSendComment(post.id, e)}
                        className="flex gap-2 pl-3"
                      >
                        <Input
                          placeholder="Viết bình luận của bạn..."
                          value={commentInputs[post.id] || ""}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                          }
                          className="bg-surface-inner border-stroke text-xs rounded-control h-9 flex-1"
                        />
                        <Button
                          type="submit"
                          variant="product"
                          disabled={!(commentInputs[post.id] || "").trim()}
                          className="h-9 px-4 font-mono text-xs uppercase"
                        >
                          Gửi
                        </Button>
                      </form>

                    </div>
                  )}

                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
