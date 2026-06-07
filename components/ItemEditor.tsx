'use client'
import { useState } from 'react'

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

  async function handleSave() {
    if (!text.trim()) return
    setSaving(true)
    await onSave(text.trim())
    setSaving(false)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 shadow-xl p-4 z-50">
      <div className="text-xs text-stone-400 mb-2">
        {isEdit ? '✏️ 編集中' : `#${slotNumber} やることを書く`}
      </div>

      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="例: 富士山に登る"
        maxLength={30}
        className="w-full border border-stone-300 rounded-lg px-3 py-3 text-base mb-3 focus:outline-none focus:border-stone-500"
        autoFocus
        onKeyDown={e => e.key === 'Enter' && handleSave()}
      />

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 border border-stone-300 rounded-lg text-sm text-stone-600 hover:bg-stone-50"
        >
          キャンセル
        </button>
        <button
          onClick={handleSave}
          disabled={!text.trim() || saving}
          className="flex-1 py-2.5 bg-stone-800 text-white rounded-lg text-sm disabled:opacity-50 hover:bg-stone-700"
        >
          {saving ? '保存中…' : isEdit ? '更新する' : '追加する'}
        </button>
      </div>
    </div>
  )
}
