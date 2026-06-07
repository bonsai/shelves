import { NextResponse } from 'next/server'
import { updateItem, deleteItem } from '@/lib/db'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params
  const body = await req.json() as { text?: string; done?: boolean }
  const item = await updateItem(id, body)
  if (!item) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(item)
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params
  const ok = await deleteItem(id)
  if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return new NextResponse(null, { status: 204 })
}
