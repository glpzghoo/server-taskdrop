import { pgTable, uuid, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { tasks } from './tasks';
import { users } from './user';
import { applicationStatusEnum } from './enums';

export const taskApplications = pgTable(
  'task_applications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    taskId: uuid('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    helperId: uuid('helper_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    message: text('message'),
    proposedStartTime: timestamp('proposed_start_time', { withTimezone: true }),
    estimatedCompletionTime: timestamp('estimated_completion_time', {
      withTimezone: true,
    }),
    status: applicationStatusEnum('status').default('pending'),
    appliedAt: timestamp('applied_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    respondedAt: timestamp('responded_at', { withTimezone: true }),
  },
  (table) => ({
    uniqueTaskHelper: unique().on(table.taskId, table.helperId),
  })
);
