import type { Metadata } from "next"

import { StudyAuthBoundary } from "@/components/study-auth-boundary"

export const metadata: Metadata = {
  title: "Học tập",
  description: "Luyện nghe chính tả và nhại giọng phát âm.",
}

export default function LessonsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <StudyAuthBoundary>{children}</StudyAuthBoundary>
}
