"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { updateProfile as updateFirebaseProfile } from "firebase/auth"
import {
  CalendarDaysIcon,
  CameraIcon,
  CheckIcon,
  Clock3Icon,
  FileTextIcon,
  PencilIcon,
  PlusIcon,
  UserMinusIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react"

import { AsyncContentState } from "@/components/product/async-content-state"
import { ProductPageHeader } from "@/components/product/page-header"
import { ProductReveal } from "@/components/product/product-reveal"
import { ConfirmActionDialog } from "@/components/social/confirm-action-dialog"
import { InlineFeedback } from "@/components/social/inline-feedback"
import { PostCard } from "@/components/social/post-card"
import { PostComposer } from "@/components/social/post-composer"
import { SocialUserAvatar } from "@/components/social/social-user"
import { Button } from "@/components/ui/button"
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
import { useAuthenticatedUser } from "@/hooks/use-authenticated-user"
import {
  getOwnProfile,
  getPublicProfile,
  updateUserProfile,
  uploadAvatar,
} from "@/services/auth.service"
import {
  acceptFriendRequest,
  declineOrRemoveFriend,
  getFriendshipStatus,
  sendFriendRequest,
} from "@/services/friendship.service"
import {
  createPost,
  deletePost,
  getUserPosts,
  toggleLikePost,
} from "@/services/post.service"
import type { MetaType } from "@/types/api"
import type {
  FriendshipStatus,
  OwnUserProfile,
  PublicUserProfile,
  SocialPost,
} from "@/types/social"

const PAGE_SIZE = 8
const MAX_AVATAR_BYTES = 5 * 1024 * 1024
const ACCEPTED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

type Feedback = { tone: "error" | "success" | "info"; message: string }

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

function formatJoinedDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Chưa có dữ liệu"
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
}

