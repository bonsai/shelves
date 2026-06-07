import { NextResponse } from 'next/server'
import { listBoards, createBoard } from '@/lib/db'

export async function GET() {
  return NextResponse.json(await listBoards())
}

export async function POST(req: Request) {
  const { title } = await req.json() as { title?: string }
  const board = await createBoard(title ?? 'やること100個')
  return NextResponse.json(board, { status: 201 })
}
