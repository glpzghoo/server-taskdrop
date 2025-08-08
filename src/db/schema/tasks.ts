import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  decimal,
  integer,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { users } from './user';
import { categories } from './categories';

export const taskStatusEnum = pgEnum('task_status', [
  'open',
  'assigned',
  'in_progress',
  'completed',
  'cancelled',
  'disputed',
]);

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
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 50 }),
  zipCode: varchar('zip_code', { length: 20 }),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  estimatedDuration: integer('estimated_duration').notNull(),
  paymentAmount: decimal('payment_amount', {
    precision: 8,
    scale: 2,
  }).notNull(),
  isUrgent: boolean('is_urgent').default(false),
  urgencyFee: decimal('urgency_fee', { precision: 6, scale: 2 }).default(
    '0.00'
  ),
  status: taskStatusEnum('status').default('open'),
  assignedTo: uuid('assigned_to').references(() => users.id),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  dueDate: timestamp('due_date', { withTimezone: true }),
  maxApplications: integer('max_applications').default(10),
  autoAssign: boolean('auto_assign').default(false),
  helperRating: integer('helper_rating'),
  posterRating: integer('poster_rating'),
  helperFeedback: text('helper_feedback'),
  posterFeedback: text('poster_feedback'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
