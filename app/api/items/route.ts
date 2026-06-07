import { NextResponse } from 'next/server'
import { createItem } from '@/lib/db'
import type { Item } from '@/lib/types'

export async function POST(req: Request) {
  const body = await req.json() as Omit<Item, 'id' | 'nid' | 'created_at'>
  try {
    const item = await createItem(body)
    return NextResponse.json(item, { status: 201 })
  } catch (e) {
    const err = e as Error
    if (err.message === 'slot occupied') {
      return NextResponse.json({ error: 'slot occupied' }, { status: 409 })
    }
    return NextResponse.json({ error: 'internal error' }, { status: 500 })
  }
}
