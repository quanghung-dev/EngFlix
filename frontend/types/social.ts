export type SocialBadgeType = "verify" | "medal" | "crown" | "none"

export type PresenceStatus = "online" | "offline"

export type FriendshipState =
  | "none"
  | "pending_sent"
  | "pending_received"
  | "accepted"

export interface SocialUserSummary {
  user_id: string
  username: string
  avatar_url: string | null
  level: number
  badge_type: SocialBadgeType
  status?: PresenceStatus
}

export interface ChatMessage extends SocialUserSummary {
  id: number
  content: string
  created_at: string
}

export interface SocialPost extends SocialUserSummary {
  id: number
  content: string
  image_url: string | null
  created_at: string
  likes_count: number
  comments_count: number
  is_liked: boolean
}

export interface PostComment extends SocialUserSummary {
  id: number
  post_id: number
  content: string
  created_at: string
}

export interface Friend extends SocialUserSummary {
  friendship_id: number
  status?: PresenceStatus
}

export interface FriendRequest extends SocialUserSummary {
  friendship_id: number
  created_at: string
}

export interface FriendSearchResult extends SocialUserSummary {
  friendship_id: number | null
  friendship_state: FriendshipState
}

export interface FriendshipStatus {
  state: FriendshipState
  friendship_id: number | null
}

export interface PublicUserProfile {
  uid: string
  name: string
  avatar_url: string | null
  created_at: string
  post_count: number
  friend_count: number
}

export interface OwnUserProfile extends PublicUserProfile {
  email: string
  phone: string | null
  user_role: string
}

export interface UpdateProfileInput {
  name: string
  phone?: string
}

export type ProfileMutationResult = OwnUserProfile
