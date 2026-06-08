'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Board } from '@/lib/types'

export default function DashboardClient({ boards }: { boards: Board[] }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function createBoard() {
    if (!name.trim()) return
    setLoading(true)
    const res = await fetch('/api/boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: name.trim() }),
    })
    const board = await res.json()
    if (res.status === 403) {
      alert('無料プランはリスト1つまでです。プロプランにアップグレードしてください。')
      setLoading(false)
      return
    }
    router.push(`/${board.slug}`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* existing boards */}
      {boards.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">作成済みリスト</h2>
          <ul className="flex flex-col gap-2">
            {boards.map(b => (
              <li key={b.id}>
                <a
                  href={`/${b.slug}`}
                  className="flex items-center justify-between px-4 py-3 bg-white border border-stone-200 rounded-xl hover:border-stone-400 transition-colors"
                >
                  <span className="font-medium text-stone-800">{b.title}</span>
                  <span className="text-xs text-stone-400">{b.slug}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* new board */}
      <section>
        <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">新しいリストを作る</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="リストの名前（例: 田中の夢リスト）"
            maxLength={30}
            className="flex-1 border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-stone-500"
            onKeyDown={e => e.key === 'Enter' && createBoard()}
          />
          <button
            onClick={createBoard}
            disabled={loading || !name.trim()}
            className="px-4 py-2.5 bg-stone-800 text-white rounded-lg text-sm hover:bg-stone-700 disabled:opacity-40 transition-colors"
          >
            {loading ? '…' : '作成'}
          </button>
        </div>
        {boards.length >= 1 && (
          <p className="text-xs text-amber-600 mt-2">無料プランはリスト1つまで。<a href="/upgrade" className="underline">プロプランへ</a></p>
        )}
      </section>
    </div>
  )
}
