'use client'
import { useState, useCallback, useEffect } from 'react'
import type { Board, Item } from '@/lib/types'
import ItemEditor from './ItemEditor'

const NSLOTS = 100
const COLS = 9

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
  const done = items.filter(i => i.done).length

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

  // 5s polling
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
      {/* progress bar (client-side live) */}
      <div className="flex items-center gap-2 mb-3 text-xs text-stone-500">
        <div className="flex-1 bg-stone-200 rounded-full h-1.5">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${done}%` }}
          />
        </div>
        <span>{done}/100</span>
      </div>

      {/* grid */}
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {slots.map(i => {
          const item = bySlot[i]
          const isConfirming = item && deleteConfirm === item.id

          return (
            <div key={i} className="relative group">
              <button
                onClick={() => handleSlotClick(i)}
                className={`w-full aspect-square rounded-lg border text-xs flex flex-col items-center justify-center gap-0.5 transition-all
                  ${item
                    ? item.done
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                      : 'bg-stone-700 border-stone-600 text-amber-50 hover:bg-stone-600'
                    : 'bg-white border-stone-200 text-stone-300 hover:bg-stone-50 hover:border-stone-300'
                  }`}
              >
                <span className="text-[9px] opacity-50 leading-none">{i + 1}</span>
                {item ? (
                  <span
                    className="leading-tight text-center px-0.5 break-all"
                    style={{ fontSize: 9, lineHeight: 1.2 }}
                  >
                    {item.text.slice(0, 6)}{item.text.length > 6 ? '…' : ''}
                  </span>
                ) : (
                  <span style={{ fontSize: 10 }}>+</span>
                )}
              </button>

              {/* done toggle */}
              {item && !isConfirming && (
                <button
                  onClick={e => toggleDone(item, e)}
                  className={`absolute -top-1 -left-1 w-4 h-4 rounded-full text-white text-xs
                    flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100
                    ${item.done ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-stone-400 hover:bg-emerald-500'}`}
                  style={{ fontSize: 8 }}
                  title={item.done ? '未完了に戻す' : '達成！'}
                >
                  ✓
                </button>
              )}

              {/* delete */}
              {item && (
                <button
                  onClick={e => handleDelete(item.id, e)}
                  className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-xs
                    flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100
                    ${isConfirming ? 'bg-red-600 opacity-100' : 'bg-red-400 hover:bg-red-500'}`}
                  style={{ fontSize: 8 }}
                  title={isConfirming ? '本当に削除？' : '削除'}
                >
                  {isConfirming ? '？' : '×'}
                </button>
              )}
            </div>
          )
        })}
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
