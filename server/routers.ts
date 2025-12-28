import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Notifications router
  notifications: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getUserNotifications(ctx.user.id, input?.limit || 50);
      }),
    unread: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUnreadNotifications(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        content: z.string().optional(),
        type: z.string(),
        actionUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createNotification({
          userId: ctx.user.id,
          ...input,
        });
      }),
    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input }) => {
        await db.markNotificationAsRead(input.notificationId);
        return { success: true };
      }),
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      await db.markAllNotificationsAsRead(ctx.user.id);
      return { success: true };
    }),
    delete: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteNotification(input.notificationId);
        return { success: true };
      }),
  }),

  // Sleep Records router
  sleep: router({
    getToday: protectedProcedure.query(async ({ ctx }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const record = await db.getSleepRecord(ctx.user.id, today);
      if (!record) {
        return {
          id: 0,
          userId: ctx.user.id,
          recordDate: today,
          sleepScore: 0,
          totalDuration: 0,
          deepSleepDuration: 0,
          remDuration: 0,
          lightSleepDuration: 0,
          awakeDuration: 0,
          sleepEfficiency: 0,
          source: "manual",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      return record;
    }),
    getByDateRange: protectedProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getSleepRecordsByDateRange(ctx.user.id, input.startDate, input.endDate);
      }),
    create: protectedProcedure
      .input(z.object({
        recordDate: z.date(),
        sleepScore: z.number().optional(),
        totalDuration: z.number().optional(),
        deepSleepDuration: z.number().optional(),
        remDuration: z.number().optional(),
        lightSleepDuration: z.number().optional(),
        awakeDuration: z.number().optional(),
        sleepEfficiency: z.number().optional(),
        deepSleepPercentage: z.number().optional(),
        remPercentage: z.number().optional(),
        lightSleepPercentage: z.number().optional(),
        awakePercentage: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createSleepRecord({
          userId: ctx.user.id,
          source: "manual",
          ...input,
        });
      }),
  }),

  // Heart Rate router
  heartRate: router({
    getToday: protectedProcedure.query(async ({ ctx }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const record = await db.getHeartRateData(ctx.user.id, today);
      if (!record) {
        return {
          id: 0,
          userId: ctx.user.id,
          recordDate: today,
          averageHeartRate: 0,
          minHeartRate: 0,
          maxHeartRate: 0,
          restingHeartRate: 0,
          source: "manual",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      return record;
    }),
    getByDateRange: protectedProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getHeartRateDataByDateRange(ctx.user.id, input.startDate, input.endDate);
      }),
    create: protectedProcedure
      .input(z.object({
        recordDate: z.date(),
        averageHeartRate: z.number().optional(),
        minHeartRate: z.number().optional(),
        maxHeartRate: z.number().optional(),
        restingHeartRate: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createHeartRateData({
          userId: ctx.user.id,
          source: "manual",
          ...input,
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;
