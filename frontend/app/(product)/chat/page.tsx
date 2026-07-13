"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  ArrowDownIcon,
  BookOpenCheckIcon,
  CircleHelpIcon,
  Globe2Icon,
  InfoIcon,
  RefreshCwIcon,
  SendIcon,
  UsersIcon,
} from "lucide-react"

import { AsyncContentState } from "@/components/product/async-content-state"
import { ProductReveal } from "@/components/product/product-reveal"
import { InlineFeedback } from "@/components/social/inline-feedback"
import { formatSocialDate } from "@/components/social/social-utils"
import {
  LevelBadge,
  SocialBadge,
  SocialUserAvatar,
} from "@/components/social/social-user"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { useAuthenticatedUser } from "@/hooks/use-authenticated-user"
import { getChatMessages, sendChatMessage } from "@/services/chat.service"
import { getFriends } from "@/services/friendship.service"
import { cn } from "@/lib/utils"
import type { ChatMessage, Friend } from "@/types/social"

const POLL_INTERVAL_MS = 5_000
const MESSAGE_LIMIT = 50
const MAX_DRAFT_LENGTH = 1_500

function mergeMessages(current: ChatMessage[], incoming: ChatMessage[]) {
  const messagesById = new Map<number, ChatMessage>()
  for (const message of current) messagesById.set(message.id, message)
  for (const message of incoming) messagesById.set(message.id, message)
  return Array.from(messagesById.values())
    .sort((first, second) => {
      const dateDifference = new Date(first.created_at).getTime() - new Date(second.created_at).getTime()
      return dateDifference || first.id - second.id
    })
    .slice(-80)
}

