import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  timestamp,
  pgEnum,
  unique,
} from 'drizzle-orm/pg-core';
import { users } from './user';
import { categories } from './categories';

export const proficiencyLevelEnum = pgEnum('proficiency_level', [
  'beginner',
  'intermediate',
  'advanced',
  'expert',
]);

export const userSkills = pgTable(
  'user_skills',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id),
    skillName: varchar('skill_name', { length: 100 }).notNull(),
    proficiencyLevel:
      proficiencyLevelEnum('proficiency_level').default('beginner'),
    yearsExperience: integer('years_experience').default(0),
    isVerified: boolean('is_verified').default(false),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    uniqueUserSkill: unique().on(
      table.userId,
      table.categoryId,
      table.skillName
    ),
  })
);

export type UserSkill = typeof userSkills.$inferSelect;
export type NewUserSkill = typeof userSkills.$inferInsert;
