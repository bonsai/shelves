import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { upgradeToPro, downgradeToFree } from '@/lib/plan'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const payload = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 })
  }

  const sub = event.data.object as Stripe.Subscription
  const clerkId = sub.metadata?.clerk_id

  if (!clerkId) return NextResponse.json({ ok: true })

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      if (sub.status === 'active') {
        await upgradeToPro(clerkId, sub.customer as string)
      } else {
        await downgradeToFree(clerkId)
      }
      break
    case 'customer.subscription.deleted':
      await downgradeToFree(clerkId)
      break
  }

  return NextResponse.json({ ok: true })
}
