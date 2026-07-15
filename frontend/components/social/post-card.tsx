"use client"

import { useState } from "react"
import Link from "next/link"
import {
  HeartIcon,
  MessageCircleIcon,
  Trash2Icon,
} from "lucide-react"

import { CommentThread } from "@/components/social/comment-thread"
import {
  LevelBadge,
  SocialBadge,
  SocialUserAvatar,
} from "@/components/social/social-user"
import { formatSocialDate } from "@/components/social/social-utils"
import { ProductReveal } from "@/components/product/product-reveal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { SocialPost } from "@/types/social"

interface PostCardProps {
  post: SocialPost
  viewerId: string
  revealDelay?: number
  likePending?: boolean
  deletePending?: boolean
  onLike: (post: SocialPost) => void | Promise<void>
  onDeleteRequest: (post: SocialPost) => void
  onCommentCreated: (postId: number) => void
}

export function PostCard({
  post,
  viewerId,
  revealDelay = 0,
  likePending = false,
  deletePending = false,
  onLike,
  onDeleteRequest,
  onCommentCreated,
}: PostCardProps) {
  const [commentsOpen, setCommentsOpen] = useState(false)
  const isOwner = post.user_id === viewerId

  return (
    <ProductReveal delay={revealDelay}>
      <Card variant="product" className="overflow-visible">
        <article aria-labelledby={`post-${post.id}-author`}>
          <CardHeader className="flex-row items-start gap-3">
            <Link
              href={`/profile/${post.user_id}`}
              className="product-focus shrink-0 rounded-full"
              aria-label={`Xem hồ sơ ${post.username}`}
            >
              <SocialUserAvatar name={post.username} src={post.avatar_url} />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  id={`post-${post.id}-author`}
                  href={`/profile/${post.user_id}`}
                  className="product-focus truncate rounded font-semibold text-foreground hover:text-brand-cyan"
                >
                  {post.username}
                </Link>
                <SocialBadge type={post.badge_type} />
                <LevelBadge level={post.level} />
              </div>
              <time
                className="mt-1 block text-xs text-copy-muted"
                dateTime={post.created_at}
              >
                {formatSocialDate(post.created_at)}
              </time>
            </div>
            {isOwner ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-app"
                disabled={deletePending}
                aria-label="Xóa bài viết"
                onClick={() => onDeleteRequest(post)}
              >
                <Trash2Icon className="text-destructive" aria-hidden="true" />
              </Button>
            ) : null}
          </CardHeader>

          <CardContent className="space-y-5">
            <p className="whitespace-pre-wrap text-base leading-7 text-copy-secondary">
              {post.content}
            </p>

            {post.image_url ? (
              <figure className="overflow-hidden rounded-panel border border-stroke-strong bg-canvas-deep">
                {/* User-provided URLs are intentionally rendered without Next image optimization. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.image_url}
                  alt={`Ảnh đính kèm trong bài viết của ${post.username}`}
                  className="max-h-[32rem] w-full object-cover"
                  loading="lazy"
                />
              </figure>
            ) : null}

            <div className="flex flex-wrap items-center gap-2 border-t border-stroke-subtle pt-4">
              <Button
                type="button"
                variant="ghost"
                size="app"
                disabled={likePending}
                aria-pressed={post.is_liked}
                aria-label={`${post.is_liked ? "Bỏ thích" : "Thích"} bài viết, ${post.likes_count} lượt thích`}
                onClick={() => void onLike(post)}
                className={cn(post.is_liked && "bg-brand-cyan/10 text-brand-cyan")}
              >
                <HeartIcon
                  className={cn(post.is_liked && "fill-brand-cyan/20")}
                  aria-hidden="true"
                />
                <span className="tabular-nums">{post.likes_count}</span>
                Thích
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="app"
                aria-expanded={commentsOpen}
                aria-controls={`post-${post.id}-comments`}
                onClick={() => setCommentsOpen((open) => !open)}
                className={cn(commentsOpen && "bg-brand-cyan/10 text-brand-cyan")}
              >
                <MessageCircleIcon aria-hidden="true" />
                <span className="tabular-nums">{post.comments_count}</span>
                Bình luận
              </Button>
            </div>

            {commentsOpen ? (
              <div id={`post-${post.id}-comments`}>
                <CommentThread
                  postId={post.id}
                  onCommentCreated={() => onCommentCreated(post.id)}
                />
              </div>
            ) : null}
          </CardContent>
        </article>
      </Card>
    </ProductReveal>
  )
}
