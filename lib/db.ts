import { Redis } from '@upstash/redis'
import { randomUUID, randomBytes } from 'crypto'
import type { Board, Item, DB } from './types'

function shortHash(): string {
  return randomBytes(4).toString('hex')
}

const P = 'yarukoto'

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
  if (url && token) return new Redis({ url, token })
  return null
}

// ─── in-memory fallback ────────────────────────────────────────────────────────

declare global { var __yarukotoDB: DB | undefined }

function mem(): DB {
  if (!globalThis.__yarukotoDB) {
    globalThis.__yarukotoDB = { boards: [], items: [], itemCounters: {} }
  }
  return globalThis.__yarukotoDB
}

export function getDB(): DB { return mem() }

export function resetDB(): void {
  globalThis.__yarukotoDB = { boards: [], items: [], itemCounters: {} }
}

function parse<T>(raw: unknown): T {
  return (typeof raw === 'string' ? JSON.parse(raw) : raw) as T
}

// ─── board operations ─────────────────────────────────────────────────────────

export async function createBoard(title: string): Promise<Board> {
  const redis = getRedis()
  if (redis) {
    const slug = shortHash()
    const board: Board = { id: randomUUID(), slug, title, created_at: new Date().toISOString() }
    await redis.set(`${P}:board:${slug}`, JSON.stringify(board))
    return board
  }
  const db = mem()
  const slug = shortHash()
  const board: Board = { id: randomUUID(), slug, title, created_at: new Date().toISOString() }
  db.boards.push(board)
  return board
}

export async function getBoard(slug: string): Promise<Board | undefined> {
  const redis = getRedis()
  if (redis) {
    const raw = await redis.get(`${P}:board:${slug}`)
    if (!raw) return undefined
    return parse<Board>(raw)
  }
  return mem().boards.find(b => b.slug === slug)
}

export async function listBoards(): Promise<Board[]> {
  const redis = getRedis()
  if (redis) {
    const keys = await redis.keys(`${P}:board:*`)
    if (!keys.length) return []
    const raws = await Promise.all(keys.map(k => redis.get(k)))
    return raws.filter(Boolean).map(r => parse<Board>(r))
  }
  return mem().boards
}

// ─── item operations ──────────────────────────────────────────────────────────

async function getItems(redis: Redis, boardId: string): Promise<Item[]> {
  const raw = await redis.get(`${P}:items:${boardId}`)
  if (!raw) return []
  return parse<Item[]>(raw)
}

export async function createItem(
  data: Omit<Item, 'id' | 'nid' | 'created_at'>
): Promise<Item> {
  const redis = getRedis()
  if (redis) {
    const items = await getItems(redis, data.board_id)
    if (items.some(m => m.slot_idx === data.slot_idx)) throw new Error('slot occupied')
    const nid = String(await redis.incr(`${P}:item-cnt:${data.board_id}`))
    const item: Item = { ...data, id: randomUUID(), nid, created_at: new Date().toISOString() }
    items.push(item)
    await Promise.all([
      redis.set(`${P}:items:${data.board_id}`, JSON.stringify(items)),
      redis.set(`${P}:item-board:${item.id}`, data.board_id),
    ])
    return item
  }
  const db = mem()
  if (db.items.some(m => m.board_id === data.board_id && m.slot_idx === data.slot_idx)) {
    throw new Error('slot occupied')
  }
  db.itemCounters[data.board_id] = (db.itemCounters[data.board_id] ?? 0) + 1
  const nid = String(db.itemCounters[data.board_id])
  const item: Item = { ...data, id: randomUUID(), nid, created_at: new Date().toISOString() }
  db.items.push(item)
  return item
}

export async function updateItem(
  id: string,
  patch: Partial<Pick<Item, 'text' | 'done'>>
): Promise<Item | undefined> {
  const redis = getRedis()
  if (redis) {
    const boardId = await redis.get(`${P}:item-board:${id}`) as string | null
    if (!boardId) return undefined
    const items = await getItems(redis, boardId)
    const item = items.find(m => m.id === id)
    if (!item) return undefined
    Object.assign(item, patch)
    await redis.set(`${P}:items:${boardId}`, JSON.stringify(items))
    return item
  }
  const item = mem().items.find(m => m.id === id)
  if (!item) return undefined
  Object.assign(item, patch)
  return item
}

export async function deleteItem(id: string): Promise<boolean> {
  const redis = getRedis()
  if (redis) {
    const boardId = await redis.get(`${P}:item-board:${id}`) as string | null
    if (!boardId) return false
    const items = await getItems(redis, boardId)
    const idx = items.findIndex(m => m.id === id)
    if (idx === -1) return false
    items.splice(idx, 1)
    await Promise.all([
      redis.set(`${P}:items:${boardId}`, JSON.stringify(items)),
      redis.del(`${P}:item-board:${id}`),
    ])
    return true
  }
  const db = mem()
  const idx = db.items.findIndex(m => m.id === id)
  if (idx === -1) return false
  db.items.splice(idx, 1)
  return true
}

export async function getBoardItems(boardId: string): Promise<Item[]> {
  const redis = getRedis()
  if (redis) return getItems(redis, boardId)
  return mem().items.filter(m => m.board_id === boardId)
}
