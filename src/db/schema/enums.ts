import { pgEnum } from 'drizzle-orm/pg-core';

export const accountStatusEnum = pgEnum('account_status', [
  'active',
  'suspended',
  'banned',
]);
export const backgroundCheckStatusEnum = pgEnum('background_check_status', [
  'pending',
  'approved',
  'rejected',
]);

export const messageTypeEnum = pgEnum('message_type', [
  'text',
  'image',
  'file',
  'system',
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
]);

export const dataTypeEnum = pgEnum('data_type', [
  'string',
  'integer',
  'decimal',
  'boolean',
  'json',
]);

export const applicationStatusEnum = pgEnum('application_status', [
  'pending',
  'accepted',
  'rejected',
  'withdrawn',
  'overdue',
]);

export const taskStatusEnum = pgEnum('task_status', [
  'open',
  'assigned',
  'in_progress',
  'completed',
  'cancelled',
  'disputed',
  'overdue',
]);

export const sessionStatusEnum = pgEnum('session_status', [
  'active',
  'paused',
  'completed',
]);

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

export const proficiencyLevelEnum = pgEnum('proficiency_level', [
  'beginner',
  'intermediate',
  'advanced',
  'expert',
]);

export type TaskStatus = (typeof taskStatusEnum.enumValues)[number];
