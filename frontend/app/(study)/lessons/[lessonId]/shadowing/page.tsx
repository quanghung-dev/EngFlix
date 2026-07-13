import type { Metadata } from "next"
import { notFound } from "next/navigation"

import ShadowingWorkspace from "@/components/shadowing/shadowing-workspace"

export const metadata: Metadata = {
  title: "Luyện nói nhại giọng (Shadowing)",
  description: "Nghe, nhại giọng nói theo nhân vật và nhận đánh giá phát âm chi tiết bằng trí tuệ nhân tạo.",
}

interface PageProps {
  params: Promise<{
    lessonId: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { lessonId } = await params
  const parsedId = Number(lessonId)

  if (!Number.isSafeInteger(parsedId) || parsedId <= 0) {
    notFound()
  }

  return <ShadowingWorkspace lessonId={parsedId} />
}