export default function UserProfilePage() {
  const params = useParams<{ userId: string }>()
  const targetUserId = params.userId
  const { user, resolved } = useAuthenticatedUser()
  const isOwnProfile = Boolean(user && user.uid === targetUserId)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const profileRequestIdRef = useRef(0)

  const [profile, setProfile] = useState<OwnUserProfile | PublicUserProfile | null>(null)
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [meta, setMeta] = useState<MetaType | null>(null)
  const [friendship, setFriendship] = useState<FriendshipStatus>({ state: "none", friendship_id: null })
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [likePending, setLikePending] = useState<Set<number>>(() => new Set())
  const [friendPending, setFriendPending] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editPending, setEditPending] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<SocialPost | null>(null)
  const [deletePending, setDeletePending] = useState(false)
  const [friendConfirmOpen, setFriendConfirmOpen] = useState(false)

  const loadProfile = useCallback(async () => {
    if (!user) return
    const requestId = ++profileRequestIdRef.current
    setLoading(true)
    setLoadingMore(false)
    setError(null)
    setFeedback(null)

    try {
      const self = user.uid === targetUserId
      const [profileResponse, postsResponse, friendshipResponse] = await Promise.all([
        self ? getOwnProfile() : getPublicProfile(targetUserId),
        getUserPosts(targetUserId, { page: 1, limit: PAGE_SIZE }),
        self
          ? Promise.resolve({ data: { state: "none", friendship_id: null } as FriendshipStatus })
          : getFriendshipStatus(targetUserId),
      ])
      if (requestId !== profileRequestIdRef.current) return
      setProfile(profileResponse.data)
      setPosts(postsResponse.data ?? [])
      setMeta(postsResponse.meta)
      setFriendship(friendshipResponse.data)
    } catch (requestError) {
      if (requestId !== profileRequestIdRef.current) return
      setError(errorMessage(requestError, "Không thể tải hồ sơ này."))
    } finally {
      if (requestId === profileRequestIdRef.current) setLoading(false)
    }
  }, [targetUserId, user])

  useEffect(() => {
    if (!resolved || !user) return
    const kickoff = window.setTimeout(() => void loadProfile(), 0)
    return () => {
      window.clearTimeout(kickoff)
      profileRequestIdRef.current += 1
    }
  }, [loadProfile, resolved, user])

  async function loadMorePosts() {
    if (!meta || loadingMore) return
    const requestId = profileRequestIdRef.current
    setLoadingMore(true)
    try {
      const response = await getUserPosts(targetUserId, {
        page: meta.page + 1,
        limit: PAGE_SIZE,
      })
      if (requestId !== profileRequestIdRef.current) return
      setPosts((current) => {
        const ids = new Set(current.map((post) => post.id))
        return [...current, ...(response.data ?? []).filter((post) => !ids.has(post.id))]
      })
      setMeta(response.meta)
    } catch (requestError) {
      if (requestId !== profileRequestIdRef.current) return
      setFeedback({ tone: "error", message: errorMessage(requestError, "Chưa thể tải thêm bài viết.") })
    } finally {
      if (requestId === profileRequestIdRef.current) setLoadingMore(false)
    }
  }

  function openEditDialog() {
    if (!profile || !("email" in profile)) return
    setEditName(profile.name)
    setEditPhone(profile.phone ?? "")
    setEditError(null)
    setEditOpen(true)
  }

  async function handleEditSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user || !profile || !("email" in profile) || editPending) return
    const nextName = editName.trim()
    if (!nextName) {
      setEditError("Tên hiển thị không được để trống.")
      return
    }

    setEditPending(true)
    setEditError(null)
    try {
      const response = await updateUserProfile({ name: nextName, phone: editPhone.trim() })
      setProfile((current) => current ? { ...current, ...response.data } : current)
      window.dispatchEvent(new CustomEvent("engflex:profile-updated", {
        detail: {
          name: response.data.name,
          avatar_url: response.data.avatar_url,
        },
      }))
      setEditOpen(false)
      setFeedback({ tone: "success", message: "Thông tin hồ sơ đã được cập nhật." })
      try {
        await updateFirebaseProfile(user, { displayName: response.data.name })
      } catch {
        setFeedback({
          tone: "info",
          message: "Hồ sơ đã được lưu. Một số màn hình cũ có thể cần tải lại để nhận tên mới.",
        })
      }
    } catch (requestError) {
      setEditError(errorMessage(requestError, "Chưa thể lưu thay đổi. Nội dung vẫn được giữ lại."))
    } finally {
      setEditPending(false)
    }
  }

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file || !user || !isOwnProfile || avatarUploading) return

    if (!ACCEPTED_AVATAR_TYPES.has(file.type)) {
      setFeedback({ tone: "error", message: "Ảnh đại diện phải là tệp JPG, PNG hoặc WebP." })
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setFeedback({ tone: "error", message: "Ảnh đại diện không được vượt quá 5 MB." })
      return
    }

    setAvatarUploading(true)
    setFeedback(null)
    try {
      const response = await uploadAvatar(file, user.uid)
      setProfile((current) => current ? { ...current, ...response.data } : current)
      window.dispatchEvent(new CustomEvent("engflex:profile-updated", {
        detail: {
          name: response.data.name,
          avatar_url: response.data.avatar_url,
        },
      }))
      setFeedback({ tone: "success", message: "Ảnh đại diện đã được lưu." })
      try {
        await updateFirebaseProfile(user, { photoURL: response.data.avatar_url })
      } catch {
        setFeedback({
          tone: "info",
          message: "Ảnh đã được lưu. Một số màn hình cũ có thể cần tải lại để nhận ảnh mới.",
        })
      }
    } catch (requestError) {
      setFeedback({ tone: "error", message: errorMessage(requestError, "Không thể tải ảnh lên. Vui lòng thử lại.") })
    } finally {
      setAvatarUploading(false)
    }
  }

  async function handleFriendAction() {
    if (!profile || isOwnProfile || friendPending) return
    setFriendPending(true)
    setFeedback(null)
    try {
      if (friendship.state === "none") {
        await sendFriendRequest(targetUserId)
        setFriendship({ state: "pending_sent", friendship_id: null })
        setFeedback({ tone: "success", message: `Đã gửi lời mời kết bạn tới ${profile.name}.` })
      } else if (friendship.state === "pending_received" && friendship.friendship_id) {
        await acceptFriendRequest(friendship.friendship_id)
        setFriendship({ ...friendship, state: "accepted" })
        setProfile((current) => current ? { ...current, friend_count: current.friend_count + 1 } : current)
        setFeedback({ tone: "success", message: `Bạn và ${profile.name} đã trở thành bạn bè.` })
      }
    } catch (requestError) {
      setFeedback({ tone: "error", message: errorMessage(requestError, "Chưa thể cập nhật kết nối.") })
    } finally {
      setFriendPending(false)
    }
  }

  async function handleRemoveFriendship() {
    if (!profile || !friendship.friendship_id || friendPending) return
    setFriendPending(true)
    setFeedback(null)
    try {
      const wasAccepted = friendship.state === "accepted"
      await declineOrRemoveFriend(friendship.friendship_id)
      setFriendship({ state: "none", friendship_id: null })
      if (wasAccepted) {
        setProfile((current) => current ? { ...current, friend_count: Math.max(0, current.friend_count - 1) } : current)
      }
      setFriendConfirmOpen(false)
      setFeedback({
        tone: "success",
        message: wasAccepted
          ? `Đã hủy kết bạn với ${profile.name}.`
          : `Đã từ chối lời mời của ${profile.name}.`,
      })
    } catch (requestError) {
      setFeedback({ tone: "error", message: errorMessage(requestError, "Chưa thể cập nhật kết nối.") })
    } finally {
      setFriendPending(false)
    }
  }

  async function handleCreatePost(input: { content: string; imageUrl: string | null }) {
    const response = await createPost(input)
    setPosts((current) => [response.data, ...current])
    setMeta((current) => current ? { ...current, total: current.total + 1 } : current)
    setProfile((current) => current ? { ...current, post_count: current.post_count + 1 } : current)
    setFeedback({ tone: "success", message: "Bài viết đã được thêm vào hồ sơ." })
  }

  async function handleLike(post: SocialPost) {
    if (likePending.has(post.id)) return
    setLikePending((current) => new Set(current).add(post.id))
    setPosts((current) => current.map((item) => item.id === post.id
      ? { ...item, is_liked: !item.is_liked, likes_count: Math.max(0, item.likes_count + (item.is_liked ? -1 : 1)) }
      : item))
    try {
      const response = await toggleLikePost(post.id)
      setPosts((current) => current.map((item) => item.id === post.id ? { ...item, ...response.data } : item))
    } catch {
      setPosts((current) => current.map((item) => item.id === post.id
        ? { ...item, is_liked: post.is_liked, likes_count: post.likes_count }
        : item))
      setFeedback({ tone: "error", message: "Không thể cập nhật lượt thích. Thay đổi đã được hoàn tác." })
    } finally {
      setLikePending((current) => {
        const next = new Set(current)
        next.delete(post.id)
        return next
      })
    }
  }

  async function handleDeletePost() {
    if (!deleteTarget || deletePending) return
    setDeletePending(true)
    try {
      await deletePost(deleteTarget.id)
      setPosts((current) => current.filter((post) => post.id !== deleteTarget.id))
      setMeta((current) => current ? { ...current, total: Math.max(0, current.total - 1) } : current)
      setProfile((current) => current ? { ...current, post_count: Math.max(0, current.post_count - 1) } : current)
      setDeleteTarget(null)
      setFeedback({ tone: "success", message: "Bài viết đã được xóa." })
    } catch (requestError) {
      setFeedback({ tone: "error", message: errorMessage(requestError, "Chưa thể xóa bài viết.") })
    } finally {
      setDeletePending(false)
    }
  }

  function friendshipAction() {
    if (isOwnProfile) {
      return (
        <>
          <Button type="button" variant="product" size="app" onClick={openEditDialog}>
            <PencilIcon aria-hidden="true" />Chỉnh sửa hồ sơ
          </Button>
          <Button
            type="button"
            variant="glass"
            size="app"
            disabled={avatarUploading}
            aria-busy={avatarUploading}
            onClick={() => avatarInputRef.current?.click()}
          >
            <CameraIcon aria-hidden="true" />
            {avatarUploading ? "Đang tải ảnh…" : "Đổi ảnh đại diện"}
          </Button>
        </>
      )
    }

    if (friendship.state === "accepted") {
      return <Button type="button" variant="destructive" size="app" onClick={() => { setFeedback(null); setFriendConfirmOpen(true) }}><UserMinusIcon aria-hidden="true" />Hủy kết bạn</Button>
    }
    if (friendship.state === "pending_sent") {
      return <Button type="button" variant="glass" size="app" disabled><Clock3Icon aria-hidden="true" />Đang chờ phản hồi</Button>
    }
    if (friendship.state === "pending_received") {
      return (
        <>
          <Button type="button" variant="product" size="app" disabled={friendPending} aria-busy={friendPending} onClick={() => void handleFriendAction()}><CheckIcon aria-hidden="true" />{friendPending ? "Đang nhận…" : "Chấp nhận"}</Button>
          <Button type="button" variant="destructive" size="app" onClick={() => { setFeedback(null); setFriendConfirmOpen(true) }}>Từ chối</Button>
        </>
      )
    }
    return <Button type="button" variant="product" size="app" disabled={friendPending} aria-busy={friendPending} onClick={() => void handleFriendAction()}><UserPlusIcon aria-hidden="true" />{friendPending ? "Đang gửi…" : "Kết bạn"}</Button>
  }

  if (!resolved || loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 pb-8 pt-0 sm:px-6 lg:px-8 lg:pb-12">
        <AsyncContentState kind="loading" title="Đang mở hồ sơ" description="EngFlex đang tải thông tin và các bài chia sẻ." />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 pb-8 pt-0 sm:px-6 lg:px-8 lg:pb-12">
        <AsyncContentState kind="error" title="Không thể mở hồ sơ" description={error ?? "Hồ sơ này không tồn tại."} onRetry={() => void loadProfile()} />
      </div>
    )
  }

  const hasMore = Boolean(meta && posts.length < meta.total)

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-4 pb-8 pt-0 sm:px-6 lg:px-8 lg:pb-12">
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label="Chọn ảnh đại diện JPG, PNG hoặc WebP, tối đa 5 MB"
        onChange={(event) => void handleAvatarChange(event)}
      />

      <ProductReveal eager>
        <ProductPageHeader
          title={profile.name}
          description={
            isOwnProfile
              ? "Không gian cá nhân để bạn quản lý danh tính học tập và những điều đã chia sẻ."
              : `Khám phá hành trình và những chia sẻ công khai của ${profile.name}.`
          }
          actions={friendshipAction()}
          aside={<SocialUserAvatar name={profile.name} src={profile.avatar_url} size="xl" className="shadow-card" />}
        />
      </ProductReveal>

      {feedback ? <div aria-live="polite"><InlineFeedback tone={feedback.tone}>{feedback.message}</InlineFeedback></div> : null}

      <ProductReveal delay={0.07}>
        <section aria-label="Thống kê hồ sơ" className="grid gap-4 sm:grid-cols-3">
          <Card variant="inner"><CardContent><FileTextIcon className="size-5 text-brand-cyan" aria-hidden="true" /><p className="mt-4 text-3xl font-semibold tabular-nums text-foreground">{profile.post_count}</p><p className="mt-1 text-sm text-copy-muted">bài viết</p></CardContent></Card>
          <Card variant="inner"><CardContent><UsersIcon className="size-5 text-brand-cyan" aria-hidden="true" /><p className="mt-4 text-3xl font-semibold tabular-nums text-foreground">{profile.friend_count}</p><p className="mt-1 text-sm text-copy-muted">bạn bè</p></CardContent></Card>
          <Card variant="inner"><CardContent><CalendarDaysIcon className="size-5 text-brand-cyan" aria-hidden="true" /><p className="mt-4 text-base font-semibold text-foreground">{formatJoinedDate(profile.created_at)}</p><p className="mt-1 text-sm text-copy-muted">tham gia EngFlex</p></CardContent></Card>
        </section>
      </ProductReveal>

      {isOwnProfile ? (
        <ProductReveal delay={0.14}>
          <PostComposer authorName={profile.name} authorAvatar={profile.avatar_url} onCreate={handleCreatePost} />
        </ProductReveal>
      ) : null}

      <section aria-labelledby="profile-posts-heading" className="space-y-5">
        <div>
          <p className="text-xs tracking-meta text-brand-cyan uppercase">Learning journal</p>
          <h2 id="profile-posts-heading" className="mt-2 text-2xl font-semibold text-foreground">Bài viết trên hồ sơ</h2>
        </div>

        {posts.length === 0 ? (
          <AsyncContentState
            kind="empty"
            title={isOwnProfile ? "Chưa có bài viết nào" : `${profile.name} chưa đăng bài`}
            description={isOwnProfile ? "Chia sẻ điều bạn vừa học để bắt đầu nhật ký cộng đồng." : "Hãy quay lại sau để xem những chia sẻ mới."}
          />
        ) : (
          <div className="space-y-5">
            {posts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                viewerId={user?.uid ?? ""}
                revealDelay={Math.min(index, 5) * 0.07}
                likePending={likePending.has(post.id)}
                deletePending={deletePending && deleteTarget?.id === post.id}
                onLike={handleLike}
                onDeleteRequest={(post) => {
                  setFeedback(null)
                  setDeleteTarget(post)
                }}
                onCommentCreated={(postId) => setPosts((current) => current.map((item) => item.id === postId ? { ...item, comments_count: item.comments_count + 1 } : item))}
              />
            ))}
          </div>
        )}

        {hasMore ? (
          <div className="flex justify-center pt-3">
            <Button type="button" variant="glass" size="app" disabled={loadingMore} aria-busy={loadingMore} onClick={() => void loadMorePosts()}>
              <PlusIcon aria-hidden="true" />{loadingMore ? "Đang tải…" : "Tải thêm bài viết"}
            </Button>
          </div>
        ) : null}
      </section>

      <Dialog open={editOpen} onOpenChange={(open) => { if (!editPending) setEditOpen(open) }}>
        <DialogContent className="max-w-lg rounded-card border border-stroke bg-surface-panel p-6 sm:max-w-lg" aria-busy={editPending}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-foreground">Chỉnh sửa hồ sơ</DialogTitle>
            <DialogDescription className="text-copy-muted">Tên hiển thị và số điện thoại được lưu trong hồ sơ EngFlex của bạn.</DialogDescription>
          </DialogHeader>
          <form className="space-y-5" onSubmit={handleEditSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="profile-name">Tên hiển thị</Label>
              <Input id="profile-name" value={editName} maxLength={80} className="h-12 rounded-control border-stroke-strong bg-surface-inner px-4" onChange={(event) => setEditName(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-phone">Số điện thoại <span className="text-copy-muted">(không bắt buộc)</span></Label>
              <Input id="profile-phone" type="tel" inputMode="tel" value={editPhone} maxLength={20} className="h-12 rounded-control border-stroke-strong bg-surface-inner px-4" onChange={(event) => setEditPhone(event.target.value)} />
            </div>
            {editError ? <InlineFeedback tone="error">{editError}</InlineFeedback> : null}
            <DialogFooter className="mx-0 mb-0 border-stroke-subtle bg-transparent px-0 pb-0">
              <Button type="button" variant="glass" size="app" disabled={editPending} onClick={() => setEditOpen(false)}>Hủy</Button>
              <Button type="submit" variant="product" size="app" disabled={editPending || !editName.trim()} aria-busy={editPending}>{editPending ? "Đang lưu…" : "Lưu thay đổi"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmActionDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => { if (!open && !deletePending) setDeleteTarget(null) }}
        title="Xóa bài viết này?"
        description="Bài viết và cuộc thảo luận đi kèm sẽ bị xóa khỏi hồ sơ."
        confirmLabel="Xóa bài viết"
        pending={deletePending}
        error={deleteTarget && feedback?.tone === "error" ? feedback.message : null}
        onConfirm={handleDeletePost}
      />

      <ConfirmActionDialog
        open={friendConfirmOpen}
        onOpenChange={(open) => { if (!friendPending) setFriendConfirmOpen(open) }}
        title={friendship.state === "accepted" ? "Hủy kết bạn?" : "Từ chối lời mời?"}
        description={friendship.state === "accepted" ? `Bạn và ${profile.name} sẽ không còn trong danh sách bạn bè.` : `Lời mời của ${profile.name} sẽ bị xóa.`}
        confirmLabel={friendship.state === "accepted" ? "Hủy kết bạn" : "Từ chối"}
        pending={friendPending}
        error={friendConfirmOpen && feedback?.tone === "error" ? feedback.message : null}
        onConfirm={handleRemoveFriendship}
      />
    </div>
  )
}
