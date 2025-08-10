import {
  pgTable,
  uuid,
  integer,
  time,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { users } from './user';

export const availabilitySchedules = pgTable('availability_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  dayOfWeek: integer('day_of_week').notNull(), // 0 = nym, 6 = hagassain
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),

  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});
