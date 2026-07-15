import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface ProductPageHeaderProps {
  eyebrow: ReactNode
  title: ReactNode
  description: ReactNode
  actions?: ReactNode
  aside?: ReactNode
  className?: string
}

export function ProductPageHeader({
  eyebrow,
  title,
  description,
  actions,
  aside,
  className,
}: ProductPageHeaderProps) {
  return (
    <header
      className={cn(
        "grid gap-8 border-b border-stroke-subtle pb-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end",
        className
      )}
    >
      <div className="max-w-3xl">
        <div className="type-meta flex items-center gap-2 text-brand-cyan">
          {eyebrow}
        </div>
        <h1 className="type-page-title mt-4 text-foreground">
          {title}
        </h1>
        <p className="type-body mt-5 max-w-2xl text-copy-muted sm:text-lg">
          {description}
        </p>
        {actions ? (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {actions}
          </div>
        ) : null}
      </div>
      {aside ? <div className="lg:justify-self-end">{aside}</div> : null}
    </header>
  )
}
