"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import {
  User,
  Heart,
  MessageCircle,
  RotateCw,
  Trash2,
  Users,
  MessageSquare,
  UserPlus,
  Check,
  UserMinus,
  ChevronLeft,
  Calendar,
  Globe,
  Award,
  Crown,
  ShieldCheck,
  Send
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { getUserPosts, deletePost, toggleLikePost, getPostComments, createComment, PostType, CommentType } from "@/services/post.service"
import { getFriends, getIncomingRequests, sendFriendRequest, acceptFriendRequest, declineOrRemoveFriend } from "@/services/friendship.service"

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const targetUserId = params.userId as string

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // State các bài viết trên tường
  const [posts, setPosts] = useState<PostType[]>([])
  
  // Thông tin người dùng của trang cá nhân này
  const [profileInfo, setProfileInfo] = useState<{
    username: string
    avatarUrl: string | null
    level: number
    badgeType: "verify" | "medal" | "crown" | "none"
  } | null>(null)

  // Quan hệ bạn bè với chủ nhà (nếu chủ nhà không phải là tôi)
  const [friendshipStatus, setFriendshipStatus] = useState<"none" | "pending_sent" | "pending_received" | "accepted">("none")
  const [friendshipId, setFriendshipId] = useState<number | null>(null)

  // Quản lý bình luận
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

  // Tải dữ liệu tường nhà
  const loadProfileData = async () => {
    if (!currentUser) return
    try {
      setLoading(true)

      // 1. Tải danh sách bài đăng của user này
      const postsRes = await getUserPosts(targetUserId)
      const userPosts = postsRes.data || []
      setPosts(userPosts)

      // 2. Cập nhật thông tin profile của chủ nhà (lấy từ bài viết đầu tiên)
      if (userPosts.length > 0) {
        const firstPost = userPosts[0]
        setProfileInfo({
          username: firstPost.username,
          avatarUrl: firstPost.avatar_url,
          level: firstPost.level,
          badgeType: firstPost.badge_type
        })
      } else {
        // Fallback placeholder nếu user chưa đăng bài nào
        setProfileInfo({
          username: targetUserId === currentUser.uid ? (currentUser.displayName || "Bạn") : "Học viên EngFlex",
          avatarUrl: targetUserId === currentUser.uid ? currentUser.photoURL : null,
          level: targetUserId === currentUser.uid ? 15 : 5,
          badgeType: "none"
        })
      }

      // 3. Nếu là xem tường nhà người khác, kiểm tra quan hệ bạn bè
      if (targetUserId !== currentUser.uid) {
        const [friendsRes, requestsRes] = await Promise.all([
          getFriends(),
          getIncomingRequests()
        ])

        const friendList = friendsRes.data || []
        const incomingReqs = requestsRes.data || []

        const friendRecord = friendList.find((f) => f.user_id === targetUserId)
        const incomingRecord = incomingReqs.find((r) => r.user_id === targetUserId)

        if (friendRecord) {
          setFriendshipStatus("accepted")
          setFriendshipId(friendRecord.friendship_id)
        } else if (incomingRecord) {
          setFriendshipStatus("pending_received")
          setFriendshipId(incomingRecord.friendship_id)
        } else {
          setFriendshipStatus("none")
          setFriendshipId(null)
        }
      }
    } catch (err) {
      console.error("Lỗi tải thông tin tường cá nhân:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) {
      void loadProfileData()
    }
  }, [currentUser, targetUserId])

  // Gửi lời mời kết bạn
  const handleAddFriend = async () => {
    try {
      await sendFriendRequest(targetUserId)
      setFriendshipStatus("pending_sent")
    } catch (err) {
      console.error("Lỗi kết bạn:", err)
    }
  }

  // Chấp nhận lời mời kết bạn
  const handleAcceptFriend = async () => {
    if (!friendshipId) return
    try {
      await acceptFriendRequest(friendshipId)
      setFriendshipStatus("accepted")
      void loadProfileData()
    } catch (err) {
      console.error("Lỗi chấp nhận kết bạn:", err)
    }
  }

  // Huỷ kết bạn
  const handleUnfriend = async () => {
    if (!friendshipId || !profileInfo) return
    if (!confirm(`Huỷ kết bạn với ${profileInfo.username}?`)) return

    try {
      await declineOrRemoveFriend(friendshipId)
      setFriendshipStatus("none")
      setFriendshipId(null)
      void loadProfileData()
    } catch (err) {
      console.error("Lỗi huỷ kết bạn:", err)
    }
  }

  // Xoá bài viết
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

  // Thích bài viết
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

  // Quản lý bình luận
  const toggleComments = async (postId: number) => {
    const isExpanded = !!expandedComments[postId]
    setExpandedComments((prev) => ({ ...prev, [postId]: !isExpanded }))

    if (!isExpanded && !commentsData[postId]) {
      await loadComments(postId)
    }
  }

  const loadComments = async (postId: number) => {
    setCommentsLoading((prev) => ({ ...prev, [postId]: true }))
    try {
      const res = await getPostComments(postId)
      setCommentsData((prev) => ({ ...prev, [postId]: res.data || [] }))
    } catch (err) {
      console.error(`Lỗi tải bình luận ${postId}:`, err)
    } finally {
      setCommentsLoading((prev) => ({ ...prev, [postId]: false }))
    }
  }

  const handleSendComment = async (postId: number, e: React.FormEvent) => {
    e.preventDefault()
    const text = commentInputs[postId]?.trim()
    if (!text) return

    setCommentInputs((prev) => ({ ...prev, [postId]: "" }))

    try {
      const res = await createComment(postId, text)
      if (res.data) {
        setCommentsData((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), res.data]
        }))
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p
          )
        )
      }
    } catch (err) {
      console.error("Lỗi gửi bình luận:", err)
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

  const isMe = targetUserId === currentUser?.uid

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-canvas p-6 text-white overflow-y-auto">
      
      {/* Nút quay lại bảng tin */}
      <div className="mb-6">
        <Link
          href="/community"
          className="text-xs font-mono text-copy-muted hover:text-brand-cyan flex items-center gap-1.5 transition max-w-fit"
        >
          <ChevronLeft className="size-4" /> Quay lại Cộng đồng
        </Link>
      </div>

      {loading || !profileInfo ? (
        <div className="flex h-60 flex-col items-center justify-center gap-4 text-copy-secondary">
          <div className="size-8 animate-spin rounded-full border-4 border-brand-cyan border-t-transparent" />
          <p className="font-mono text-xs text-brand-cyan uppercase tracking-widest animate-pulse">
            Đang tải hồ sơ...
          </p>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* PROFILE SUMMARY HEADER CARD */}
          <div className="rounded-panel border border-stroke bg-surface-panel p-6 shadow-card flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              
              {/* Avatar lớn */}
              <div className="size-20 rounded-full border-2 border-brand-cyan/40 bg-brand-cyan/10 flex items-center justify-center font-bold text-3xl text-brand-cyan shadow-[0_0_30px_rgba(110,231,242,0.15)] shrink-0">
                {profileInfo.avatarUrl ? (
                  <img src={profileInfo.avatarUrl} alt="" className="size-full rounded-full object-cover" />
                ) : (
                  profileInfo.username.charAt(0).toUpperCase()
                )}
              </div>

              {/* Tên & Level */}
              <div>
                <h2 className="text-xl font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                  {profileInfo.username}
                  {renderBadge(profileInfo.badgeType)}
                </h2>
                <Badge variant="success" className="font-mono text-[9px] uppercase tracking-wider mt-1 px-2.5 py-0.5">
                  LEVEL {profileInfo.level}
                </Badge>
                
                <span className="text-xs text-copy-muted font-mono block mt-2">
                  Vai trò: Học viên EngFlex
                </span>
              </div>
            </div>

            {/* Các hành động Bạn bè (chỉ hiển thị nếu không phải của tôi) */}
            {!isMe && (
              <div className="flex items-center gap-2 shrink-0">
                {friendshipStatus === "none" && (
                  <Button
                    variant="product"
                    size="sm"
                    onClick={handleAddFriend}
                    className="font-mono text-[10px] uppercase gap-1"
                  >
                    <UserPlus className="size-3.5" /> Kết bạn
                  </Button>
                )}
                {friendshipStatus === "pending_sent" && (
                  <Button
                    variant="glass"
                    size="sm"
                    disabled
                    className="font-mono text-[10px] uppercase cursor-not-allowed opacity-75"
                  >
                    Đã gửi yêu cầu
                  </Button>
                )}
                {friendshipStatus === "pending_received" && (
                  <Button
                    variant="product"
                    size="sm"
                    onClick={handleAcceptFriend}
                    className="font-mono text-[10px] uppercase gap-1"
                  >
                    <Check className="size-3.5" /> Đồng ý kết bạn
                  </Button>
                )}
                {friendshipStatus === "accepted" && (
                  <>
                    <Link href="/chat">
                      <Button
                        variant="product"
                        size="sm"
                        className="font-mono text-[10px] uppercase gap-1"
                      >
                        <MessageSquare className="size-3.5" /> Nhắn tin
                      </Button>
                    </Link>
                    <Button
                      variant="glass"
                      size="icon-sm"
                      onClick={handleUnfriend}
                      className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive/40"
                      title="Hủy kết bạn"
                    >
                      <UserMinus className="size-3.5" />
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Nếu là của tôi */}
            {isMe && (
              <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wide px-3 py-1 text-brand-cyan border-brand-cyan/20 bg-brand-cyan/5">
                Tường nhà của bạn
              </Badge>
            )}
          </div>

          {/* Dòng phân cách bài đăng */}
          <div className="border-b border-stroke pb-3 flex items-center gap-2 text-sm font-semibold text-copy-secondary">
            <Globe className="size-4 text-brand-cyan" />
            Bài viết đã chia sẻ ({posts.length})
          </div>

          {/* LIST BÀI VIẾT CỦA USER NÀY (WALL FEED) */}
          {posts.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-center text-copy-muted text-xs gap-2">
              <User className="size-10 text-copy-subtle/30" />
              Học viên chưa chia sẻ bài đăng nào trên cộng đồng.
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
                    
                    {/* Header bài đăng */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full border border-stroke-strong overflow-hidden bg-surface-inner flex items-center justify-center font-bold text-copy-secondary shrink-0">
                          {profileInfo.avatarUrl ? (
                            <img src={profileInfo.avatarUrl} alt="" className="size-full object-cover" />
                          ) : (
                            profileInfo.username.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                            {profileInfo.username}
                            {renderBadge(profileInfo.badgeType)}
                          </h4>
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

                    {/* Nội dung */}
                    <p className="text-sm text-copy-secondary leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>

                    {/* Ảnh đính kèm (nếu có) */}
                    {post.image_url && (
                      <div className="relative rounded-card overflow-hidden border border-stroke-strong max-h-[350px] bg-canvas-deep">
                        <img
                          src={post.image_url}
                          alt="Đính kèm"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none"
                          }}
                        />
                      </div>
                    )}

                    {/* Thanh tương tác */}
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

                    {/* Hộp thoại bình luận */}
                    {expandedComments[post.id] && (
                      <div className="border-t border-stroke/30 pt-4 mt-2 space-y-4 animate-fade-in">
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
      )}

    </div>
  )
}
