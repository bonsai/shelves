'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TopCreateForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function create() {
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
    <div className="ui w-full max-w-sm flex flex-col gap-3">
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="あなたの名前（例: 田中太郎）"
        maxLength={20}
        className="w-full border border-[var(--border)] rounded-xl px-4 py-3.5 text-sm bg-white
                   focus:outline-none focus:border-[var(--ink)] transition-colors"
        onKeyDown={e => e.key === 'Enter' && create()}
      />
      <button
        onClick={create}
        disabled={loading || !name.trim()}
        className="w-full py-3.5 bg-[var(--ink)] text-[var(--cream)] rounded-xl text-sm tracking-widest
                   hover:opacity-80 disabled:opacity-30 transition-opacity"
      >
        {loading ? '作成中…' : 'リストをはじめる'}
      </button>
    </div>
  )
}
