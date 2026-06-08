export interface Board {
  id: string
  slug: string
  title: string
  userId?: string | null
  isPublic?: boolean
  created_at: string
}

export interface Item {
  id: string
  board_id: string
  slot_idx: number
  text: string
  done: boolean
  nid: string
  created_at: string
}

export type Plan = 'free' | 'pro'

export interface UserProfile {
  clerkId: string
  email: string
  plan: Plan
  stripeCustomerId?: string | null
}
