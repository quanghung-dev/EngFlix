import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Danh sách bạn bè",
  description: "Kết nối và thi đua cùng các học viên khác.",
}

export default function FriendsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
