import type { ReactNode } from "react"
import { cookies } from "next/headers"

import { ProductShell } from "@/components/product-shell"

export default async function ProductLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies()
  const savedState = cookieStore.get("sidebar_state")?.value
  const defaultSidebarOpen =
    savedState === undefined ? true : savedState === "true"

  return (
    <ProductShell defaultSidebarOpen={defaultSidebarOpen}>
      {children}
    </ProductShell>
  )
}
