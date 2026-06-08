import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { listBoards, createBoard, countUserBoards } from '@/lib/db'
import { getUserPlan } from '@/lib/plan'

export async function GET() {
  return NextResponse.json(await listBoards())
}

export async function POST(req: Request) {
  const { userId } = await auth()
  const { title } = await req.json() as { title?: string }

  if (userId) {
    const plan = await getUserPlan(userId)
    if (plan === 'free') {
      const count = await countUserBoards(userId)
      if (count >= 1) {
        return NextResponse.json({ error: 'free plan limit' }, { status: 403 })
      }
    }
  }

  const board = await createBoard(title ?? '死ぬまでにやりたいこと100', userId ?? undefined)
  return NextResponse.json(board, { status: 201 })
}
