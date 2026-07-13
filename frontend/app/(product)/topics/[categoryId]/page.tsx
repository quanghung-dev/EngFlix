import type { Metadata } from "next"
import { notFound } from "next/navigation"

import LessonDetail from "@/components/topics/lessonDetail"

export const metadata: Metadata = {
  title: "Bài học theo chủ đề",
}

interface PageProps {
  params: Promise<{
    categoryId: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { categoryId } = await params
  const parsedId = Number(categoryId)

  if (!Number.isSafeInteger(parsedId) || parsedId <= 0) {
    notFound()
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
      <LessonDetail categoryId={parsedId} />
    </div>
  )
}
