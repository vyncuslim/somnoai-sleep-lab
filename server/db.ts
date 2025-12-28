import { eq, and, desc, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, sleepRecords, heartRateData, googleFitIntegrations, alarms, userPreferences, notifications } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

// Sleep Records queries
export async function getSleepRecord(userId: number, recordDate: Date) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(sleepRecords).where(
    and(eq(sleepRecords.userId, userId), eq(sleepRecords.recordDate, recordDate))
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getSleepRecordsByDateRange(userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(sleepRecords).where(
    and(
      eq(sleepRecords.userId, userId),
      gte(sleepRecords.recordDate, startDate),
      lte(sleepRecords.recordDate, endDate)
    )
  ).orderBy(desc(sleepRecords.recordDate));
}

export async function createSleepRecord(data: any) {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(sleepRecords).values(data);
  return data;
}

export async function updateSleepRecord(id: number, data: any) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(sleepRecords).set(data).where(eq(sleepRecords.id, id));
}

// Heart Rate Data queries
export async function getHeartRateData(userId: number, recordDate: Date) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(heartRateData).where(
    and(eq(heartRateData.userId, userId), eq(heartRateData.recordDate, recordDate))
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getHeartRateDataByDateRange(userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(heartRateData).where(
    and(
      eq(heartRateData.userId, userId),
      gte(heartRateData.recordDate, startDate),
      lte(heartRateData.recordDate, endDate)
    )
  ).orderBy(desc(heartRateData.recordDate));
}

export async function createHeartRateData(data: any) {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(heartRateData).values(data);
  return data;
}

export async function updateHeartRateData(id: number, data: any) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(heartRateData).set(data).where(eq(heartRateData.id, id));
}

// Google Fit Integration queries
export async function getGoogleFitIntegration(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(googleFitIntegrations).where(
    eq(googleFitIntegrations.userId, userId)
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createGoogleFitIntegration(data: any) {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(googleFitIntegrations).values(data);
  return data;
}

export async function updateGoogleFitIntegration(userId: number, data: any) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(googleFitIntegrations).set(data).where(eq(googleFitIntegrations.userId, userId));
}

// Alarms queries
export async function getUserAlarms(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(alarms).where(eq(alarms.userId, userId));
}

export async function createAlarm(data: any) {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(alarms).values(data);
  return data;
}

export async function updateAlarm(id: number, data: any) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(alarms).set(data).where(eq(alarms.id, id));
}

export async function deleteAlarm(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  await db.delete(alarms).where(eq(alarms.id, id));
}

// User Preferences queries
export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userPreferences).where(
    eq(userPreferences.userId, userId)
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUserPreferences(data: any) {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(userPreferences).values(data);
  return data;
}

export async function updateUserPreferences(userId: number, data: any) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(userPreferences).set(data).where(eq(userPreferences.userId, userId));
}

// Notifications queries
export async function getUserNotifications(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(notifications).where(
    eq(notifications.userId, userId)
  ).orderBy(desc(notifications.createdAt)).limit(limit);
}

export async function getUnreadNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(notifications).where(
    and(eq(notifications.userId, userId), eq(notifications.isRead, 0))
  ).orderBy(desc(notifications.createdAt));
}

export async function createNotification(data: any) {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(notifications).values(data);
  return data;
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(notifications).set({ isRead: 1 }).where(eq(notifications.id, notificationId));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(notifications).set({ isRead: 1 }).where(eq(notifications.userId, userId));
}

export async function deleteNotification(notificationId: number) {
  const db = await getDb();
  if (!db) return undefined;
  await db.delete(notifications).where(eq(notifications.id, notificationId));
}
