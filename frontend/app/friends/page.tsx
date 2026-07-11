"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Search,
  MessageSquare,
  X,
  ShieldCheck,
  Award,
  Crown,
  Info,
  RotateCw,
  Mail,
  UserMinus,
  Check,
  UserCheck2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import {
  getFriends,
  getIncomingRequests,
  sendFriendRequest,
  acceptFriendRequest,
  declineOrRemoveFriend,
  searchNewFriends,
  FriendType,
  FriendRequestType,
  SearchUserResultType
} from "@/services/friendship.service"

export default function FriendsPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)

  // State Tabs chính
  const [activeTab, setActiveTab] = useState<"all" | "requests" | "search">("all")

  // Dữ liệu danh sách
  const [friends, setFriends] = useState<FriendType[]>([])
  const [incomingRequests, setIncomingRequests] = useState<FriendRequestType[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchUserResultType[]>([])
  
  // Trạng thái loading
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)

  // State Modal xem hồ sơ
  const [selectedUser, setSelectedUser] = useState<any | null>(null)

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

  // Tải toàn bộ dữ liệu ban đầu
  const loadData = async () => {
    try {
      setLoading(true)
      const [friendsRes, requestsRes] = await Promise.all([
        getFriends(),
        getIncomingRequests()
      ])
      setFriends(friendsRes.data || [])
      setIncomingRequests(requestsRes.data || [])
    } catch (err) {
      console.error("Lỗi tải thông tin bạn bè:", err)
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    if (currentUser) {
      void loadData()
    }
  }, [currentUser])

  // Xử lý tìm kiếm học viên khác để kết bạn
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      const res = await searchNewFriends(searchQuery.trim())
      setSearchResults(res.data || [])
    } catch (err) {
      console.error("Lỗi tìm kiếm học viên:", err)
    } finally {
      setSearching(false)
    }
  }

  // Tự động tìm kiếm khi xoá trắng ô tìm kiếm
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
    }
  }, [searchQuery])

  // Gửi lời mời kết bạn mới
  const handleSendRequest = async (userId: string) => {
    try {
      await sendFriendRequest(userId)
      // Cập nhật trạng thái hiển thị trên giao diện tìm kiếm
      setSearchResults((prev) =>
        prev.map((u) =>
          u.user_id === userId ? { ...u, friendship_state: "pending_sent" } : u
        )
      )
    } catch (err) {
      console.error("Lỗi gửi lời mời kết bạn:", err)
    }
  }

  // Chấp nhận lời mời kết bạn
  const handleAcceptRequest = async (friendshipId: number) => {
    try {
      await acceptFriendRequest(friendshipId)
      // Tải lại dữ liệu để cập nhật danh sách bạn bè & lời mời
      await loadData()
    } catch (err) {
      console.error("Lỗi đồng ý kết bạn:", err)
    }
  }

  // Từ chối lời mời hoặc Hủy kết bạn (xoá bạn bè)
  const handleDeclineOrRemove = async (friendshipId: number, name: string, isUnfriend = false) => {
    const msg = isUnfriend 
      ? `Bạn có chắc chắn muốn hủy kết bạn với ${name}?`
      : `Từ chối lời mời kết bạn từ ${name}?`
    
    if (!confirm(msg)) return

    try {
      await declineOrRemoveFriend(friendshipId)
      // Tải lại danh sách
      await loadData()
      // Nếu đang ở màn tìm kiếm, cập nhật trạng thái về none
      setSearchResults((prev) =>
        prev.map((u) =>
          u.friendship_id === friendshipId 
            ? { ...u, friendship_state: "none", friendship_id: null } 
            : u
        )
      )
    } catch (err) {
      console.error("Lỗi hủy/từ chối kết bạn:", err)
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
      
      {/* Header trang bạn bè */}
      <div className="flex items-center gap-4 pb-6 border-b border-stroke mb-8">
        <div className="size-14 relative shrink-0">
          <Image
            src="/owl-speaking-cinematic.webp"
            alt="EngFlex Owl"
            width={56}
            height={56}
            className="size-full object-contain"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Bạn bè của tôi
          </h1>
          <p className="text-xs text-copy-muted mt-1">
            Kết nối, học tập và thi đua cùng các học viên khác
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center justify-between border-b border-stroke pb-4 mb-6">
        <div className="flex bg-surface-panel p-1 rounded-control border border-stroke">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-4 py-2 text-xs font-mono tracking-wider uppercase rounded-control transition flex items-center gap-1.5",
              activeTab === "all"
                ? "bg-brand-cyan/10 text-brand-cyan font-bold"
                : "text-copy-muted hover:text-white"
            )}
          >
            <Users className="size-3.5" /> Tất cả bạn bè ({friends.length})
          </button>
          
          <button
            onClick={() => setActiveTab("requests")}
            className={cn(
              "px-4 py-2 text-xs font-mono tracking-wider uppercase rounded-control transition flex items-center gap-1.5 relative",
              activeTab === "requests"
                ? "bg-brand-cyan/10 text-brand-cyan font-bold"
                : "text-copy-muted hover:text-white"
            )}
          >
            <UserPlus className="size-3.5" /> Lời mời kết bạn
            {incomingRequests.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 size-5 bg-destructive rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                {incomingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("search")}
            className={cn(
              "px-4 py-2 text-xs font-mono tracking-wider uppercase rounded-control transition flex items-center gap-1.5",
              activeTab === "search"
                ? "bg-brand-cyan/10 text-brand-cyan font-bold"
                : "text-copy-muted hover:text-white"
            )}
          >
            <Search className="size-3.5" /> Tìm bạn mới
          </button>
        </div>

        {/* Nút Refresh */}
        <Button
          variant="glass"
          size="icon-sm"
          onClick={loadData}
          disabled={loading}
          className="rounded-control text-copy-subtle hover:text-white"
          title="Làm mới danh sách"
        >
          <RotateCw className={cn("size-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* HIỂN THỊ NỘI DUNG TỪNG TAB */}
      {loading ? (
        <div className="flex h-60 flex-col items-center justify-center gap-4 text-copy-secondary">
          <div className="size-8 animate-spin rounded-full border-4 border-brand-cyan border-t-transparent" />
          <p className="font-mono text-xs text-brand-cyan uppercase tracking-widest animate-pulse">
            Đang tải dữ liệu...
          </p>
        </div>
      ) : (
        <>
          {/* TAB 1: TẤT CẢ BẠN BÈ */}
          {activeTab === "all" && (
            <div>
              {friends.length === 0 ? (
                <div className="flex h-60 flex-col items-center justify-center text-center gap-4 max-w-sm mx-auto">
                  <Users className="size-16 text-copy-subtle/30" />
                  <h3 className="text-base font-semibold text-copy-secondary">Chưa có bạn bè nào</h3>
                  <p className="text-xs text-copy-muted">
                    Hãy chuyển sang tab "Tìm bạn mới" để tìm kiếm và kết bạn cùng những người học khác trên EngFlex nhé!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friends.map((friend) => (
                    <div
                      key={friend.user_id}
                      className="flex items-center justify-between p-4 rounded-panel border border-stroke bg-surface-panel hover:border-stroke-strong hover:bg-surface-glass transition duration-300 shadow-card"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar bạn bè */}
                        <div
                          className="relative cursor-pointer hover:brightness-110 transition shrink-0"
                          onClick={() => setSelectedUser(friend)}
                          title="Xem thông tin chi tiết"
                        >
                          <div className="size-11 rounded-full border border-stroke-strong overflow-hidden bg-surface-inner flex items-center justify-center font-bold text-copy-secondary">
                            {friend.avatar_url ? (
                              <img src={friend.avatar_url} alt="" className="size-full object-cover" />
                            ) : (
                              friend.username.charAt(0).toUpperCase()
                            )}
                          </div>
                          {/* Dấu online */}
                          <div className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-surface-panel bg-status-success" />
                        </div>

                        {/* Thông tin tên & level */}
                        <div>
                          <div className="flex items-center gap-1 font-semibold text-sm">
                            {friend.username}
                            {renderBadge(friend.badge_type)}
                          </div>
                          <div className="text-[10px] font-mono text-copy-muted mt-1">
                            Cấp độ: <span className="text-status-success font-bold">Lv.{friend.level}</span>
                          </div>
                        </div>
                      </div>

                      {/* Các hành động nhắn tin/huỷ kết bạn */}
                      <div className="flex items-center gap-2">
                        <Link href="/chat">
                          <Button
                            variant="product"
                            size="sm"
                            className="font-mono text-[10px] uppercase gap-1"
                            title="Mở chat"
                          >
                            <MessageSquare className="size-3" /> Nhắn tin
                          </Button>
                        </Link>
                        <Button
                          variant="glass"
                          size="icon-sm"
                          onClick={() => handleDeclineOrRemove(friend.friendship_id, friend.username, true)}
                          className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive/40"
                          title="Hủy kết bạn"
                        >
                          <UserMinus className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LỜI MỜI KẾT BẠN NHẬN ĐƯỢC */}
          {activeTab === "requests" && (
            <div className="max-w-2xl mx-auto space-y-4">
              {incomingRequests.length === 0 ? (
                <div className="flex h-60 flex-col items-center justify-center text-center gap-4 max-w-sm mx-auto">
                  <UserPlus className="size-16 text-copy-subtle/30" />
                  <h3 className="text-base font-semibold text-copy-secondary">Không có lời mời nào</h3>
                  <p className="text-xs text-copy-muted">
                    Hiện tại bạn không có lời mời kết bạn nào đang chờ duyệt.
                  </p>
                </div>
              ) : (
                incomingRequests.map((req) => (
                  <div
                    key={req.friendship_id}
                    className="flex items-center justify-between p-4 rounded-panel border border-stroke bg-surface-panel hover:border-stroke-strong transition duration-300"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div
                        className="size-11 rounded-full border border-stroke-strong overflow-hidden bg-surface-inner flex items-center justify-center font-bold text-copy-secondary cursor-pointer hover:brightness-110 transition shrink-0"
                        onClick={() => setSelectedUser(req)}
                        title="Xem thông tin"
                      >
                        {req.avatar_url ? (
                          <img src={req.avatar_url} alt="" className="size-full object-cover" />
                        ) : (
                          req.username.charAt(0).toUpperCase()
                        )}
                      </div>

                      {/* Tên & Level */}
                      <div>
                        <div className="flex items-center gap-1 font-semibold text-sm">
                          {req.username}
                          {renderBadge(req.badge_type)}
                        </div>
                        <div className="text-[10px] font-mono text-copy-muted mt-1">
                          Cấp độ: <span className="text-status-success font-bold">Lv.{req.level}</span>
                        </div>
                      </div>
                    </div>

                    {/* Đồng ý / Từ chối */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="product"
                        size="sm"
                        onClick={() => handleAcceptRequest(req.friendship_id)}
                        className="font-mono text-[10px] uppercase gap-1"
                      >
                        <Check className="size-3.5" /> Chấp nhận
                      </Button>
                      <Button
                        variant="glass"
                        size="sm"
                        onClick={() => handleDeclineOrRemove(req.friendship_id, req.username, false)}
                        className="font-mono text-[10px] uppercase text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                      >
                        <UserX className="size-3.5" /> Từ chối
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: TÌM BẠN MỚI */}
          {activeTab === "search" && (
            <div className="max-w-2xl mx-auto space-y-6">
              
              {/* Form Tìm kiếm */}
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  required
                  placeholder="Nhập tên hiển thị hoặc địa chỉ email học viên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-surface-panel border-stroke h-10 text-xs rounded-control flex-1 focus:border-brand-cyan/40"
                />
                <Button
                  type="submit"
                  variant="product"
                  disabled={searching || !searchQuery.trim()}
                  className="h-10 px-5 font-mono text-xs uppercase gap-1.5"
                >
                  <Search className="size-3.5" /> {searching ? "Đang tìm..." : "Tìm kiếm"}
                </Button>
              </form>

              {/* Kết quả tìm kiếm */}
              {searching ? (
                <div className="flex justify-center py-10">
                  <div className="size-6 animate-spin rounded-full border-4 border-brand-cyan border-t-transparent" />
                </div>
              ) : searchResults.length === 0 && searchQuery.trim() ? (
                <div className="text-center py-10 text-copy-muted text-xs">
                  Không tìm thấy học viên nào khớp với từ khóa tìm kiếm.
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.map((user) => (
                    <div
                      key={user.user_id}
                      className="flex items-center justify-between p-4 rounded-panel border border-stroke bg-surface-panel hover:border-stroke-strong transition duration-300"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div
                          className="size-11 rounded-full border border-stroke-strong overflow-hidden bg-surface-inner flex items-center justify-center font-bold text-copy-secondary cursor-pointer hover:brightness-110 transition shrink-0"
                          onClick={() => setSelectedUser(user)}
                          title="Xem thông tin"
                        >
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="size-full object-cover" />
                          ) : (
                            user.username.charAt(0).toUpperCase()
                          )}
                        </div>

                        {/* Tên & Level */}
                        <div>
                          <div className="flex items-center gap-1 font-semibold text-sm">
                            {user.username}
                            {renderBadge(user.badge_type)}
                          </div>
                          <div className="text-[10px] font-mono text-copy-muted mt-1">
                            Cấp độ: <span className="text-status-success font-bold">Lv.{user.level}</span>
                          </div>
                        </div>
                      </div>

                      {/* Các nút hành động tương ứng trạng thái */}
                      <div>
                        {user.friendship_state === "none" && (
                          <Button
                            variant="product"
                            size="sm"
                            onClick={() => handleSendRequest(user.user_id)}
                            className="font-mono text-[10px] uppercase gap-1"
                          >
                            <UserPlus className="size-3.5" /> Kết bạn
                          </Button>
                        )}
                        {user.friendship_state === "pending_sent" && (
                          <Button
                            variant="glass"
                            size="sm"
                            disabled
                            className="font-mono text-[10px] uppercase gap-1 bg-surface-inner text-copy-muted border-stroke cursor-not-allowed opacity-70"
                          >
                            <RotateCw className="size-3 animate-spin mr-1" /> Đã gửi yêu cầu
                          </Button>
                        )}
                        {user.friendship_state === "pending_received" && (
                          <Button
                            variant="product"
                            size="sm"
                            onClick={() => handleAcceptRequest(user.friendship_id!)}
                            className="font-mono text-[10px] uppercase gap-1"
                          >
                            <Check className="size-3.5" /> Chấp nhận
                          </Button>
                        )}
                        {user.friendship_state === "accepted" && (
                          <Button
                            variant="glass"
                            size="sm"
                            disabled
                            className="font-mono text-[10px] uppercase gap-1 text-brand-cyan border-brand-cyan/20 bg-brand-cyan/5 cursor-not-allowed opacity-80"
                          >
                            <UserCheck2 className="size-3.5" /> Bạn bè
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* MODAL CHI TIẾT HỒ SƠ HỌC VIÊN KHÁC (READ-ONLY - ẨN SỐ ĐIỆN THOẠI) */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-panel border border-stroke bg-canvas-deep p-6 text-white shadow-modal mx-4 relative animate-scale-in">
            {/* Nút đóng */}
            <button
              onClick={() => setSelectedUser(null)}
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
                {selectedUser.avatar_url ? (
                  <img
                    src={selectedUser.avatar_url}
                    alt=""
                    className="size-full rounded-full object-cover"
                  />
                ) : (
                  selectedUser.username.charAt(0).toUpperCase()
                )}
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <h4 className="text-base font-bold text-white">
                    {selectedUser.username}
                  </h4>
                  {renderBadge(selectedUser.badge_type)}
                </div>
                <Badge variant="success" className="font-mono text-[9px] uppercase tracking-wider mt-1 px-2 py-0.5">
                  LEVEL {selectedUser.level}
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
                  {selectedUser.badge_type === "verify" && "Người dùng xác thực"}
                  {selectedUser.badge_type === "crown" && "Học viên VIP"}
                  {selectedUser.badge_type === "medal" && "Top tuần"}
                  {selectedUser.badge_type === "none" && "Thành viên mới"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stroke/5">
                <span className="text-copy-muted">Email công khai:</span>
                <span className="font-medium text-copy-secondary">
                  {selectedUser.username.toLowerCase().replaceAll(" ", "")}@engflex.vn
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-stroke pt-4">
              <Button
                variant="glass"
                size="sm"
                onClick={() => setSelectedUser(null)}
                className="font-mono text-xs uppercase"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
