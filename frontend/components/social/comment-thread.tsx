"use client"

import { useEffect, useId, useState } from "react"
import Link from "next/link"
import { MessageCircleIcon, SendIcon } from "lucide-react"

import { InlineFeedback } from "@/components/social/inline-feedback"
import {
  LevelBadge,
  SocialBadge,
  SocialUserAvatar,
} from "@/components/social/social-user"
import { formatSocialDate } from "@/components/social/social-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { createComment, getPostComments } from "@/services/post.service"
import type { PostComment } from "@/types/social"

interface CommentThreadProps {
  postId: number
  onCommentCreated: () => void
}

export function CommentThread({ postId, onCommentCreated }: CommentThreadProps) {
  const fieldId = useId()
  const [comments, setComments] = useState<PostComment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [draft, setDraft] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function loadComments() {
    setLoading(true)
    setError(null)

    try {
      const response = await getPostComments(postId)
      setComments(response.data ?? [])
    } catch {
      setError("Không thể tải bình luận lúc này.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    void getPostComments(postId)
      .then((response) => {
        if (active) setComments(response.data ?? [])
      })
      .catch(() => {
        if (active) setError("Không thể tải bình luận lúc này.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [postId])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = draft.trim()

    if (!content || submitting) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await createComment(postId, content)
      setComments((current) => [...current, response.data])
      setDraft("")
      onCommentCreated()
    } catch {
      setError("Bình luận chưa được gửi. Nội dung vẫn được giữ để bạn thử lại.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      className="space-y-4 border-t border-stroke-subtle pt-5"
      aria-label="Bình luận bài viết"
      aria-busy={loading || submitting}
    >
      {loading ? (
        <div className="space-y-3" aria-label="Đang tải bình luận" role="status">
          {[0, 1].map((item) => (
            <div className="flex gap-3" key={item} aria-hidden="true">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <Skeleton className="h-16 flex-1 rounded-nav" />
            </div>
          ))}
        </div>
      ) : error && comments.length === 0 ? (
        <InlineFeedback tone="error">
          <p>{error}</p>
          <Button className="mt-2" variant="ghost" size="sm" onClick={() => void loadComments()}>
            Thử tải lại
          </Button>
        </InlineFeedback>
      ) : comments.length === 0 ? (
        <div className="flex items-center gap-3 rounded-nav border border-stroke-subtle bg-surface-inner px-4 py-3 text-sm text-copy-muted">
          <MessageCircleIcon className="size-4 text-brand-cyan" aria-hidden="true" />
          Chưa có bình luận. Hãy mở đầu cuộc trò chuyện.
        </div>
      ) : (
        <ol className="space-y-4">
          {comments.map((comment) => (
            <li className="flex items-start gap-3" key={comment.id}>
              <Link
                href={`/profile/${comment.user_id}`}
                className="product-focus shrink-0 rounded-full"
                aria-label={`Xem hồ sơ ${comment.username}`}
              >
                <SocialUserAvatar
                  name={comment.username}
                  src={comment.avatar_url}
                  size="sm"
                />
              </Link>
              <div className="min-w-0 flex-1 rounded-nav border border-stroke-subtle bg-surface-inner px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/profile/${comment.user_id}`}
                    className="product-focus rounded font-semibold text-foreground hover:text-brand-cyan"
                  >
                    {comment.username}
                  </Link>
                  <SocialBadge type={comment.badge_type} />
                  <LevelBadge level={comment.level} />
                  <time
                    className="ml-auto font-mono text-xs text-copy-muted"
                    dateTime={comment.created_at}
                  >
                    {formatSocialDate(comment.created_at)}
                  </time>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-copy-secondary">
                  {comment.content}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}

      {error && comments.length > 0 ? <InlineFeedback tone="error">{error}</InlineFeedback> : null}

      <form className="flex items-end gap-2" onSubmit={handleSubmit}>
        <div className="min-w-0 flex-1">
          <Label htmlFor={fieldId} className="sr-only">
            Viết bình luận
          </Label>
          <Input
            id={fieldId}
            value={draft}
            maxLength={500}
            placeholder="Viết bình luận của bạn…"
            className="h-12 rounded-control border-stroke-strong bg-surface-inner px-4"
            onChange={(event) => setDraft(event.target.value)}
          />
        </div>
        <Button
          type="submit"
          variant="product"
          size="icon-app"
          disabled={!draft.trim() || submitting}
          aria-label={submitting ? "Đang gửi bình luận" : "Gửi bình luận"}
          aria-busy={submitting}
        >
          <SendIcon aria-hidden="true" />
        </Button>
      </form>
    </section>
  )
}
