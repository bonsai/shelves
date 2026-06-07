import { NextResponse } from 'next/server'
import { getBoard, getBoardItems } from '@/lib/db'

type Ctx = { params: Promise<{ slug: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  const { slug } = await params
  const board = await getBoard(slug)
  if (!board) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ board, items: await getBoardItems(board.id) })
}
