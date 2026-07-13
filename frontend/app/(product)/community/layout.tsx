import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cộng đồng EngFlex",
  description: "Chia sẻ bài viết, giao lưu cùng cộng đồng tự học tiếng Anh.",
}

export default function CommunityLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
