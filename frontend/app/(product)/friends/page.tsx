"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  CheckIcon,
  Clock3Icon,
  SearchIcon,
  UserMinusIcon,
  UserPlusIcon,
  XIcon,
} from "lucide-react"

import { AsyncContentState } from "@/components/product/async-content-state"
import { ProductReveal } from "@/components/product/product-reveal"
import { ConfirmActionDialog } from "@/components/social/confirm-action-dialog"
import { InlineFeedback } from "@/components/social/inline-feedback"
import { PersonCard } from "@/components/social/person-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuthenticatedUser } from "@/hooks/use-authenticated-user"
import {
  acceptFriendRequest,
  declineOrRemoveFriend,
  getFriends,
  getIncomingRequests,
  searchNewFriends,
  sendFriendRequest,
} from "@/services/friendship.service"
import type {
  Friend,
  FriendRequest,
  FriendSearchResult,
} from "@/types/social"

type FriendsTab = "all" | "requests" | "search"
type Feedback = { tone: "error" | "success" | "info"; message: string }
type DestructiveTarget = {
  friendshipId: number
  userId: string
  name: string
  kind: "remove" | "decline"
}

function requestMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

export default function FriendsPage() {
  const { user, resolved } = useAuthenticatedUser()
  const dataRequestIdRef = useRef(0)
  const searchRequestIdRef = useRef(0)
  const [activeTab, setActiveTab] = useState<FriendsTab>("all")
  const [friends, setFriends] = useState<Friend[]>([])
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<FriendSearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(() => new Set())
  const [destructiveTarget, setDestructiveTarget] = useState<DestructiveTarget | null>(null)

  const loadData = useCallback(async () => {
    const requestId = ++dataRequestIdRef.current
    setLoading(true)
    setError(null)
    try {
      const [friendsResponse, requestsResponse] = await Promise.all([
        getFriends(),
        getIncomingRequests(),
      ])
      if (requestId !== dataRequestIdRef.current) return
      setFriends(friendsResponse.data ?? [])
      setRequests(requestsResponse.data ?? [])
    } catch (requestError) {
      if (requestId !== dataRequestIdRef.current) return
      setError(requestMessage(requestError, "Không thể tải danh sách bạn bè."))
    } finally {
      if (requestId === dataRequestIdRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!resolved || !user) return
    const kickoff = window.setTimeout(() => void loadData(), 0)
    return () => {
      window.clearTimeout(kickoff)
      dataRequestIdRef.current += 1
      searchRequestIdRef.current += 1
    }
  }, [loadData, resolved, user])

  function markPending(key: string, pending: boolean) {
    setPendingKeys((current) => {
      const next = new Set(current)
      if (pending) next.add(key)
      else next.delete(key)
      return next
    })
  }

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = searchQuery.trim()
    if (!query || searching) return

    const requestId = ++searchRequestIdRef.current
    setSearching(true)
    setFeedback(null)
    try {
      const response = await searchNewFriends(query)
      if (requestId !== searchRequestIdRef.current) return
      setSearchResults(response.data ?? [])
      if ((response.data ?? []).length === 0) {
        setFeedback({ tone: "info", message: `Không tìm thấy học viên phù hợp với “${query}”.` })
      }
    } catch (requestError) {
      if (requestId !== searchRequestIdRef.current) return
      setFeedback({
        tone: "error",
        message: requestMessage(requestError, "Không thể tìm kiếm lúc này."),
      })
    } finally {
      if (requestId === searchRequestIdRef.current) setSearching(false)
    }
  }

  async function handleSendRequest(person: FriendSearchResult) {
    const key = `send-${person.user_id}`
    if (pendingKeys.has(key)) return
    markPending(key, true)
    setFeedback(null)
    try {
      await sendFriendRequest(person.user_id)
      setSearchResults((current) =>
        current.map((item) =>
          item.user_id === person.user_id
            ? { ...item, friendship_state: "pending_sent" }
            : item
        )
      )
      setFeedback({ tone: "success", message: `Đã gửi lời mời kết bạn tới ${person.username}.` })
    } catch (requestError) {
      setFeedback({
        tone: "error",
        message: requestMessage(requestError, "Chưa thể gửi lời mời kết bạn."),
      })
    } finally {
      markPending(key, false)
    }
  }

  async function handleAccept(friendshipId: number, userId: string, name: string) {
    const key = `accept-${friendshipId}`
    if (pendingKeys.has(key)) return
    markPending(key, true)
    setFeedback(null)
    try {
      await acceptFriendRequest(friendshipId)
      const accepted = requests.find((request) => request.friendship_id === friendshipId)
      if (accepted) {
        setFriends((current) => [
          ...current,
          accepted,
        ])
      }
      setRequests((current) => current.filter((request) => request.friendship_id !== friendshipId))
      setSearchResults((current) =>
        current.map((result) =>
          result.user_id === userId
            ? { ...result, friendship_state: "accepted", friendship_id: friendshipId }
            : result
        )
      )
      setFeedback({ tone: "success", message: `Bạn và ${name} đã trở thành bạn bè.` })
    } catch (requestError) {
      setFeedback({
        tone: "error",
        message: requestMessage(requestError, "Chưa thể chấp nhận lời mời."),
      })
    } finally {
      markPending(key, false)
    }
  }

  async function handleDestructiveAction() {
    if (!destructiveTarget) return
    const key = `delete-${destructiveTarget.friendshipId}`
    if (pendingKeys.has(key)) return
    markPending(key, true)
    setFeedback(null)
    try {
      await declineOrRemoveFriend(destructiveTarget.friendshipId)
      setFriends((current) =>
        current.filter((friend) => friend.friendship_id !== destructiveTarget.friendshipId)
      )
      setRequests((current) =>
        current.filter((request) => request.friendship_id !== destructiveTarget.friendshipId)
      )
      setSearchResults((current) =>
        current.map((result) =>
          result.user_id === destructiveTarget.userId
            ? { ...result, friendship_state: "none", friendship_id: null }
            : result
        )
      )
      setFeedback({
        tone: "success",
        message:
          destructiveTarget.kind === "remove"
            ? `Đã hủy kết bạn với ${destructiveTarget.name}.`
            : `Đã từ chối lời mời của ${destructiveTarget.name}.`,
      })
      setDestructiveTarget(null)
    } catch (requestError) {
      setFeedback({
        tone: "error",
        message: requestMessage(requestError, "Chưa thể hoàn tất thao tác."),
      })
    } finally {
      markPending(key, false)
    }
  }

  function renderSearchAction(person: FriendSearchResult) {
    const pending = pendingKeys.has(`send-${person.user_id}`)
    if (person.friendship_state === "accepted") {
      return <Button type="button" variant="glass" size="app" disabled><CheckIcon aria-hidden="true" />Bạn bè</Button>
    }
    if (person.friendship_state === "pending_sent") {
      return <Button type="button" variant="glass" size="app" disabled><Clock3Icon aria-hidden="true" />Đã gửi lời mời</Button>
    }
    if (person.friendship_state === "pending_received" && person.friendship_id) {
      return (
        <Button
          type="button"
          variant="product"
          size="app"
          disabled={pendingKeys.has(`accept-${person.friendship_id}`)}
          onClick={() => void handleAccept(person.friendship_id!, person.user_id, person.username)}
        >
          <CheckIcon aria-hidden="true" />
          Chấp nhận
        </Button>
      )
    }
    return (
      <Button
        type="button"
        variant="product"
        size="app"
        disabled={pending}
        aria-busy={pending}
        onClick={() => void handleSendRequest(person)}
      >
        <UserPlusIcon aria-hidden="true" />
        {pending ? "Đang gửi…" : "Kết bạn"}
      </Button>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">


      {feedback ? <div aria-live="polite"><InlineFeedback tone={feedback.tone}>{feedback.message}</InlineFeedback></div> : null}

      {!resolved || loading ? (
        <AsyncContentState kind="loading" title="Đang tải vòng kết nối" description="EngFlex đang đồng bộ bạn bè và lời mời của bạn." />
      ) : error ? (
        <AsyncContentState kind="error" title="Không thể tải kết nối" description={error} onRetry={() => void loadData()} />
      ) : (
        <ProductReveal delay={0.07}>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FriendsTab)}>
            <TabsList
              variant="line"
              aria-label="Danh mục bạn bè"
              className="w-full justify-start overflow-x-auto border-b border-stroke-subtle pb-2"
            >
              <TabsTrigger value="all" className="min-h-11 px-4">Tất cả <Badge variant="neutral">{friends.length}</Badge></TabsTrigger>
              <TabsTrigger value="requests" className="min-h-11 px-4">Lời mời <Badge variant={requests.length ? "attention" : "neutral"}>{requests.length}</Badge></TabsTrigger>
              <TabsTrigger value="search" className="min-h-11 px-4">Tìm bạn</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <section aria-labelledby="friends-list-heading" className="space-y-4">
                <h2 id="friends-list-heading" className="sr-only">Danh sách bạn bè</h2>
                {friends.length === 0 ? (
                  <AsyncContentState
                    kind="empty"
                    title="Vòng kết nối còn trống"
                    description="Mở tab Tìm bạn để kết nối với những học viên khác."
                    action={<Button type="button" variant="product" size="app" onClick={() => setActiveTab("search")}><SearchIcon aria-hidden="true" />Tìm bạn học</Button>}
                  />
                ) : friends.map((friend) => (
                  <PersonCard
                    key={friend.friendship_id}
                    person={friend}
                    metadata="Bạn bè trong cộng đồng EngFlex"
                    actions={
                      <Button
                        type="button"
                        variant="destructive"
                        size="app"
                        onClick={() => {
                          setFeedback(null)
                          setDestructiveTarget({
                            friendshipId: friend.friendship_id,
                            userId: friend.user_id,
                            name: friend.username,
                            kind: "remove",
                          })
                        }}
                      >
                        <UserMinusIcon aria-hidden="true" />
                        Hủy kết bạn
                      </Button>
                    }
                  />
                ))}
              </section>
            </TabsContent>

            <TabsContent value="requests" className="mt-6">
              <section aria-labelledby="requests-heading" className="space-y-4">
                <h2 id="requests-heading" className="sr-only">Lời mời kết bạn</h2>
                {requests.length === 0 ? (
                  <AsyncContentState kind="empty" title="Không có lời mời đang chờ" description="Khi có người muốn kết nối, lời mời sẽ xuất hiện ở đây." />
                ) : requests.map((request) => {
                  const acceptPending = pendingKeys.has(`accept-${request.friendship_id}`)
                  return (
                    <PersonCard
                      key={request.friendship_id}
                      person={request}
                      metadata={`Gửi lời mời ${new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(request.created_at))}`}
                      actions={
                        <>
                          <Button
                            type="button"
                            variant="product"
                            size="app"
                            disabled={acceptPending}
                            aria-busy={acceptPending}
                            onClick={() => void handleAccept(request.friendship_id, request.user_id, request.username)}
                          >
                            <CheckIcon aria-hidden="true" />
                            {acceptPending ? "Đang nhận…" : "Chấp nhận"}
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="app"
                            onClick={() => {
                              setFeedback(null)
                              setDestructiveTarget({
                                friendshipId: request.friendship_id,
                                userId: request.user_id,
                                name: request.username,
                                kind: "decline",
                              })
                            }}
                          >
                            <XIcon aria-hidden="true" />
                            Từ chối
                          </Button>
                        </>
                      }
                    />
                  )
                })}
              </section>
            </TabsContent>

            <TabsContent value="search" className="mt-6">
              <section aria-labelledby="search-heading" className="space-y-5">
                <div>
                  <h2 id="search-heading" className="text-2xl font-semibold text-foreground">Tìm bạn học mới</h2>
                  <p className="mt-2 text-copy-muted">Tìm theo tên hoặc email. EngFlex chỉ hiển thị thông tin hồ sơ công khai.</p>
                </div>
                <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSearch} role="search">
                  <div className="flex-1">
                    <Label htmlFor="friend-search" className="sr-only">Tên hoặc email học viên</Label>
                    <Input
                      id="friend-search"
                      value={searchQuery}
                      className="h-12 rounded-control border-stroke-strong bg-surface-inner px-4"
                      placeholder="Ví dụ: Minh hoặc minh@example.com"
                      onChange={(event) => {
                        setSearchQuery(event.target.value)
                        if (!event.target.value.trim()) setSearchResults([])
                      }}
                    />
                  </div>
                  <Button type="submit" variant="product" size="app" disabled={!searchQuery.trim() || searching} aria-busy={searching}>
                    <SearchIcon aria-hidden="true" />
                    {searching ? "Đang tìm…" : "Tìm học viên"}
                  </Button>
                </form>
                <div className="space-y-4" aria-live="polite" aria-busy={searching}>
                  {searchResults.map((person) => (
                    <PersonCard
                      key={person.user_id}
                      person={person}
                      metadata={
                        person.friendship_state === "accepted"
                          ? "Đã kết nối với bạn"
                          : person.friendship_state === "pending_sent"
                            ? "Lời mời đang chờ phản hồi"
                            : person.friendship_state === "pending_received"
                              ? "Đã gửi lời mời tới bạn"
                              : "Học viên EngFlex"
                      }
                      actions={renderSearchAction(person)}
                    />
                  ))}
                </div>
              </section>
            </TabsContent>
          </Tabs>
        </ProductReveal>
      )}

      <ConfirmActionDialog
        open={Boolean(destructiveTarget)}
        onOpenChange={(open) => {
          const pending = destructiveTarget
            ? pendingKeys.has(`delete-${destructiveTarget.friendshipId}`)
            : false
          if (!open && !pending) setDestructiveTarget(null)
        }}
        title={destructiveTarget?.kind === "remove" ? "Hủy kết bạn?" : "Từ chối lời mời?"}
        description={
          destructiveTarget?.kind === "remove"
            ? `Bạn và ${destructiveTarget.name} sẽ không còn trong danh sách bạn bè.`
            : `Lời mời của ${destructiveTarget?.name ?? "học viên này"} sẽ bị xóa.`
        }
        confirmLabel={destructiveTarget?.kind === "remove" ? "Hủy kết bạn" : "Từ chối"}
        pending={Boolean(destructiveTarget && pendingKeys.has(`delete-${destructiveTarget.friendshipId}`))}
        error={destructiveTarget && feedback?.tone === "error" ? feedback.message : null}
        onConfirm={handleDestructiveAction}
      />
    </div>
  )
}
