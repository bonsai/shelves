import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, userId) })
  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: 'no subscription' }, { status: 400 })
  }

  const origin = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${origin}/dashboard`,
  })

  return NextResponse.json({ url: session.url })
}