function ContactRail({
  friends,
  loading,
  error,
  onRetry,
}: {
  friends: Friend[]
  loading: boolean
  error: string | null
  onRetry: () => void
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-stroke-subtle px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] tracking-[0.15em] text-brand-cyan uppercase">Study circle</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Bạn học</h2>
          </div>
          <Badge variant="neutral">{friends.length}</Badge>
        </div>
        <p className="mt-2 text-xs leading-5 text-copy-muted">Danh bạ thật từ kết nối của bạn. Chat riêng chưa được hỗ trợ.</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {loading ? (
          <p className="px-2 py-4 text-sm text-copy-muted" role="status">Đang tải danh bạ…</p>
        ) : error ? (
          <div className="space-y-3 px-2 py-4">
            <p className="text-sm leading-6 text-destructive">{error}</p>
            <Button type="button" variant="glass" size="app" onClick={onRetry}><RefreshCwIcon aria-hidden="true" />Thử lại</Button>
          </div>
        ) : friends.length === 0 ? (
          <p className="px-2 py-4 text-sm leading-6 text-copy-muted">Chưa có bạn học trong danh bạ. Bạn có thể tìm kết nối mới ở trang Bạn bè.</p>
        ) : (
          <ul className="space-y-1">
            {friends.map((friend) => (
              <li key={friend.friendship_id}>
                <Link
                  href={`/profile/${friend.user_id}`}
                  className="product-focus flex min-h-14 items-center gap-3 rounded-nav px-3 py-2 transition duration-300 hover:bg-brand-cyan/8 motion-reduce:transition-none"
                >
                  <SocialUserAvatar name={friend.username} src={friend.avatar_url} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium text-white">{friend.username}</span>
                      <SocialBadge type={friend.badge_type} />
                    </span>
                    <span className="mt-0.5 block text-xs text-copy-muted">Xem hồ sơ</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function ChannelInfo() {
  return (
    <div className="space-y-6 p-5">
      <div>
        <span className="grid size-12 place-items-center rounded-panel border border-brand-cyan/20 bg-brand-cyan/10 text-brand-cyan">
          <Globe2Icon className="size-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-white">Kênh cộng đồng</h2>
        <p className="mt-2 text-sm leading-6 text-copy-muted">Một phòng trò chuyện chung cho toàn bộ học viên EngFlex.</p>
      </div>
      <div className="space-y-4 border-t border-stroke-subtle pt-5">
        <div className="flex gap-3">
          <BookOpenCheckIcon className="mt-0.5 size-4 shrink-0 text-brand-cyan" aria-hidden="true" />
          <p className="text-sm leading-6 text-copy-secondary">Ưu tiên trao đổi về học tập, luyện tập và tài nguyên hữu ích.</p>
        </div>
        <div className="flex gap-3">
          <CircleHelpIcon className="mt-0.5 size-4 shrink-0 text-brand-cyan" aria-hidden="true" />
          <p className="text-sm leading-6 text-copy-secondary">Không chia sẻ dữ liệu nhạy cảm hoặc thông tin đăng nhập trong phòng chung.</p>
        </div>
      </div>
      <Card variant="inner">
        <CardContent>
          <p className="font-mono text-[11px] tracking-[0.14em] text-copy-muted uppercase">Sync mode</p>
          <p className="mt-2 font-semibold text-white">Làm mới mỗi 5 giây</p>
          <p className="mt-2 text-xs leading-5 text-copy-muted">Tin cũ vẫn được giữ nếu kết nối nền tạm lỗi.</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ChatPage() {
  const { user, resolved } = useAuthenticatedUser()
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const refreshInFlightRef = useRef(false)
  const nearBottomRef = useRef(true)
  const mountedRef = useRef(true)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [draft, setDraft] = useState("")
  const [loading, setLoading] = useState(true)
  const [friendsLoading, setFriendsLoading] = useState(true)
  const [initialError, setInitialError] = useState<string | null>(null)
  const [backgroundWarning, setBackgroundWarning] = useState<string | null>(null)
  const [friendsError, setFriendsError] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [contactsOpen, setContactsOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const container = messagesContainerRef.current
    if (!container) return
    container.scrollTo({ top: container.scrollHeight, behavior })
    nearBottomRef.current = true
    setShowScrollButton(false)
  }, [])

  const refreshMessages = useCallback(async (initial = false) => {
    if (refreshInFlightRef.current) return
    refreshInFlightRef.current = true
    if (initial) setLoading(true)

    try {
      const response = await getChatMessages({ limit: MESSAGE_LIMIT })
      if (!mountedRef.current) return
      setMessages((current) => initial ? (response.data ?? []) : mergeMessages(current, response.data ?? []))
      setInitialError(null)
      setBackgroundWarning(null)
      if (initial || nearBottomRef.current) {
        window.requestAnimationFrame(() => {
          if (initial || nearBottomRef.current) {
            scrollToBottom(initial ? "auto" : "smooth")
          }
        })
      }
    } catch (requestError) {
      if (!mountedRef.current) return
      const message = requestError instanceof Error && requestError.message
        ? requestError.message
        : "Không thể đồng bộ tin nhắn."
      if (initial) setInitialError(message)
      else setBackgroundWarning("Kết nối nền tạm gián đoạn. Tin nhắn hiện có vẫn được giữ nguyên.")
    } finally {
      refreshInFlightRef.current = false
      if (initial && mountedRef.current) setLoading(false)
    }
  }, [scrollToBottom])

  const loadFriends = useCallback(async () => {
    setFriendsLoading(true)
    setFriendsError(null)
    try {
      const response = await getFriends()
      if (mountedRef.current) setFriends(response.data ?? [])
    } catch {
      if (mountedRef.current) setFriendsError("Không thể tải danh bạ bạn học.")
    } finally {
      if (mountedRef.current) setFriendsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!resolved || !user) return
    const kickoff = window.setTimeout(() => {
      void refreshMessages(true)
      void loadFriends()
    }, 0)
    const interval = window.setInterval(() => void refreshMessages(false), POLL_INTERVAL_MS)
    return () => {
      window.clearTimeout(kickoff)
      window.clearInterval(interval)
    }
  }, [loadFriends, refreshMessages, resolved, user])

  function handleScroll() {
    const container = messagesContainerRef.current
    if (!container) return
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    const isNearBottom = distanceFromBottom < 160
    nearBottomRef.current = isNearBottom
    setShowScrollButton(!isNearBottom)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = draft.trim()
    if (!content || sending) return
    setSending(true)
    setSendError(null)
    try {
      const response = await sendChatMessage(content)
      setMessages((current) => mergeMessages(current, [response.data]))
      setDraft((current) => current.trim() === content ? "" : current)
      nearBottomRef.current = true
      window.requestAnimationFrame(() => scrollToBottom("smooth"))
    } catch {
      setSendError("Chưa thể gửi tin nhắn. Bản nháp của bạn vẫn được giữ để thử lại.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[96rem] space-y-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">

      <ProductReveal delay={0.07}>
        <div className="grid items-stretch gap-5 lg:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[17rem_minmax(0,1fr)_18rem]">
          <Card variant="product" className="hidden min-h-[42rem] py-0 lg:flex">
            <ContactRail friends={friends} loading={friendsLoading} error={friendsError} onRetry={() => void loadFriends()} />
          </Card>

          <Card variant="product" className="min-h-[42rem] py-0">
            <CardHeader className="flex-row items-center gap-3 border-b border-stroke-subtle py-4">
              <span className="relative grid size-11 shrink-0 place-items-center rounded-full border border-brand-cyan/25 bg-brand-cyan/10 text-brand-cyan">
                <Globe2Icon className="size-5" aria-hidden="true" />
                <span className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-surface-panel bg-status-success" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-white">Cộng đồng EngFlex</h2>
                <p className="mt-0.5 text-xs text-copy-muted">Phòng chung · không phải hội thoại riêng</p>
              </div>
              <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="icon-app" className="lg:hidden" aria-label="Bạn học" onClick={() => setContactsOpen(true)}>
                  <UsersIcon aria-hidden="true" />
                </Button>
                <Button type="button" variant="ghost" size="icon-app" className="xl:hidden" aria-label="Thông tin kênh" onClick={() => setInfoOpen(true)}>
                  <InfoIcon aria-hidden="true" />
                </Button>
                <Button type="button" variant="ghost" size="icon-app" aria-label="Làm mới tin nhắn" disabled={loading} onClick={() => void refreshMessages(false)}>
                  <RefreshCwIcon aria-hidden="true" />
                </Button>
              </div>
            </CardHeader>

            <div className="relative flex min-h-0 flex-1 flex-col">
              {backgroundWarning ? (
                <div className="border-b border-action-gold/20 bg-action-gold/8 px-5 py-2 text-xs text-action-gold" role="status">{backgroundWarning}</div>
              ) : null}

              <div
                ref={messagesContainerRef}
                role="log"
                aria-live="polite"
                aria-relevant="additions"
                aria-label="Tin nhắn trong kênh cộng đồng"
                onScroll={handleScroll}
                className="h-[min(62vh,46rem)] min-h-[28rem] overflow-y-auto px-4 py-6 sm:px-6"
              >
                {!resolved || loading ? (
                  <AsyncContentState kind="loading" title="Đang kết nối phòng chat" description="EngFlex đang tải các tin nhắn gần nhất." className="my-8" />
                ) : initialError && messages.length === 0 ? (
                  <AsyncContentState kind="error" title="Chưa thể vào phòng chat" description={initialError} onRetry={() => void refreshMessages(true)} className="my-8" />
                ) : messages.length === 0 ? (
                  <AsyncContentState kind="empty" title="Phòng chat đang yên ắng" description="Hãy gửi lời chào hoặc đặt câu hỏi học tập đầu tiên." className="my-8" />
                ) : (
                  <ol className="space-y-5">
                    {messages.map((message) => {
                      const own = message.user_id === user?.uid
                      return (
                        <li key={message.id} className={cn("flex gap-3", own && "flex-row-reverse")}>
                          <Link href={`/profile/${message.user_id}`} className="product-focus h-fit shrink-0 rounded-full" aria-label={`Xem hồ sơ ${message.username}`}>
                            <SocialUserAvatar name={message.username} src={message.avatar_url} size="sm" />
                          </Link>
                          <div className={cn("max-w-[min(82%,40rem)]", own && "text-right")}>
                            <div className={cn("mb-1.5 flex flex-wrap items-center gap-2", own && "justify-end")}>
                              <Link href={`/profile/${message.user_id}`} className="product-focus rounded text-sm font-semibold text-white hover:text-brand-cyan">{own ? "Bạn" : message.username}</Link>
                              <SocialBadge type={message.badge_type} />
                              <LevelBadge level={message.level} />
                              <time dateTime={message.created_at} className="font-mono text-[11px] text-copy-muted">{formatSocialDate(message.created_at)}</time>
                            </div>
                            <p className={cn(
                              "rounded-panel border px-4 py-3 text-left text-sm leading-6 whitespace-pre-wrap",
                              own
                                ? "border-brand-cyan/25 bg-brand-cyan/12 text-white"
                                : "border-stroke-subtle bg-surface-inner text-copy-secondary"
                            )}>{message.content}</p>
                          </div>
                        </li>
                      )
                    })}
                  </ol>
                )}
              </div>

              {showScrollButton ? (
                <Button type="button" variant="glass" size="icon-app" className="absolute right-5 bottom-5 z-10 rounded-full shadow-card" aria-label="Cuộn tới tin nhắn mới nhất" onClick={() => scrollToBottom()}>
                  <ArrowDownIcon aria-hidden="true" />
                </Button>
              ) : null}
            </div>

            <div className="border-t border-stroke-subtle p-4 sm:p-5">
              {sendError ? <div id="chat-send-error" className="mb-3"><InlineFeedback tone="error">{sendError}</InlineFeedback></div> : null}
              <form className="flex items-end gap-3" onSubmit={handleSubmit}>
                <div className="min-w-0 flex-1">
                  <label htmlFor="chat-message" className="sr-only">Tin nhắn gửi vào kênh cộng đồng</label>
                  <Textarea
                    id="chat-message"
                    value={draft}
                    maxLength={MAX_DRAFT_LENGTH}
                    aria-describedby={sendError ? "chat-send-error" : undefined}
                    placeholder="Viết tin nhắn…"
                    className="max-h-36 min-h-12 resize-none rounded-control border-stroke-strong bg-surface-inner px-4 py-3"
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault()
                        event.currentTarget.form?.requestSubmit()
                      }
                    }}
                  />
                  <p className="mt-1 text-right font-mono text-[11px] tabular-nums text-copy-muted">{draft.length}/{MAX_DRAFT_LENGTH}</p>
                </div>
                <Button type="submit" variant="product" size="icon-app" disabled={!draft.trim() || sending} aria-busy={sending} aria-label={sending ? "Đang gửi tin nhắn" : "Gửi tin nhắn"}>
                  <SendIcon aria-hidden="true" />
                </Button>
              </form>
            </div>
          </Card>

          <Card variant="product" className="hidden min-h-[42rem] py-0 xl:block">
            <ChannelInfo />
          </Card>
        </div>
      </ProductReveal>

      <Sheet open={contactsOpen} onOpenChange={setContactsOpen}>
        <SheetContent side="left" className="w-[min(90vw,22rem)] border-stroke bg-surface-panel p-0 sm:max-w-[22rem]">
          <SheetHeader className="sr-only"><SheetTitle>Bạn học</SheetTitle><SheetDescription>Danh bạ kết nối của bạn</SheetDescription></SheetHeader>
          <ContactRail friends={friends} loading={friendsLoading} error={friendsError} onRetry={() => void loadFriends()} />
        </SheetContent>
      </Sheet>

      <Sheet open={infoOpen} onOpenChange={setInfoOpen}>
        <SheetContent side="right" className="w-[min(90vw,22rem)] border-stroke bg-surface-panel p-0 sm:max-w-[22rem]">
          <SheetHeader className="sr-only"><SheetTitle>Thông tin kênh</SheetTitle><SheetDescription>Quy tắc của kênh cộng đồng</SheetDescription></SheetHeader>
          <ChannelInfo />
        </SheetContent>
      </Sheet>
    </div>
  )
}
