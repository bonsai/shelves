import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { listUserBoards } from '@/lib/db'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const boards = await listUserBoards(userId)

  return (
    <main className="min-h-screen bg-stone-50 p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">マイリスト</h1>
          <p className="text-sm text-stone-500 mt-0.5">{user?.firstName ?? user?.emailAddresses[0]?.emailAddress}</p>
        </div>
        <Link
          href="/"
          className="text-sm text-stone-500 hover:text-stone-700 underline underline-offset-2"
        >
          トップへ
        </Link>
      </div>

      <DashboardClient boards={boards} />
    </main>
  )
}
