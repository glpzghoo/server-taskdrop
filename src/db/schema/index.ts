// export all schemas and types
export * from './user';
export * from './categories';
export * from './tasks';
export * from './task-applications';
export * from './time-sessions';
export * from './payments';
export * from './messages';
export * from './availability-schedules';
export * from './user-skills';
export * from './notifications';
export * from './user-reports';
export * from './system-settings';

// relations
import { relations } from 'drizzle-orm';
import { users } from './user';
import { categories } from './categories';
import { tasks } from './tasks';
import { taskApplications } from './task-applications';
import { timeSessions } from './time-sessions';
import { payments } from './payments';
import { messages } from './messages';
import { availabilitySchedules } from './availability-schedules';
import { userSkills } from './user-skills';
import { notifications } from './notifications';
import { userReports } from './user-reports';

// user relations
export const usersRelations = relations(users, ({ many }) => ({
  postedTasks: many(tasks, { relationName: 'poster' }),
  assignedTasks: many(tasks, { relationName: 'assignee' }),
  taskApplications: many(taskApplications),
  timeSessions: many(timeSessions),
  paymentsAsPayer: many(payments, { relationName: 'payer' }),
  paymentsAsPayee: many(payments, { relationName: 'payee' }),
  sentMessages: many(messages, { relationName: 'sender' }),
  receivedMessages: many(messages, { relationName: 'recipient' }),
  availabilitySchedules: many(availabilitySchedules),
  userSkills: many(userSkills),
  notifications: many(notifications),
  reportsMade: many(userReports, { relationName: 'reporter' }),
  reportsReceived: many(userReports, { relationName: 'reported' }),
}));

// category relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  tasks: many(tasks),
  userSkills: many(userSkills),
}));

// task relations
export const tasksRelations = relations(tasks, ({ one, many }) => ({
  poster: one(users, {
    fields: [tasks.posterId],
    references: [users.id],
    relationName: 'poster',
  }),
  assignee: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
    relationName: 'assignee',
  }),
  category: one(categories, {
    fields: [tasks.categoryId],
    references: [categories.id],
  }),
  applications: many(taskApplications),
  timeSessions: many(timeSessions),
  payments: many(payments),
  messages: many(messages),
  notifications: many(notifications),
  reports: many(userReports),
}));

// task Application relations
export const taskApplicationsRelations = relations(
  taskApplications,
  ({ one }) => ({
    task: one(tasks, {
      fields: [taskApplications.taskId],
      references: [tasks.id],
    }),
    helper: one(users, {
      fields: [taskApplications.helperId],
      references: [users.id],
    }),
  })
);

// time Session relations
export const timeSessionsRelations = relations(timeSessions, ({ one }) => ({
  task: one(tasks, {
    fields: [timeSessions.taskId],
    references: [tasks.id],
  }),
  helper: one(users, {
    fields: [timeSessions.helperId],
    references: [users.id],
  }),
}));

// payment relations
export const paymentsRelations = relations(payments, ({ one }) => ({
  task: one(tasks, {
    fields: [payments.taskId],
    references: [tasks.id],
  }),
  payer: one(users, {
    fields: [payments.payerId],
    references: [users.id],
    relationName: 'payer',
  }),
  payee: one(users, {
    fields: [payments.payeeId],
    references: [users.id],
    relationName: 'payee',
  }),
}));

// message relations
export const messagesRelations = relations(messages, ({ one }) => ({
  task: one(tasks, {
    fields: [messages.taskId],
    references: [tasks.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: 'sender',
  }),
  recipient: one(users, {
    fields: [messages.recipientId],
    references: [users.id],
    relationName: 'recipient',
  }),
}));

// availability Schedule relations
export const availabilitySchedulesRelations = relations(
  availabilitySchedules,
  ({ one }) => ({
    user: one(users, {
      fields: [availabilitySchedules.userId],
      references: [users.id],
    }),
  })
);

// user Skill relations
export const userSkillsRelations = relations(userSkills, ({ one }) => ({
  user: one(users, {
    fields: [userSkills.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [userSkills.categoryId],
    references: [categories.id],
  }),
}));

// notification relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [notifications.taskId],
    references: [tasks.id],
  }),
  relatedUser: one(users, {
    fields: [notifications.relatedUserId],
    references: [users.id],
  }),
}));

// user Report relations
export const userReportsRelations = relations(userReports, ({ one }) => ({
  reporter: one(users, {
    fields: [userReports.reporterId],
    references: [users.id],
    relationName: 'reporter',
  }),
  reportedUser: one(users, {
    fields: [userReports.reportedUserId],
    references: [users.id],
    relationName: 'reported',
  }),
  task: one(tasks, {
    fields: [userReports.taskId],
    references: [tasks.id],
  }),
}));
