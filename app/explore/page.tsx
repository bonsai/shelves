import Link from 'next/link'
import { listBoards } from '@/lib/db'

export const revalidate = 60

export default async function ExplorePage() {
  const boards = await listBoards()
  const sorted = [...boards].reverse()

  return (
    <div className="min-h-screen">
      {/* nav */}
      <nav className="ui flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <Link href="/" className="text-sm font-semibold tracking-widest text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
          BUCKET100
        </Link>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-[var(--ink)] mb-2">みんなの夢リスト</h1>
        <p className="ui text-sm text-[var(--muted)] mb-10">
          {boards.length} 個のバケットリストが公開されています
        </p>

        {sorted.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[var(--muted)]">まだリストがありません</p>
            <Link href="/" className="ui text-sm text-[var(--ink)] underline underline-offset-2 mt-4 inline-block">
              最初のリストを作る
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sorted.map(b => (
              <Link
                key={b.id}
                href={`/${b.slug}`}
                className="group block px-5 py-4 bg-white border border-[var(--border)] rounded-2xl
                           hover:border-[var(--ink)] hover:shadow-sm transition-all"
              >
                <div className="font-semibold text-[var(--ink)] truncate mb-1">{b.title}</div>
                <div className="ui text-xs text-[var(--muted)]">
                  #{b.slug} · {new Date(b.created_at).toLocaleDateString('ja-JP')}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
