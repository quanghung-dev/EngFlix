"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  PlusIcon,
  RefreshCwIcon,
  SparklesIcon,
} from "lucide-react"

import { AsyncContentState } from "@/components/product/async-content-state"
import { ProductPageHeader } from "@/components/product/page-header"
import { ProductReveal } from "@/components/product/product-reveal"
import { ConfirmActionDialog } from "@/components/social/confirm-action-dialog"
import { InlineFeedback } from "@/components/social/inline-feedback"
import { PostCard } from "@/components/social/post-card"
import { PostComposer } from "@/components/social/post-composer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuthenticatedUser } from "@/hooks/use-authenticated-user"
import {
  createPost,
  deletePost,
  getPostsFeed,
  toggleLikePost,
} from "@/services/post.service"
import type { MetaType } from "@/types/api"
import type { SocialPost } from "@/types/social"

const PAGE_SIZE = 8

function messageFromError(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

export default function CommunityPage() {
  const { user, resolved } = useAuthenticatedUser()
  const requestIdRef = useRef(0)
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [meta, setMeta] = useState<MetaType | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [likePending, setLikePending] = useState<Set<number>>(() => new Set())
  const [deleteTarget, setDeleteTarget] = useState<SocialPost | null>(null)
  const [deletePending, setDeletePending] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const loadPosts = useCallback(async (page = 1) => {
    const requestId = ++requestIdRef.current
    const isFirstPage = page === 1
    if (isFirstPage) setLoading(true)
    else setLoadingMore(true)
    if (isFirstPage) setError(null)
    else setLoadMoreError(null)

    try {
      const response = await getPostsFeed({ page, limit: PAGE_SIZE })
      if (requestId !== requestIdRef.current) return
      setPosts((current) => {
        if (isFirstPage) return response.data ?? []
        const knownIds = new Set(current.map((post) => post.id))
        return [...current, ...(response.data ?? []).filter((post) => !knownIds.has(post.id))]
      })
      setMeta(response.meta)
    } catch (requestError) {
      if (requestId !== requestIdRef.current) return
      const message = messageFromError(
        requestError,
        isFirstPage
          ? "Không thể tải bảng tin cộng đồng."
          : "Chưa thể tải thêm bài viết."
      )
      if (isFirstPage) setError(message)
      else setLoadMoreError(message)
    } finally {
      if (requestId === requestIdRef.current) {
        if (isFirstPage) setLoading(false)
        else setLoadingMore(false)
      }
    }
  }, [])

  useEffect(() => {
    if (!resolved || !user) return
    const kickoff = window.setTimeout(() => void loadPosts(1), 0)
    return () => {
      window.clearTimeout(kickoff)
      requestIdRef.current += 1
    }
  }, [loadPosts, resolved, user])

  async function handleCreate(input: { content: string; imageUrl: string | null }) {
    const response = await createPost(input)
    setPosts((current) => [response.data, ...current])
    setMeta((current) => current ? { ...current, total: current.total + 1 } : current)
    setFeedback("Bài viết đã xuất hiện trên bảng tin.")
  }

  async function handleLike(post: SocialPost) {
    if (likePending.has(post.id)) return

    setLikePending((current) => new Set(current).add(post.id))
    setFeedback(null)
    setPosts((current) =>
      current.map((item) =>
        item.id === post.id
          ? {
              ...item,
              is_liked: !item.is_liked,
              likes_count: Math.max(0, item.likes_count + (item.is_liked ? -1 : 1)),
            }
          : item
      )
    )

    try {
      const response = await toggleLikePost(post.id)
      setPosts((current) =>
        current.map((item) =>
          item.id === post.id ? { ...item, ...response.data } : item
        )
      )
    } catch {
      setPosts((current) =>
        current.map((item) =>
          item.id === post.id
            ? {
                ...item,
                is_liked: post.is_liked,
                likes_count: post.likes_count,
              }
            : item
        )
      )
      setFeedback("Không thể cập nhật lượt thích. Thay đổi đã được hoàn tác.")
    } finally {
      setLikePending((current) => {
        const next = new Set(current)
        next.delete(post.id)
        return next
      })
    }
  }

  async function handleDelete() {
    if (!deleteTarget || deletePending) return
    setDeletePending(true)
    setDeleteError(null)
    setFeedback(null)

    try {
      await deletePost(deleteTarget.id)
      setPosts((current) => current.filter((post) => post.id !== deleteTarget.id))
      setMeta((current) => current ? { ...current, total: Math.max(0, current.total - 1) } : current)
      setDeleteTarget(null)
      setDeleteError(null)
      setFeedback("Bài viết đã được xóa.")
    } catch {
      const message = "Chưa thể xóa bài viết. Vui lòng thử lại."
      setDeleteError(message)
      setFeedback(message)
    } finally {
      setDeletePending(false)
    }
  }

  const authorName = user?.displayName || user?.email?.split("@")[0] || "Bạn"
  const hasMore = Boolean(meta && posts.length < meta.total)

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <ProductReveal eager>
        <ProductPageHeader
          title="Cùng học, cùng tiến bộ"
          description="Chia sẻ câu hỏi, ghi lại chiến thắng nhỏ và tiếp sức cho những người đang luyện tiếng Anh cùng bạn."
          actions={
            <Button
              type="button"
              variant="glass"
              size="app"
              disabled={loading || loadingMore}
              onClick={() => void loadPosts(1)}
            >
              <RefreshCwIcon aria-hidden="true" />
              Làm mới bảng tin
            </Button>
          }
          aside={
            <Card variant="inner" className="min-w-48">
              <CardContent>
                <p className="text-xs tracking-meta text-copy-muted uppercase">Đang hiển thị</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">{meta?.total ?? posts.length}</p>
                <p className="mt-1 text-sm text-copy-muted">bài chia sẻ</p>
              </CardContent>
            </Card>
          }
        />
      </ProductReveal>

      {user ? (
        <ProductReveal delay={0.07}>
          <PostComposer
            authorName={authorName}
            authorAvatar={user.photoURL}
            onCreate={handleCreate}
          />
        </ProductReveal>
      ) : null}

      {feedback ? (
        <div aria-live="polite">
          <InlineFeedback tone={feedback.includes("Không") || feedback.includes("Chưa") ? "error" : "success"}>
            {feedback}
          </InlineFeedback>
        </div>
      ) : null}

      {!resolved || loading ? (
        <AsyncContentState
          kind="loading"
          title="Đang dựng bảng tin"
          description="EngFlex đang tải những chia sẻ mới nhất từ cộng đồng."
        />
      ) : error && posts.length === 0 ? (
        <AsyncContentState
          kind="error"
          title="Bảng tin chưa sẵn sàng"
          description={error}
          onRetry={() => void loadPosts(1)}
        />
      ) : posts.length === 0 ? (
        <AsyncContentState
          kind="empty"
          icon={<SparklesIcon className="size-7" aria-hidden="true" />}
          title="Hãy mở đầu cuộc trò chuyện"
          description="Chưa có bài viết nào. Một câu hỏi hoặc mục tiêu học hôm nay của bạn là khởi đầu tuyệt vời."
        />
      ) : (
        <section aria-labelledby="community-posts-heading" className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs tracking-meta text-brand-cyan uppercase">Latest stories</p>
              <h2 id="community-posts-heading" className="mt-2 text-2xl font-semibold text-foreground">Bảng tin mới nhất</h2>
            </div>
            {error ? <p className="max-w-sm text-right text-sm text-destructive">{error}</p> : null}
          </div>

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
                  setDeleteError(null)
                  setDeleteTarget(post)
                }}
                onCommentCreated={(postId) =>
                  setPosts((current) =>
                    current.map((item) =>
                      item.id === postId
                        ? { ...item, comments_count: item.comments_count + 1 }
                        : item
                    )
                  )
                }
              />
            ))}
          </div>

          {hasMore ? (
            <div className="flex justify-center pt-3">
              <Button
                type="button"
                variant="glass"
                size="app"
                disabled={loadingMore || loading}
                aria-busy={loadingMore}
                onClick={() => void loadPosts((meta?.page ?? 1) + 1)}
              >
                <PlusIcon aria-hidden="true" />
                {loadingMore ? "Đang tải…" : "Tải thêm bài viết"}
              </Button>
            </div>
          ) : null}
          {loadMoreError ? (
            <InlineFeedback tone="error" className="mx-auto max-w-xl">
              {loadMoreError}
            </InlineFeedback>
          ) : null}
        </section>
      )}

      <ConfirmActionDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deletePending) {
            setDeleteTarget(null)
            setDeleteError(null)
          }
        }}
        title="Xóa bài viết này?"
        description="Bài viết và toàn bộ cuộc thảo luận đi kèm sẽ không còn xuất hiện trên bảng tin."
        confirmLabel="Xóa bài viết"
        pendingLabel="Đang xóa…"
        pending={deletePending}
        error={deleteError}
        onConfirm={handleDelete}
      />
    </div>
  )
}
