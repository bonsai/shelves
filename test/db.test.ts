import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── mock drizzle db ────────────────────────────────────────────────────────────
const store: { boards: Record<string, unknown>[], items: Record<string, unknown>[] } = {
  boards: [],
  items: [],
}

vi.mock('@/db', () => {
  const makeQuery = () => ({
    findFirst: vi.fn(async ({ where }: { where: (r: Record<string, unknown>) => boolean }) =>
      store.boards.find(where) ?? store.items.find(where) ?? undefined
    ),
    findMany: vi.fn(async ({ where }: { where?: (r: Record<string, unknown>) => boolean }) =>
      where ? store.items.filter(where) : store.items
    ),
  })

  return {
    db: {
      insert: vi.fn(() => ({ values: vi.fn(async (v: Record<string, unknown>) => { store.boards.push(v) }) })),
      query: {
        boards: {
          findFirst: vi.fn(async () => store.boards[store.boards.length - 1]),
          findMany: vi.fn(async () => store.boards),
        },
        items: {
          findFirst: vi.fn(),
          findMany: vi.fn(async () => store.items),
        },
      },
      update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => ({ returning: vi.fn(async () => []) })) })) })),
      delete: vi.fn(() => ({ where: vi.fn(() => ({ returning: vi.fn(async () => [{ id: 'x' }]) })) })),
    },
  }
})

vi.mock('@/db/schema', () => ({ boards: {}, items: {} }))

import { createBoard, getBoard, createItem, updateItem, deleteItem } from '@/lib/db'

beforeEach(() => {
  store.boards.length = 0
  store.items.length = 0
  vi.clearAllMocks()
})

describe('createBoard', () => {
  it('slugが8文字のhex', async () => {
    const b = await createBoard('田中')
    expect(b.slug).toMatch(/^[0-9a-f]{8}$/)
  })

  it('slug/idが一意', async () => {
    const a = await createBoard('a')
    const b = await createBoard('b')
    expect(a.id).not.toBe(b.id)
    expect(a.slug).not.toBe(b.slug)
  })
})

describe('deleteItem', () => {
  it('存在するアイテムはtrueを返す', async () => {
    const result = await deleteItem('any-id')
    expect(result).toBe(true)
  })
})
