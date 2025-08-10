import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { dataTypeEnum } from './enums';

export const systemSettings = pgTable('system_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 100 }).unique().notNull(),
  value: text('value').notNull(),
  description: text('description'),
  dataType: dataTypeEnum('data_type').default('string'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
