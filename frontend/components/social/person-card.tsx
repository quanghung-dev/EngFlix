import Link from "next/link"
import { ChevronRightIcon } from "lucide-react"

import {
  LevelBadge,
  SocialBadge,
  SocialUserAvatar,
} from "@/components/social/social-user"
import { Card, CardContent } from "@/components/ui/card"
import type { SocialUserSummary } from "@/types/social"

interface PersonCardProps {
  person: SocialUserSummary
  metadata: React.ReactNode
  actions?: React.ReactNode
  showStatus?: boolean
}

export function PersonCard({
  person,
  metadata,
  actions,
  showStatus = false,
}: PersonCardProps) {
  return (
    <Card variant="inner" className="transition duration-300 hover:border-brand-cyan/30 motion-reduce:transition-none">
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Link
          href={`/profile/${person.user_id}`}
          className="product-focus group min-w-0 flex flex-1 items-center gap-3 rounded-nav"
        >
          <SocialUserAvatar
            name={person.username}
            src={person.avatar_url}
            status={showStatus ? person.status : undefined}
            size="lg"
          />
          <span className="min-w-0 flex-1">
            <span className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="truncate font-semibold text-foreground group-hover:text-brand-cyan">
                {person.username}
              </span>
              <SocialBadge type={person.badge_type} />
              <LevelBadge level={person.level} />
            </span>
            <span className="mt-1 block text-sm text-copy-muted">{metadata}</span>
          </span>
          <ChevronRightIcon className="size-4 text-copy-muted group-hover:text-brand-cyan" aria-hidden="true" />
        </Link>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">{actions}</div> : null}
      </CardContent>
    </Card>
  )
}
