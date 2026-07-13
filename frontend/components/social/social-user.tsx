import {
  AwardIcon,
  CrownIcon,
  ShieldCheckIcon,
} from "lucide-react"

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type {
  PresenceStatus,
  SocialBadgeType,
} from "@/types/social"
import { getInitials } from "@/components/social/social-utils"

interface SocialBadgeProps {
  type: SocialBadgeType
  className?: string
}

const badgeDetails = {
  verify: {
    label: "Tài khoản xác thực",
    icon: ShieldCheckIcon,
    variant: "info" as const,
  },
  crown: {
    label: "Học viên nổi bật",
    icon: CrownIcon,
    variant: "attention" as const,
  },
  medal: {
    label: "Top học tập tuần",
    icon: AwardIcon,
    variant: "success" as const,
  },
}

export function SocialBadge({ type, className }: SocialBadgeProps) {
  if (type === "none") return null

  const detail = badgeDetails[type]
  const Icon = detail.icon

  return (
    <span
      className={cn("inline-flex text-current", className)}
      aria-label={detail.label}
      title={detail.label}
    >
      <Icon className="size-4" aria-hidden="true" />
    </span>
  )
}

interface LevelBadgeProps {
  level: number
  className?: string
}

export function LevelBadge({ level, className }: LevelBadgeProps) {
  return (
    <Badge variant="success" className={cn("font-mono tabular-nums", className)}>
      Lv.{level}
    </Badge>
  )
}

interface SocialUserAvatarProps {
  name: string
  src: string | null
  status?: PresenceStatus
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const avatarSizes = {
  sm: "size-8",
  md: "size-11",
  lg: "size-14",
  xl: "size-24",
}

export function SocialUserAvatar({
  name,
  src,
  status,
  size = "md",
  className,
}: SocialUserAvatarProps) {
  return (
    <Avatar
      className={cn(
        avatarSizes[size],
        "border border-stroke-strong bg-surface-inner",
        className
      )}
    >
      {src ? <AvatarImage src={src} alt={`Ảnh đại diện của ${name}`} /> : null}
      <AvatarFallback className="bg-brand-cyan/10 font-semibold text-brand-cyan">
        {getInitials(name)}
      </AvatarFallback>
      {status ? (
        <AvatarBadge
          className={cn(
            status === "online" ? "bg-status-success" : "bg-copy-subtle"
          )}
          aria-label={status === "online" ? "Đang trực tuyến" : "Đang ngoại tuyến"}
          title={status === "online" ? "Đang trực tuyến" : "Đang ngoại tuyến"}
        />
      ) : null}
    </Avatar>
  )
}
