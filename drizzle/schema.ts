import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Google Fit Integration - stores OAuth tokens and sync metadata
 */
export const googleFitIntegrations = mysqlTable("google_fit_integrations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  accessToken: text("accessToken").notNull(),
  refreshToken: text("refreshToken"),
  tokenExpiry: timestamp("tokenExpiry"),
  isConnected: int("isConnected").default(1).notNull(),
  lastSyncAt: timestamp("lastSyncAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GoogleFitIntegration = typeof googleFitIntegrations.$inferSelect;
export type InsertGoogleFitIntegration = typeof googleFitIntegrations.$inferInsert;

/**
 * Sleep Records - stores daily sleep data
 */
export const sleepRecords = mysqlTable("sleep_records", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  recordDate: timestamp("recordDate").notNull(),
  sleepScore: decimal("sleepScore", { precision: 5, scale: 2 }),
  totalDuration: int("totalDuration"),
  deepSleepDuration: int("deepSleepDuration"),
  remDuration: int("remDuration"),
  lightSleepDuration: int("lightSleepDuration"),
  awakeDuration: int("awakeDuration"),
  sleepEfficiency: decimal("sleepEfficiency", { precision: 5, scale: 2 }),
  deepSleepPercentage: decimal("deepSleepPercentage", { precision: 5, scale: 2 }),
  remPercentage: decimal("remPercentage", { precision: 5, scale: 2 }),
  lightSleepPercentage: decimal("lightSleepPercentage", { precision: 5, scale: 2 }),
  awakePercentage: decimal("awakePercentage", { precision: 5, scale: 2 }),
  source: varchar("source", { length: 32 }).default("manual"),
  googleFitId: varchar("googleFitId", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SleepRecord = typeof sleepRecords.$inferSelect;
export type InsertSleepRecord = typeof sleepRecords.$inferInsert;

/**
 * Heart Rate Data - stores daily heart rate statistics
 */
export const heartRateData = mysqlTable("heart_rate_data", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  recordDate: timestamp("recordDate").notNull(),
  averageHeartRate: int("averageHeartRate"),
  minHeartRate: int("minHeartRate"),
  maxHeartRate: int("maxHeartRate"),
  restingHeartRate: int("restingHeartRate"),
  source: varchar("source", { length: 32 }).default("manual"),
  googleFitId: varchar("googleFitId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HeartRateData = typeof heartRateData.$inferSelect;
export type InsertHeartRateData = typeof heartRateData.$inferInsert;

/**
 * Alarms - stores user alarm settings
 */
export const alarms = mysqlTable("alarms", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  label: varchar("label", { length: 255 }),
  time: varchar("time", { length: 5 }).notNull(),
  daysOfWeek: json("daysOfWeek"),
  isEnabled: int("isEnabled").default(1).notNull(),
  soundType: varchar("soundType", { length: 32 }).default("default"),
  vibration: int("vibration").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Alarm = typeof alarms.$inferSelect;
export type InsertAlarm = typeof alarms.$inferInsert;

/**
 * User Preferences - stores user settings
 */
export const userPreferences = mysqlTable("user_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  notificationsEnabled: int("notificationsEnabled").default(1).notNull(),
  darkMode: int("darkMode").default(1).notNull(),
  targetSleepDuration: int("targetSleepDuration").default(480),
  targetDeepSleepPercentage: decimal("targetDeepSleepPercentage", { precision: 5, scale: 2 }).default("15.00"),
  timezone: varchar("timezone", { length: 64 }).default("UTC"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = typeof userPreferences.$inferInsert;

/**
 * Notifications - stores user notifications
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  type: varchar("type", { length: 32 }).notNull(),
  isRead: int("isRead").default(0).notNull(),
  actionUrl: varchar("actionUrl", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * AI Chat History - stores conversations between user and AI assistant
 */
export const aiChatHistory = mysqlTable("ai_chat_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  message: text("message").notNull(),
  context: text("context"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AIChatHistory = typeof aiChatHistory.$inferSelect;
export type InsertAIChatHistory = typeof aiChatHistory.$inferInsert;

/**
 * Sleep Goals - stores user sleep targets and goals
 */
export const sleepGoals = mysqlTable("sleep_goals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  targetSleepDuration: int("targetSleepDuration").default(480).notNull(),
  targetDeepSleepPercentage: decimal("targetDeepSleepPercentage", { precision: 5, scale: 2 }).default("15.00"),
  targetRemPercentage: decimal("targetRemPercentage", { precision: 5, scale: 2 }).default("20.00"),
  targetSleepEfficiency: decimal("targetSleepEfficiency", { precision: 5, scale: 2 }).default("85.00"),
  notifyWhenMissed: int("notifyWhenMissed").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SleepGoal = typeof sleepGoals.$inferSelect;
export type InsertSleepGoal = typeof sleepGoals.$inferInsert;
