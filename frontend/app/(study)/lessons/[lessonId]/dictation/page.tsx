import type { Metadata } from "next"
import { notFound } from "next/navigation"

import DictationWorkspace from "@/components/dictation/dictation-workspace"
import { isPublicApiError } from "@/lib/public-api"
import { getStudyContent } from "@/services/lesson.service"

export const metadata: Metadata = {
  title: "Luyện nghe chính tả",
  description: "Nghe và chép chính tả các câu thoại trong phim để rèn luyện kỹ năng nghe.",
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

  return <DictationWorkspace lessonId={parsedId} initialContent={content} />
}
