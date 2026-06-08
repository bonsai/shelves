import { notFound } from 'next/navigation'
import { getBoard, getBoardItems } from '@/lib/db'
import YarukotoBoard from '@/components/YarukotoBoard'
import NavBar from '@/components/NavBar'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function BoardPage({ params }: Props) {
  const { slug } = await params
  const board = await getBoard(slug)
  if (!board) notFound()

  const items = await getBoardItems(board.id)
  const done = items.filter(i => i.done).length
  const pct  = Math.round(done)

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-1 flex flex-col items-center px-4 py-8 pb-40">
        <div className="w-full max-w-2xl">
          {/* board header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[var(--ink)] mb-1">
              {board.title}<span className="text-[var(--muted)] font-normal"> の100個</span>
            </h1>

            {/* progress */}
            <div className="ui flex items-center gap-3 mt-3">
              <div className="flex-1 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: pct === 100 ? 'var(--amber)' : 'var(--ink)',
                  }}
                />
              </div>
              <span className="text-xs text-[var(--muted)] tabular-nums w-14 text-right">
                {done} / 100
              </span>
            </div>
            {done === 100 && (
              <p className="ui text-xs text-[var(--amber)] mt-2 font-semibold tracking-wide">
                おめでとう — 100個全て達成！
              </p>
            )}
          </div>

          <YarukotoBoard board={board} initialItems={items} />
        </div>
      </main>
    </div>
  )
}
