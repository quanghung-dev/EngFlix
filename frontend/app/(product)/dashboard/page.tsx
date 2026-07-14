import type { Metadata } from "next"
import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace"

export const metadata: Metadata = {
  title: "Trang chủ",
  description: "Trang chủ học tập của bạn trên EngFlex. Theo dõi tiến độ, đặt mục tiêu và tiếp tục các bài học phim thú vị.",
}

export default function DashboardPage() {
  return <DashboardWorkspace />
}
