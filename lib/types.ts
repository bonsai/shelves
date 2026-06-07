export interface Board {
  id: string
  slug: string
  title: string
  created_at: string
}

export interface Item {
  id: string
  board_id: string
  slot_idx: number
  text: string
  done: boolean
  nid: string
  created_at: string
}

export interface DB {
  boards: Board[]
  items: Item[]
  itemCounters: Record<string, number>
}
