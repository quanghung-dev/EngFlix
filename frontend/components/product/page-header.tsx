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
        <div className="flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.2em] text-brand-cyan uppercase">
          {eyebrow}
        </div>
        <h1 className="mt-4 text-4xl leading-[1.08] font-semibold tracking-[-0.045em] text-foreground lg:text-5xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-copy-muted sm:text-lg sm:leading-8">
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
