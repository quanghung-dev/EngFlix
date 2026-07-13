import type { ReactNode } from "react"
import {
  CircleAlertIcon,
  InboxIcon,
  RefreshCwIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type AsyncStateKind = "loading" | "empty" | "error"
type HeadingLevel = "h1" | "h2" | "h3"

interface AsyncContentStateProps {
  kind: AsyncStateKind
  title: string
  description: string
  action?: ReactNode
  onRetry?: () => void
  icon?: ReactNode
  headingLevel?: HeadingLevel
  className?: string
}

export function AsyncContentState({
  kind,
  title,
  description,
  action,
  onRetry,
  icon,
  headingLevel = "h2",
  className,
}: AsyncContentStateProps) {
  const Heading = headingLevel
  const isError = kind === "error"

  return (
    <Card
      variant="product"
      role={isError ? "alert" : "status"}
      aria-busy={kind === "loading" || undefined}
      className={cn(isError && "border-destructive/30", className)}
    >
      <CardContent className="flex flex-col items-center py-5 text-center sm:py-10">
        <span
          className={cn(
            "grid size-16 place-items-center rounded-panel border",
            isError
              ? "border-destructive/25 bg-destructive/10 text-destructive"
              : "border-brand-cyan/20 bg-brand-cyan/10 text-brand-cyan"
          )}
        >
          {icon ??
            (isError ? (
              <CircleAlertIcon className="size-7" aria-hidden="true" />
            ) : (
              <InboxIcon className="size-7" aria-hidden="true" />
            ))}
        </span>
        <Heading className="mt-6 text-xl font-semibold tracking-tight text-white sm:text-2xl">
          {title}
        </Heading>
        <p className="mt-3 max-w-lg text-sm leading-6 text-copy-muted sm:text-base sm:leading-7">
          {description}
        </p>
        {kind === "loading" ? (
          <div aria-hidden="true" className="mt-6 w-full max-w-sm space-y-3">
            <Skeleton className="mx-auto h-4 w-full rounded-control" />
            <Skeleton className="mx-auto h-4 w-4/5 rounded-control" />
          </div>
        ) : null}
        {onRetry ? (
          <Button className="mt-6" variant="glass" size="app" onClick={onRetry}>
            <RefreshCwIcon aria-hidden="true" />
            Thử lại
          </Button>
        ) : action ? (
          <div className="mt-6">{action}</div>
        ) : null}
      </CardContent>
    </Card>
  )
}
