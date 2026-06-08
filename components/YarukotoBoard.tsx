'use client'
import { useState, useCallback, useEffect } from 'react'
import type { Board, Item } from '@/lib/types'
import ItemEditor from './ItemEditor'

const NSLOTS = 100
const COLS   = 10

interface Props {
  board: Board
  initialItems: Item[]
}

interface EditingState {
  slotIdx: number
  itemId?: string
  initialText?: string
}

export default function YarukotoBoard({ board, initialItems }: Props) {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [editing, setEditing] = useState<EditingState | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const bySlot = Object.fromEntries(items.map(m => [m.slot_idx, m]))
  const done   = items.filter(i => i.done).length

  function handleSlotClick(slotIdx: number) {
    const existing = bySlot[slotIdx]
    if (existing) {
      setEditing({ slotIdx, itemId: existing.id, initialText: existing.text })
    } else {
      setEditing({ slotIdx })
    }
  }

  const handleSave = useCallback(async (text: string) => {
    if (!editing) return
    const { slotIdx, itemId } = editing

    if (itemId) {
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (res.ok) {
        const updated = await res.json() as Item
        setItems(prev => prev.map(m => m.id === itemId ? updated : m))
      }
    } else {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board_id: board.id, slot_idx: slotIdx, text, done: false }),
      })
      if (res.ok) {
        const created = await res.json() as Item
        setItems(prev => [...prev, created])
      } else if (res.status === 409) {
        alert('そのスロットは先に埋まりました')
      }
    }
    setEditing(null)
  }, [editing, board.id])

  async function toggleDone(item: Item, e: React.MouseEvent) {
    e.stopPropagation()
    const res = await fetch(`/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !item.done }),
    })
    if (res.ok) {
      const updated = await res.json() as Item
      setItems(prev => prev.map(m => m.id === item.id ? updated : m))
    }
  }

  async function handleDelete(itemId: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (deleteConfirm !== itemId) {
      setDeleteConfirm(itemId)
      setTimeout(() => setDeleteConfirm(null), 2000)
      return
    }
    setDeleteConfirm(null)
    await fetch(`/api/items/${itemId}`, { method: 'DELETE' })
    setItems(prev => prev.filter(m => m.id !== itemId))
  }

  useEffect(() => {
    const t = setInterval(async () => {
      const res = await fetch(`/api/boards/${board.slug}`)
      if (res.ok) {
        const data = await res.json() as { items: Item[] }
        setItems(data.items)
      }
    }, 5000)
    return () => clearInterval(t)
  }, [board.slug])

  const slots = Array.from({ length: NSLOTS }, (_, i) => i)

  return (
    <div>
      {/* grid */}
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {slots.map(i => {
          const item        = bySlot[i]
          const isConfirm   = item && deleteConfirm === item.id

          return (
            <div key={i} className="relative group">
              <button
                onClick={() => handleSlotClick(i)}
                className={[
                  'w-full aspect-square rounded-lg border text-[9px] flex flex-col items-center justify-center gap-0.5 transition-all duration-150 leading-tight',
                  item
                    ? item.done
                      ? 'bg-[var(--done-bg)] border-[var(--gold)] text-[var(--done-fg)]'
                      : 'bg-[var(--ink)] border-[var(--ink)] text-[var(--cream)] hover:opacity-80'
                    : 'bg-white border-[var(--border)] text-[var(--border)] hover:border-[var(--muted)] hover:text-[var(--muted)]',
                ].join(' ')}
              >
                <span className="opacity-40 leading-none" style={{ fontSize: 7 }}>{i + 1}</span>
                {item ? (
                  <span className="px-0.5 break-all text-center" style={{ fontSize: 8, lineHeight: 1.25 }}>
                    {item.text.slice(0, 7)}{item.text.length > 7 ? '…' : ''}
                  </span>
                ) : (
                  <span style={{ fontSize: 11 }}>+</span>
                )}
              </button>

              {/* done toggle */}
              {item && !isConfirm && (
                <button
                  onClick={e => toggleDone(item, e)}
                  title={item.done ? '未完了に戻す' : '達成！'}
                  className={[
                    'absolute -top-1 -left-1 w-4 h-4 rounded-full text-white flex items-center justify-center',
                    'opacity-0 group-hover:opacity-100 transition-opacity',
                    item.done
                      ? 'bg-[var(--amber)] hover:opacity-80'
                      : 'bg-[var(--muted)] hover:bg-[var(--amber)]',
                  ].join(' ')}
                  style={{ fontSize: 8 }}
                >
                  ✓
                </button>
              )}

              {/* delete */}
              {item && (
                <button
                  onClick={e => handleDelete(item.id, e)}
                  title={isConfirm ? '本当に削除？' : '削除'}
                  className={[
                    'absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center transition-all',
                    isConfirm
                      ? 'bg-red-500 opacity-100'
                      : 'bg-[var(--muted)] opacity-0 group-hover:opacity-100 hover:bg-red-400',
                  ].join(' ')}
                  style={{ fontSize: 8 }}
                >
                  {isConfirm ? '?' : '×'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* legend */}
      <div className="ui flex items-center gap-4 mt-4 text-xs text-[var(--muted)]">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[var(--ink)] inline-block" />
          やること
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[var(--done-bg)] border border-[var(--gold)] inline-block" />
          達成済み {done > 0 && `(${done})`}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-white border border-[var(--border)] inline-block" />
          未入力
        </span>
      </div>

      {/* editor */}
      {editing && (
        <ItemEditor
          slotNumber={editing.slotIdx + 1}
          initialText={editing.initialText ?? ''}
          isEdit={!!editing.itemId}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  )
}
