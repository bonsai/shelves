import { describe, it, expect, beforeEach } from 'vitest'
import { getDB, resetDB, createBoard, createItem, getBoard, deleteItem, updateItem } from '@/lib/db'

beforeEach(() => resetDB())

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

describe('getBoard', () => {
  it('存在するslugで取得できる', async () => {
    const board = await createBoard('鈴木')
    const result = await getBoard(board.slug)
    expect(result?.title).toBe('鈴木')
  })

  it('存在しないslugはundefined', async () => {
    expect(await getBoard('00000000')).toBeUndefined()
  })
})

describe('createItem', () => {
  it('スロットに書き込める', async () => {
    const board = await createBoard('test')
    const item = await createItem({ board_id: board.id, slot_idx: 0, text: '富士山に登る', done: false })
    expect(item.text).toBe('富士山に登る')
    expect(item.done).toBe(false)
    expect(item.nid).toBe('1')
  })

  it('nidが自動採番される', async () => {
    const board = await createBoard('test')
    const i1 = await createItem({ board_id: board.id, slot_idx: 0, text: 'a', done: false })
    const i2 = await createItem({ board_id: board.id, slot_idx: 1, text: 'b', done: false })
    expect(i1.nid).toBe('1')
    expect(i2.nid).toBe('2')
  })

  it('100スロット全て埋められる', async () => {
    const board = await createBoard('test')
    for (let i = 0; i < 100; i++) {
      await createItem({ board_id: board.id, slot_idx: i, text: `やること${i + 1}`, done: false })
    }
    expect(getDB().items).toHaveLength(100)
  })

  it('同じスロットへの二重書き込みは失敗', async () => {
    const board = await createBoard('test')
    await createItem({ board_id: board.id, slot_idx: 0, text: 'first', done: false })
    await expect(
      createItem({ board_id: board.id, slot_idx: 0, text: 'second', done: false })
    ).rejects.toThrow('slot occupied')
  })
})

describe('updateItem', () => {
  it('テキストを更新できる', async () => {
    const board = await createBoard('test')
    const item = await createItem({ board_id: board.id, slot_idx: 0, text: 'old', done: false })
    const updated = await updateItem(item.id, { text: 'new' })
    expect(updated?.text).toBe('new')
  })

  it('達成フラグを更新できる', async () => {
    const board = await createBoard('test')
    const item = await createItem({ board_id: board.id, slot_idx: 0, text: '登山', done: false })
    const updated = await updateItem(item.id, { done: true })
    expect(updated?.done).toBe(true)
  })

  it('存在しないidはundefined', async () => {
    expect(await updateItem('nonexistent', { text: 'x' })).toBeUndefined()
  })
})

describe('deleteItem', () => {
  it('アイテムを削除できる', async () => {
    const board = await createBoard('test')
    const item = await createItem({ board_id: board.id, slot_idx: 0, text: 'bye', done: false })
    expect(await deleteItem(item.id)).toBe(true)
    expect(getDB().items.find(m => m.id === item.id)).toBeUndefined()
  })
})
