"use client"

import { useId, useState } from "react"
import { ImagePlusIcon, SendIcon, XIcon } from "lucide-react"

import { SocialUserAvatar } from "@/components/social/social-user"
import { InlineFeedback } from "@/components/social/inline-feedback"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface PostComposerProps {
  authorName: string
  authorAvatar: string | null
  onCreate: (input: { content: string; imageUrl: string | null }) => Promise<void>
}

const MAX_POST_LENGTH = 1200

export function PostComposer({
  authorName,
  authorAvatar,
  onCreate,
}: PostComposerProps) {
  const contentId = useId()
  const imageId = useId()
  const counterId = useId()
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [showImageField, setShowImageField] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextContent = content.trim()

    if (!nextContent || submitting) return

    setSubmitting(true)
    setError(null)

    try {
      await onCreate({
        content: nextContent,
        imageUrl: imageUrl.trim() || null,
      })
      setContent("")
      setImageUrl("")
      setShowImageField(false)
    } catch {
      setError("Chưa thể đăng bài. Nội dung của bạn vẫn được giữ để thử lại.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card variant="product" aria-busy={submitting}>
      <CardHeader className="flex-row items-center gap-3">
        <SocialUserAvatar name={authorName} src={authorAvatar} />
        <div>
          <h2 className="text-lg font-semibold text-foreground">Chia sẻ cùng cộng đồng</h2>
          <p className="mt-1 text-sm text-copy-muted">
            Một câu hỏi hay hay một chiến thắng nhỏ đều đáng được ghi lại.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor={contentId} className="sr-only">
              Nội dung bài viết
            </Label>
            <Textarea
              id={contentId}
              value={content}
              maxLength={MAX_POST_LENGTH}
              minLength={1}
              aria-describedby={counterId}
              placeholder="Hôm nay bạn đã học được điều gì?"
              className="min-h-32 resize-y rounded-control border-stroke-strong bg-surface-inner px-4 py-3 text-base leading-7"
              onChange={(event) => setContent(event.target.value)}
            />
            <p
              id={counterId}
              className="mt-2 text-right font-mono text-xs tabular-nums text-copy-muted"
            >
              {content.length}/{MAX_POST_LENGTH}
            </p>
          </div>

          {showImageField ? (
            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor={imageId}>Liên kết ảnh đính kèm</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-app"
                  aria-label="Bỏ ảnh đính kèm"
                  onClick={() => {
                    setShowImageField(false)
                    setImageUrl("")
                  }}
                >
                  <XIcon aria-hidden="true" />
                </Button>
              </div>
              <Input
                id={imageId}
                type="url"
                inputMode="url"
                value={imageUrl}
                placeholder="https://…"
                className="h-12 rounded-control border-stroke-strong bg-surface-inner px-4"
                onChange={(event) => setImageUrl(event.target.value)}
              />
            </div>
          ) : null}

          {error ? <InlineFeedback tone="error">{error}</InlineFeedback> : null}

          <div className="flex flex-col-reverse gap-3 border-t border-stroke-subtle pt-4 sm:flex-row sm:items-center sm:justify-between">
            {!showImageField ? (
              <Button
                type="button"
                variant="ghost"
                size="app"
                onClick={() => setShowImageField(true)}
              >
                <ImagePlusIcon aria-hidden="true" />
                Thêm ảnh
              </Button>
            ) : (
              <span className="text-sm text-copy-muted">Ảnh sẽ hiển thị bên dưới nội dung.</span>
            )}
            <Button
              type="submit"
              variant="product"
              size="app"
              disabled={!content.trim() || submitting}
              aria-busy={submitting}
            >
              <SendIcon aria-hidden="true" />
              {submitting ? "Đang đăng…" : "Đăng bài"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
