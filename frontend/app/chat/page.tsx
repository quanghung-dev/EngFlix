"use client"

import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  MessageSquare,
  Users,
  RotateCw,
  Send,
  Smile,
  ChevronDown,
  ShieldCheck,
  Award,
  Crown,
  Plus,
  X
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { getChatMessages, sendChatMessage, ChatMessageType } from "@/services/chat.service"

interface FriendType {
  id: string
  username: string
  level: number
  status: "online" | "offline"
  avatarUrl: string | null
  badgeType: "verify" | "medal" | "crown" | "none"
}

export default function ChatPage() {
  const router = useRouter()

  // State Tabs chính
  const [activeTab, setActiveTab] = useState<"community" | "friends">("community")

  // State User hiện tại
  const [currentUser, setCurrentUser] = useState<any>(null)

  // State tin nhắn & cuộn
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [inputText, setInputText] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)

  // State bạn bè
  const [friendsList, setFriendsList] = useState<FriendType[]>([])

  // State xem hồ sơ người lạ
  const [selectedStranger, setSelectedStranger] = useState<ChatMessageType | null>(null)

  // Theo dõi trạng thái đăng nhập
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

  // Tải danh sách tin nhắn từ API thật (PostgreSQL)
  const loadMessages = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      const res = await getChatMessages({ limit: 50 })
      setMessages(res.data || [])
      setError(null)
    } catch (err) {
      console.error("Lỗi tải tin nhắn chat:", err)
      setError("Không thể tải tin nhắn từ máy chủ.")
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  // Tải tin nhắn & bạn bè ban đầu + Tự động đồng bộ mỗi 5s
  useEffect(() => {
    void loadMessages(true)

    // Tự động kiểm tra tin nhắn mới mỗi 5 giây (polling)
    const interval = setInterval(() => {
      if (activeTab === "community") {
        void loadMessages(false)
      }
    }, 5000)

    // Tạo danh sách bạn bè mẫu dựa theo DB thực tế (bạn bè giả lập để giao diện đầy đủ)
    const initialFriends: FriendType[] = [
      { id: "fr-1", username: "Thuyduongggg", level: 12, status: "online", avatarUrl: null, badgeType: "verify" },
      { id: "fr-2", username: "✦TB✦", level: 7, status: "online", avatarUrl: null, badgeType: "verify" },
      { id: "fr-3", username: "ai khùng đâu đi vocab vs m", level: 24, status: "online", avatarUrl: null, badgeType: "medal" },
      { id: "fr-4", username: "Anhdung_IELTS", level: 19, status: "offline", avatarUrl: null, badgeType: "crown" },
      { id: "fr-5", username: "Thỏ", level: 12, status: "offline", avatarUrl: null, badgeType: "none" }
    ]
    setFriendsList(initialFriends)

    return () => clearInterval(interval)
  }, [activeTab])

  // Tự động cuộn xuống cuối tin nhắn
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Cuộn xuống cuối khi có tin mới hoặc khi mới tải xong
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages])

  // Lắng nghe sự kiện cuộn để hiển thị nút cuộn xuống dưới
  const handleScroll = () => {
    const container = messagesContainerRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const isCloseToBottom = scrollHeight - scrollTop - clientHeight < 200
    setShowScrollBottomBtn(!isCloseToBottom)
  }

  // Gửi tin nhắn mới qua API thật
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const textToSend = inputText.trim()
    setInputText("") // xoá input trước để nâng cao trải nghiệm

    try {
      const res = await sendChatMessage(textToSend)
      if (res.data) {
        setMessages((prev) => [...prev, res.data])
      }
    } catch (err) {
      console.error("Gửi tin nhắn thất bại:", err)
      alert("Không thể gửi tin nhắn. Vui lòng thử lại.")
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
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-canvas text-white">
      
      {/* Menu Header của Trang Chat */}
      <div className="flex items-center justify-between border-b border-stroke px-5 py-4 lg:px-6">
        {/* Nhãn Tabs */}
        <div className="flex bg-surface-panel p-1 rounded-control border border-stroke">
          <button
            onClick={() => setActiveTab("community")}
            className={cn(
              "px-4 py-2 text-xs font-mono tracking-wider uppercase rounded-control transition flex items-center gap-1.5",
              activeTab === "community"
                ? "bg-brand-cyan/10 text-brand-cyan font-bold"
                : "text-copy-muted hover:text-white"
            )}
          >
            <MessageSquare className="size-3.5" /> Chat cộng đồng
          </button>
          <button
            onClick={() => setActiveTab("friends")}
            className={cn(
              "px-4 py-2 text-xs font-mono tracking-wider uppercase rounded-control transition flex items-center gap-1.5",
              activeTab === "friends"
                ? "bg-brand-cyan/10 text-brand-cyan font-bold"
                : "text-copy-muted hover:text-white"
            )}
          >
            <Users className="size-3.5" /> Bạn bè
          </button>
        </div>

        {/* Nút Refresh */}
        <Button
          variant="glass"
          size="icon-sm"
          onClick={() => void loadMessages(true)}
          className="rounded-control text-copy-subtle hover:text-white"
          title="Làm mới cuộc trò chuyện"
        >
          <RotateCw className="size-4" />
        </Button>
      </div>

      {/* VÙNG CHỨA NỘI DUNG CHÍNH */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        
        {/* A. TAB CHAT CỘNG ĐỒNG */}
        {activeTab === "community" && (
          <>
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-copy-secondary">
                <div className="size-6 animate-spin rounded-full border-4 border-brand-cyan border-t-transparent" />
                <span className="font-mono text-xs uppercase tracking-widest text-brand-cyan">
                  Đang tải tin nhắn...
                </span>
              </div>
            ) : error ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-2">
                <p className="text-xs text-copy-muted">{error}</p>
                <Button variant="glass" size="sm" onClick={() => void loadMessages(true)}>
                  Thử lại
                </Button>
              </div>
            ) : (
              /* Danh sách tin nhắn cuộn */
              <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-5 py-6 space-y-6 lg:px-8"
              >
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-copy-muted text-xs p-6 gap-2">
                    <MessageSquare className="size-8 text-copy-subtle/30" />
                    Chưa có tin nhắn nào. Hãy gửi tin nhắn đầu tiên để bắt đầu trò chuyện!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.user_id === currentUser?.uid
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex items-start gap-3.5 max-w-3xl animate-fade-in",
                          isMe && "ml-auto flex-row-reverse"
                        )}
                      >
                        {/* Cột ảnh đại diện với Level Badge */}
                        <div
                          className={cn("relative shrink-0", !isMe && "cursor-pointer hover:brightness-110 transition")}
                          onClick={() => {
                            if (!isMe) {
                              setSelectedStranger(msg)
                            }
                          }}
                          title={!isMe ? "Xem hồ sơ học viên" : undefined}
                        >
                          <div className="size-10 rounded-full border border-stroke-strong overflow-hidden bg-surface-inner flex items-center justify-center font-bold text-sm text-copy-secondary">
                            {msg.avatar_url ? (
                              <Image
                                src={msg.avatar_url}
                                alt={msg.username}
                                width={40}
                                height={40}
                                className="size-full object-cover"
                              />
                            ) : (
                              msg.username.charAt(0).toUpperCase()
                            )}
                          </div>
                          
                          {/* Badge cấp độ ở góc dưới avatar */}
                          <div className="absolute -bottom-1 -right-1 bg-surface-panel border border-stroke px-1.5 py-0.5 rounded text-[8px] font-mono font-bold text-status-success scale-90">
                            Lv.{msg.level}
                          </div>
                        </div>

                        {/* Nội dung bong bóng chat */}
                        <div className={cn("space-y-1.5", isMe && "text-right")}>
                          {/* Tên & Huy hiệu */}
                          <div className={cn("flex items-center gap-1.5 text-xs text-copy-secondary", isMe && "flex-row-reverse")}>
                            <span className="font-semibold text-white">
                              {msg.username}
                            </span>
                            {renderBadge(msg.badge_type)}
                          </div>

                          {/* Văn bản tin nhắn */}
                          <div
                            className={cn(
                              "rounded-card px-4 py-2.5 text-sm leading-relaxed max-w-xl break-words",
                              isMe
                                ? "bg-brand-cyan/15 border border-brand-cyan/20 text-white rounded-tr-none text-left"
                                : "bg-surface-panel border border-stroke text-copy-secondary rounded-tl-none"
                            )}
                          >
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                
                {/* Vùng mốc cuộn */}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Nút bấm nổi cuộn xuống nhanh */}
            {showScrollBottomBtn && (
              <button
                onClick={scrollToBottom}
                className="absolute bottom-24 right-8 z-30 p-2.5 rounded-full border border-stroke-strong bg-brand-cyan text-canvas hover:bg-brand-cyan/95 transition shadow-modal animate-bounce"
                title="Cuộn xuống dưới"
              >
                <ChevronDown className="size-5" />
              </button>
            )}

            {/* Thanh nhập tin nhắn ở chân trang */}
            <div className="border-t border-stroke p-4 lg:px-8 bg-canvas-deep/40">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                
                {/* Input nhập */}
                <Input
                  placeholder="Nhập tin nhắn..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 h-11 text-sm bg-surface-panel border-stroke rounded-control focus:border-brand-cyan/40"
                  disabled={loading}
                />

                {/* Phím gửi */}
                <Button
                  type="submit"
                  variant="product"
                  className="h-11 px-5 rounded-control font-mono text-xs uppercase gap-1.5"
                  disabled={!inputText.trim() || loading}
                >
                  <Send className="size-4" /> Gửi
                </Button>

              </form>
            </div>
          </>
        )}

        {/* B. TAB BẠN BÈ */}
        {activeTab === "friends" && (
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 lg:px-8 max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-between pb-3 border-b border-stroke-subtle">
              <h3 className="text-sm font-semibold text-copy-secondary flex items-center gap-2">
                <Users className="size-4 text-brand-cyan" />
                Danh sách bạn bè ({friendsList.length})
              </h3>
              <Button variant="glass" size="sm" className="font-mono text-[10px] uppercase gap-1">
                <Plus className="size-3.5" /> Thêm bạn mới
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {friendsList.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-4 rounded-panel border border-stroke bg-surface-panel hover:border-stroke-strong hover:bg-surface-glass transition duration-300"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar bạn bè */}
                    <div className="relative">
                      <div className="size-11 rounded-full border border-stroke-strong overflow-hidden bg-surface-inner flex items-center justify-center font-bold text-copy-secondary">
                        {friend.username.charAt(0).toUpperCase()}
                      </div>
                      {/* Trạng thái online/offline */}
                      <div
                        className={cn(
                          "absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-surface-panel",
                          friend.status === "online" ? "bg-status-success" : "bg-copy-muted"
                        )}
                        title={friend.status === "online" ? "Online" : "Offline"}
                      />
                    </div>

                    {/* Tên & Level */}
                    <div>
                      <div className="flex items-center gap-1.5 text-sm font-semibold">
                        {friend.username}
                        {renderBadge(friend.badgeType)}
                      </div>
                      <div className="text-[10px] font-mono text-copy-muted mt-1">
                        Cấp độ: <span className="text-status-success font-bold">Lv.{friend.level}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => {
                        setActiveTab("community")
                        setInputText(`@${friend.username} `)
                      }}
                      className="text-xs font-mono uppercase"
                    >
                      Nhắc tên
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* MODAL XEM HỒ SƠ NGƯỜI LẠ (READ-ONLY) */}
      {selectedStranger && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-panel border border-stroke bg-canvas-deep p-6 text-white shadow-modal mx-4 relative animate-scale-in">
            {/* Nút đóng */}
            <button
              onClick={() => setSelectedStranger(null)}
              className="absolute right-4 top-4 p-1.5 rounded-full border border-stroke-strong bg-surface-inner text-copy-subtle hover:text-white transition"
            >
              <X className="size-4" />
            </button>

            <h3 className="text-base font-semibold font-mono tracking-wide uppercase text-brand-cyan mb-6 flex items-center gap-2">
              <Users className="size-5" /> Hồ sơ học viên
            </h3>

            {/* Avatar & Username */}
            <div className="flex flex-col items-center justify-center gap-3 border-b border-stroke pb-6 mb-6">
              <div className="size-16 rounded-full border-2 border-brand-cyan/40 bg-brand-cyan/10 flex items-center justify-center font-bold text-2xl text-brand-cyan shadow-[0_0_20px_rgba(110,231,242,0.15)]">
                {selectedStranger.avatar_url ? (
                  <img
                    src={selectedStranger.avatar_url}
                    alt=""
                    className="size-full rounded-full object-cover"
                  />
                ) : (
                  selectedStranger.username.charAt(0).toUpperCase()
                )}
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <h4 className="text-base font-bold text-white">
                    {selectedStranger.username}
                  </h4>
                  {renderBadge(selectedStranger.badge_type)}
                </div>
                <Badge variant="success" className="font-mono text-[9px] uppercase tracking-wider mt-1 px-2 py-0.5">
                  LEVEL {selectedStranger.level}
                </Badge>
              </div>
            </div>

            {/* Thông tin hiển thị (Read-only - ẨN SỐ ĐIỆN THOẠI) */}
            <div className="space-y-4 text-sm">
              <div className="flex justify-between py-1.5 border-b border-stroke/5">
                <span className="text-copy-muted">Vai trò:</span>
                <span className="font-medium text-white">Học viên</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stroke/5">
                <span className="text-copy-muted">Danh hiệu:</span>
                <span className="font-medium text-brand-cyan">
                  {selectedStranger.badge_type === "verify" && "Người dùng xác thực"}
                  {selectedStranger.badge_type === "crown" && "Học viên VIP"}
                  {selectedStranger.badge_type === "medal" && "Top tuần"}
                  {selectedStranger.badge_type === "none" && "Thành viên mới"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stroke/5">
                <span className="text-copy-muted">Email công khai:</span>
                <span className="font-medium text-copy-secondary">
                  {selectedStranger.username.toLowerCase().replaceAll(" ", "")}@engflex.vn
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-stroke pt-4">
              <Button
                variant="glass"
                size="sm"
                onClick={() => setSelectedStranger(null)}
                className="font-mono text-xs uppercase"
              >
                Đóng
              </Button>
              <Button
                variant="product"
                size="sm"
                onClick={() => {
                  setInputText(`@${selectedStranger.username} `)
                  setSelectedStranger(null)
                }}
                className="font-mono text-xs uppercase gap-1"
              >
                Nhắc tên
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
  )
}
