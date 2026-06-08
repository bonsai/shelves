import { randomUUID, randomBytes } from 'crypto'
import { eq, and } from 'drizzle-orm'
import { db } from '@/db'
import { boards, items } from '@/db/schema'
import type { Board, Item } from './types'

function shortHash(): string {
  return randomBytes(4).toString('hex')
}

// ─── board operations ─────────────────────────────────────────────────────────

export async function createBoard(title: string, userId?: string): Promise<Board> {
  const slug = shortHash()
  const id = randomUUID()
  await db.insert(boards).values({ id, slug, title, userId: userId ?? null, isPublic: true })
  return { id, slug, title, created_at: new Date().toISOString() }
}

export async function getBoard(slug: string): Promise<Board | undefined> {
  const row = await db.query.boards.findFirst({ where: eq(boards.slug, slug) })
  if (!row) return undefined
  return { id: row.id, slug: row.slug, title: row.title, created_at: row.createdAt.toISOString() }
}

export async function listBoards(): Promise<Board[]> {
  const rows = await db.query.boards.findMany({ where: eq(boards.isPublic, true) })
  return rows.map(r => ({ id: r.id, slug: r.slug, title: r.title, created_at: r.createdAt.toISOString() }))
}

export async function listUserBoards(userId: string): Promise<Board[]> {
  const rows = await db.query.boards.findMany({ where: eq(boards.userId, userId) })
  return rows.map(r => ({ id: r.id, slug: r.slug, title: r.title, created_at: r.createdAt.toISOString() }))
}

export async function countUserBoards(userId: string): Promise<number> {
  const rows = await db.query.boards.findMany({ where: eq(boards.userId, userId) })
  return rows.length
}

// ─── item operations ──────────────────────────────────────────────────────────

function rowToItem(r: typeof items.$inferSelect): Item {
  return {
    id: r.id,
    board_id: r.boardId,
    slot_idx: r.slotIdx,
    text: r.text,
    done: r.done,
    nid: r.nid,
    created_at: r.createdAt.toISOString(),
  }
}

export async function getBoardItems(boardId: string): Promise<Item[]> {
  const rows = await db.query.items.findMany({ where: eq(items.boardId, boardId) })
  return rows.map(rowToItem)
}

export async function createItem(data: Omit<Item, 'id' | 'nid' | 'created_at'>): Promise<Item> {
  const existing = await db.query.items.findFirst({
    where: and(eq(items.boardId, data.board_id), eq(items.slotIdx, data.slot_idx)),
  })
  if (existing) throw new Error('slot occupied')

  const countRows = await db.query.items.findMany({ where: eq(items.boardId, data.board_id) })
  const nid = String(countRows.length + 1)
  const id = randomUUID()

  await db.insert(items).values({
    id,
    boardId: data.board_id,
    slotIdx: data.slot_idx,
    text: data.text,
    done: data.done,
    nid,
  })
  return { ...data, id, nid, created_at: new Date().toISOString() }
}

export async function updateItem(id: string, patch: Partial<Pick<Item, 'text' | 'done'>>): Promise<Item | undefined> {
  const row = await db.query.items.findFirst({ where: eq(items.id, id) })
  if (!row) return undefined
  const updated = await db.update(items).set(patch).where(eq(items.id, id)).returning()
  return rowToItem(updated[0])
}

export async function deleteItem(id: string): Promise<boolean> {
  const result = await db.delete(items).where(eq(items.id, id)).returning()
  return result.length > 0
}
