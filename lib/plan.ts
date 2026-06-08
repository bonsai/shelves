import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { Plan } from './types'

export async function getUserPlan(clerkId: string): Promise<Plan> {
  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) })
  return user?.plan ?? 'free'
}

export async function upsertUser(clerkId: string, email: string): Promise<void> {
  await db
    .insert(users)
    .values({ clerkId, email, plan: 'free' })
    .onConflictDoNothing()
}

export async function upgradeToPro(clerkId: string, stripeCustomerId: string): Promise<void> {
  await db
    .update(users)
    .set({ plan: 'pro', stripeCustomerId })
    .where(eq(users.clerkId, clerkId))
}

export async function downgradeToFree(clerkId: string): Promise<void> {
  await db.update(users).set({ plan: 'free' }).where(eq(users.clerkId, clerkId))
}
