import { notFound } from 'next/navigation'
import { getBoard, getBoardItems } from '@/lib/db'
import YarukotoBoard from '@/components/YarukotoBoard'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function BoardPage({ params }: Props) {
  const { slug } = await params
  const board = await getBoard(slug)
  if (!board) notFound()

  const items = await getBoardItems(board.id)
  const done = items.filter(i => i.done).length

  return (
    <main className="min-h-screen flex flex-col items-center p-4 gap-4 pb-32">
      <div className="w-full max-w-2xl">
        <div className="flex items-baseline justify-between mt-6 mb-1">
          <h1 className="text-xl font-bold text-stone-800 tracking-wide">{board.title} の100個</h1>
          <span className="text-sm text-stone-500">{done} / 100 達成</span>
        </div>
        <div className="w-full bg-stone-200 rounded-full h-2 mb-4">
          <div
            className="bg-stone-700 h-2 rounded-full transition-all"
            style={{ width: `${done}%` }}
          />
        </div>
        <YarukotoBoard board={board} initialItems={items} />
      </div>
    </main>
  )
}
