import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Chat cộng đồng",
  description: "Trò chuyện, thảo luận học tập và kết nối bạn bè trên EngFlex.",
}

export default function ChatLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
