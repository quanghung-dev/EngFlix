import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Báo cáo tiến độ học tập",
  description: "Theo dõi streak học tập, thời gian học và thống kê phát âm của bạn.",
}

export default function ProgressLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
