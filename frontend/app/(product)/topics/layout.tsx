import type { Metadata } from "next"

import { Providers } from "@/components/providers"

export const metadata: Metadata = {
  title: "Chủ đề học",
  description: "Khám phá các bài học tiếng Anh qua phim theo từng chủ đề.",
}

export default function TopicsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <Providers>{children}</Providers>
}
