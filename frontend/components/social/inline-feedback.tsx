import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

interface InlineFeedbackProps {
  tone?: "error" | "success" | "info"
  children: React.ReactNode
  className?: string
}

const toneStyles = {
  error: "border-destructive/30 bg-destructive/10 text-destructive",
  success: "border-status-success/25 bg-status-success/10 text-status-success",
  info: "border-brand-cyan/20 bg-brand-cyan/10 text-copy-secondary",
}

const toneIcons = {
  error: CircleAlertIcon,
  success: CircleCheckIcon,
  info: InfoIcon,
}

export function InlineFeedback({
  tone = "info",
  children,
  className,
}: InlineFeedbackProps) {
  const Icon = toneIcons[tone]

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-nav border px-4 py-3 text-sm leading-6",
        toneStyles[tone],
        className
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0">{children}</div>
    </div>
  )
}
