import {
  pgTable,
  uuid,
  varchar,
  text,
  date,
  decimal,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';

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

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  profileImageUrl: text('profile_image_url'),
  bio: text('bio'),
  dateOfBirth: date('date_of_birth'),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 50 }),
  zipCode: varchar('zip_code', { length: 20 }),
  country: varchar('country', { length: 50 }).default('US'),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  isHelper: boolean('is_helper').default(false),
  isTaskPoster: boolean('is_task_poster').default(false),
  availableNow: boolean('available_now').default(false),
  maxTravelDistance: integer('max_travel_distance').default(10),
  preferredCategories: text('preferred_categories').array(),
  helperRating: decimal('helper_rating', { precision: 3, scale: 2 }).default(
    '0.00'
  ),
  helperRatingCount: integer('helper_rating_count').default(0),
  posterRating: decimal('poster_rating', { precision: 3, scale: 2 }).default(
    '0.00'
  ),
  posterRatingCount: integer('poster_rating_count').default(0),
  tasksCompleted: integer('tasks_completed').default(0),
  tasksPosted: integer('tasks_posted').default(0),
  totalEarned: decimal('total_earned', { precision: 10, scale: 2 }).default(
    '0.00'
  ),
  totalSpent: decimal('total_spent', { precision: 10, scale: 2 }).default(
    '0.00'
  ),
  emailVerified: boolean('email_verified').default(false),
  phoneVerified: boolean('phone_verified').default(false),
  backgroundCheckStatus: backgroundCheckStatusEnum(
    'background_check_status'
  ).default('pending'),
  accountStatus: accountStatusEnum('account_status').default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  lastActiveAt: timestamp('last_active_at', {
    withTimezone: true,
  }).defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
