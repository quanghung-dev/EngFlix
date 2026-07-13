import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "product-focus flex field-sizing-content min-h-24 w-full rounded-control border border-stroke-strong bg-surface-inner px-4 py-3 text-base text-white transition-colors placeholder:text-copy-muted focus-visible:border-focus focus-visible:ring-3 focus-visible:ring-focus/20 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
