import type { Metadata } from "next"
import { notFound } from "next/navigation"

import ShadowingWorkspace from "@/components/shadowing/shadowing-workspace"
import { isPublicApiError } from "@/lib/public-api"
import { getStudyContent } from "@/services/lesson.service"

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

  let content
  try {
    content = (await getStudyContent(parsedId)).data
  } catch (error) {
    if (isPublicApiError(error) && error.status === 404) notFound()
    throw error
  }

  return <ShadowingWorkspace lessonId={parsedId} initialContent={content} />
}
