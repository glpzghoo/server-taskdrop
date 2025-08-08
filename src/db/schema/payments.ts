import {
  pgTable,
  uuid,
  decimal,
  varchar,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { tasks } from './tasks';
import { users } from './user';

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
]);

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  payerId: uuid('payer_id')
    .notNull()
    .references(() => users.id),
  payeeId: uuid('payee_id')
    .notNull()
    .references(() => users.id),
  amount: decimal('amount', { precision: 8, scale: 2 }).notNull(),
  platformFee: decimal('platform_fee', { precision: 6, scale: 2 }).notNull(),
  urgencyFee: decimal('urgency_fee', { precision: 6, scale: 2 }).default(
    '0.00'
  ),
  netAmount: decimal('net_amount', { precision: 8, scale: 2 }).notNull(),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  stripeChargeId: varchar('stripe_charge_id', { length: 255 }),
  paymentMethod: varchar('payment_method', { length: 50 }),
  status: paymentStatusEnum('status').default('pending'),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
