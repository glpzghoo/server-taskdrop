import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './user';
import { tasks } from './tasks';
import { reportReasonEnum, reportStatusEnum } from './enums';

export const userReports = pgTable('user_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  reporterId: uuid('reporter_id')
    .notNull()
    .references(() => users.id),
  reportedUserId: uuid('reported_user_id')
    .notNull()
    .references(() => users.id),
  taskId: uuid('task_id').references(() => tasks.id),
  reason: reportReasonEnum('reason').notNull(),
  description: text('description').notNull(),
  evidenceUrls: text('evidence_urls').array(),
  status: reportStatusEnum('status').default('pending'),
  adminNotes: text('admin_notes'),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
