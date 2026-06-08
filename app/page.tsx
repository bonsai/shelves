import Link from 'next/link'
import { listBoards } from '@/lib/db'
import TopCreateForm from '@/components/TopCreateForm'
import NavBar from '@/components/NavBar'

export default async function Home() {
  const recentBoards = await listBoards()
  const recent = recentBoards.slice(-6).reverse()

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      {/* hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <p className="ui text-xs tracking-[0.3em] text-[var(--muted)] mb-6 uppercase">Bucket List</p>
        <h1 className="text-4xl sm:text-6xl font-bold leading-tight text-[var(--ink)] mb-6">
          死ぬまでに<br />やりたいこと<span className="text-[var(--amber)]">100</span>
        </h1>
        <p className="text-[var(--muted)] text-lg leading-relaxed max-w-md mb-12">
          書き出すことで、夢は現実になる。<br />
          あなたの100個を、世界に宣言しよう。
        </p>

        <TopCreateForm />

        <p className="ui text-xs text-[var(--muted)] mt-6">
          ログインなしで作成できます。URLを共有すれば誰でも見られます。
        </p>
      </section>

      {/* recent boards */}
      {recent.length > 0 && (
        <section className="border-t border-[var(--border)] px-6 py-12">
          <div className="max-w-2xl mx-auto">
            <h2 className="ui text-xs font-semibold tracking-widest text-[var(--muted)] uppercase mb-6">
              みんなの夢リスト
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {recent.map(b => (
                <Link
                  key={b.id}
                  href={`/${b.slug}`}
                  className="group block px-4 py-3 border border-[var(--border)] rounded-xl hover:border-[var(--ink)] transition-colors"
                >
                  <div className="font-medium text-sm truncate">{b.title}</div>
                  <div className="ui text-xs text-[var(--muted)] mt-0.5">#{b.slug}</div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link href="/explore" className="ui text-sm text-[var(--muted)] underline underline-offset-2 hover:text-[var(--ink)]">
                もっと見る
              </Link>
            </div>
          </div>
        </section>
      )}

      <footer className="ui text-center text-xs text-[var(--muted)] py-6 border-t border-[var(--border)]">
        BUCKET100 — 夢を、100個。
      </footer>
    </div>
  )
}
