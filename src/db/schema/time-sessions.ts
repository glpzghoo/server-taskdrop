import {
  pgTable,
  uuid,
  timestamp,
  integer,
  decimal,
} from 'drizzle-orm/pg-core';
import { tasks } from './tasks';
import { users } from './user';
import { sessionStatusEnum } from './enums';
export const timeSessions = pgTable('time_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  helperId: uuid('helper_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  durationMinutes: integer('duration_minutes'),
  startLatitude: decimal('start_latitude', { precision: 10, scale: 8 }),
  startLongitude: decimal('start_longitude', { precision: 11, scale: 8 }),
  endLatitude: decimal('end_latitude', { precision: 10, scale: 8 }),
  endLongitude: decimal('end_longitude', { precision: 11, scale: 8 }),
  status: sessionStatusEnum('status').default('active'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
