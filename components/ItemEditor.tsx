'use client'
import { useState, useRef, useEffect } from 'react'

const EXAMPLES = [
  '富士山に登る', '世界一周する', 'オーロラを見る', 'マラソンを完走する',
  '本を出版する', '100カ国訪問', 'ダイビングの資格を取る', '星空の下で眠る',
]

interface Props {
  slotNumber: number
  initialText: string
  isEdit: boolean
  onSave: (text: string) => Promise<void>
  onCancel: () => void
}

export default function ItemEditor({ slotNumber, initialText, isEdit, onSave, onCancel }: Props) {
  const [text, setText] = useState(initialText)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const placeholder = EXAMPLES[(slotNumber - 1) % EXAMPLES.length]

  useEffect(() => { inputRef.current?.focus() }, [])

  async function handleSave() {
    if (!text.trim()) return
    setSaving(true)
    await onSave(text.trim())
    setSaving(false)
  }

  return (
    <>
      {/* backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onCancel}
      />

      {/* sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--cream)] rounded-t-2xl shadow-2xl">
        <div className="max-w-2xl mx-auto px-6 pt-5 pb-8">
          {/* handle */}
          <div className="w-10 h-1 bg-[var(--border)] rounded-full mx-auto mb-5" />

          <div className="ui text-xs text-[var(--muted)] mb-3 tracking-wide">
            {isEdit ? `#${slotNumber} を編集` : `#${slotNumber} — 夢を書く`}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`例: ${placeholder}`}
            maxLength={40}
            className="ui w-full border border-[var(--border)] rounded-xl px-4 py-3.5 text-base
                       bg-white focus:outline-none focus:border-[var(--ink)] transition-colors mb-4"
            onKeyDown={e => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') onCancel()
            }}
          />

          {/* char count */}
          <div className="ui text-right text-xs text-[var(--muted)] -mt-2 mb-4">
            {text.length} / 40
          </div>

          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="ui flex-1 py-3 border border-[var(--border)] rounded-xl text-sm text-[var(--muted)] hover:border-[var(--ink)] transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={!text.trim() || saving}
              className="ui flex-2 px-8 py-3 bg-[var(--ink)] text-[var(--cream)] rounded-xl text-sm
                         disabled:opacity-30 hover:opacity-80 transition-opacity"
            >
              {saving ? '保存中…' : isEdit ? '更新する' : '追加する'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
