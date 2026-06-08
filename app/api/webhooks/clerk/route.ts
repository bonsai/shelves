import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { upsertUser } from '@/lib/plan'

type ClerkUserEvent = {
  type: string
  data: {
    id: string
    email_addresses: { email_address: string }[]
  }
}

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'no secret' }, { status: 500 })

  const payload = await req.text()
  const headers = {
    'svix-id':        req.headers.get('svix-id') ?? '',
    'svix-timestamp': req.headers.get('svix-timestamp') ?? '',
    'svix-signature': req.headers.get('svix-signature') ?? '',
  }

  let event: ClerkUserEvent
  try {
    event = new Webhook(secret).verify(payload, headers) as ClerkUserEvent
  } catch {
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 })
  }

  if (event.type === 'user.created' || event.type === 'user.updated') {
    const email = event.data.email_addresses[0]?.email_address ?? ''
    await upsertUser(event.data.id, email)
  }

  return NextResponse.json({ ok: true })
}
