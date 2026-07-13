import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Trắc nghiệm từ vựng",
  description: "Luyện phản xạ từ vựng theo nhịp 10 giây hoặc không giới hạn thời gian.",
}

export default function QuizLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
