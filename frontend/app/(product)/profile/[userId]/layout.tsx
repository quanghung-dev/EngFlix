import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Trang cá nhân học viên",
  description: "Trang cá nhân học viên EngFlex.",
}

export default function ProfileLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
