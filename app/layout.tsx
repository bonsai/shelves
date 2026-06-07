import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'やること100個',
  description: '100個のやることを書き出して、人生を動かすリスト',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
