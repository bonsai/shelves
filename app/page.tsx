'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')

  async function createBoard() {
    if (!name.trim()) return
    setLoading(true)
    const res = await fetch('/api/boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: name.trim() }),
    })
    const board = await res.json()
    router.push(`/${board.slug}`)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-widest text-stone-800 mb-2">やること100個</h1>
        <p className="text-stone-500 text-sm">死ぬまでにやりたいこと、全部書き出そう</p>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-3">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="あなたの名前（例: 田中太郎）"
          maxLength={20}
          className="w-full border border-stone-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-stone-500"
          onKeyDown={e => e.key === 'Enter' && createBoard()}
        />
        <button
          onClick={createBoard}
          disabled={loading || !name.trim()}
          className="w-full py-3 bg-stone-800 text-white rounded-lg text-base tracking-wide
                     hover:bg-stone-700 disabled:opacity-40 transition-colors"
        >
          {loading ? '作成中…' : 'リストを作る'}
        </button>
      </div>

      <p className="text-xs text-stone-400 text-center max-w-xs">
        URLを共有すれば仲間にも見てもらえます
      </p>
    </main>
  )
}
