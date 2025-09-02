import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  decimal,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { users } from './user';
import { categories } from './categories';
import { taskStatusEnum } from './enums';

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  posterId: uuid('poster_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id')
    .notNull()
    .references(() => categories.id),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  requirements: text('requirements'),
  isRemote: boolean('is_remote').default(false),
  address: text('address'),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  estimatedDuration: integer('estimated_duration').notNull(),
  paymentAmount: integer('payment_amount').notNull(),
  isUrgent: boolean('is_urgent').default(false),
  urgencyFee: integer('urgency_fee').default(0).notNull(),
  status: taskStatusEnum('status').default('open').notNull(),
  assignedTo: uuid('assigned_to').references(() => users.id),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  dueDate: timestamp('due_date', { withTimezone: true }),
  maxApplications: integer('max_applications').default(500).notNull(),
  autoAssign: boolean('auto_assign').default(false).notNull(),
  disputeReason1: text('dispute_reason1'),
  disputeReason2: text('dispute_reason2'),
  helperRating: varchar('helper_rating'),
  posterRating: varchar('poster_rating'),
  helperFeedback: text('helper_feedback'),
  posterFeedback: text('poster_feedback'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
