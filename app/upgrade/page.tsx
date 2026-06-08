'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const FREE_FEATURES  = ['リスト1つ', '公開のみ', '100スロット']
const PRO_FEATURES   = ['リスト無制限', '非公開オプション', 'カスタムテーマ', '夢アドバイスAI', '達成統計']

export default function UpgradePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function startCheckout() {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const { url } = await res.json()
    if (url) router.push(url)
    else setLoading(false)
  }

  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-stone-800 mb-2">プランを選ぶ</h1>
          <p className="text-stone-500">夢を本気で叶えたいならプロプランへ</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Free */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <div className="mb-4">
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest">無料</span>
              <div className="text-3xl font-bold text-stone-800 mt-1">¥0</div>
            </div>
            <ul className="space-y-2 mb-6">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-stone-600">
                  <span className="text-stone-300">○</span>{f}
                </li>
              ))}
            </ul>
            <div className="w-full py-2.5 border border-stone-200 rounded-xl text-sm text-center text-stone-400">
              現在のプラン
            </div>
          </div>

          {/* Pro */}
          <div className="bg-stone-800 border border-stone-700 rounded-2xl p-6 text-white">
            <div className="mb-4">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">プロ</span>
              <div className="text-3xl font-bold mt-1">¥980<span className="text-base font-normal text-stone-400">/月</span></div>
            </div>
            <ul className="space-y-2 mb-6">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-stone-300">
                  <span className="text-amber-400">✓</span>{f}
                </li>
              ))}
            </ul>
            <button
              onClick={startCheckout}
              disabled={loading}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-900 font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              {loading ? '処理中…' : 'アップグレードする'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          いつでも解約できます。解約後も期間末日まで利用可能。
        </p>
      </div>
    </main>
  )
}
