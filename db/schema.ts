import { pgTable, text, boolean, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const planEnum = pgEnum('plan', ['free', 'pro'])

export const users = pgTable('users', {
  clerkId:   text('clerk_id').primaryKey(),
  email:     text('email').notNull(),
  plan:      planEnum('plan').notNull().default('free'),
  stripeCustomerId: text('stripe_customer_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const boards = pgTable('boards', {
  id:        text('id').primaryKey(),
  slug:      text('slug').notNull().unique(),
  title:     text('title').notNull(),
  userId:    text('user_id').references(() => users.clerkId, { onDelete: 'cascade' }),
  isPublic:  boolean('is_public').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const items = pgTable('items', {
  id:        text('id').primaryKey(),
  boardId:   text('board_id').notNull().references(() => boards.id, { onDelete: 'cascade' }),
  slotIdx:   integer('slot_idx').notNull(),
  text:      text('text').notNull(),
  done:      boolean('done').notNull().default(false),
  nid:       text('nid').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
