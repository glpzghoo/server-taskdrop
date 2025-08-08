import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './user';
import { tasks } from './tasks';

export const reportReasonEnum = pgEnum('report_reason', [
  'inappropriate_behavior',
  'no_show',
  'poor_quality',
  'safety_concern',
  'fraud',
  'other',
]);

export const reportStatusEnum = pgEnum('report_status', [
  'pending',
  'investigating',
  'resolved',
  'dismissed',
]);

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

export type UserReport = typeof userReports.$inferSelect;
export type NewUserReport = typeof userReports.$inferInsert;
