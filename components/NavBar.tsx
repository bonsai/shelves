import { auth } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default async function NavBar() {
  const { userId } = await auth()

  return (
    <nav className="ui flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
      <Link href="/" className="text-sm font-semibold tracking-widest text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
        BUCKET100
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <Link href="/explore" className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
          みんなのリスト
        </Link>
        {userId ? (
          <>
            <Link href="/dashboard" className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
              マイリスト
            </Link>
            <UserButton />
          </>
        ) : (
          <Link href="/sign-in" className="text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
            ログイン
          </Link>
        )}
      </div>
    </nav>
  )
}
