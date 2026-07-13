import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Kho từ vựng",
  description: "Quản lý các bộ từ vựng cá nhân, ôn tập từ vựng bằng Flashcards 3D.",
}

export default function VocabularyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
