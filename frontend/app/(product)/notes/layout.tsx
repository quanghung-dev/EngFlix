import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Ghi chú của tôi",
  description: "Quản lý và ôn luyện các câu thoại đã lưu từ các bài học.",
}

export default function NotesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
