"use client"

import { useSyncExternalStore } from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
}

const subscribeToMount = () => () => undefined

export function ThemeToggle({ className }: ThemeToggleProps) {
  const mounted = useSyncExternalStore(
    subscribeToMount,
    () => true,
    () => false
  )
  const { resolvedTheme, setTheme } = useTheme()

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="glass"
        size="icon-app"
        className={cn("shrink-0", className)}
        aria-label="Đang tải tùy chọn giao diện"
        disabled
      >
        <MoonIcon aria-hidden="true" className="opacity-0" />
      </Button>
    )
  }

  const isDark = resolvedTheme === "dark"
  const label = isDark
    ? "Chuyển sang chế độ sáng"
    : "Chuyển sang chế độ tối"

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="glass"
            size="icon-app"
            className={cn("shrink-0", className)}
            aria-label={label}
            onClick={() => setTheme(isDark ? "light" : "dark")}
          />
        }
      >
        {isDark ? (
          <SunIcon aria-hidden="true" />
        ) : (
          <MoonIcon aria-hidden="true" />
        )}
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}
