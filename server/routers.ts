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
    getRecords: protectedProcedure
      .input(z.object({ limit: z.number().default(30) }).optional())
      .query(async ({ ctx, input }) => {
        // 返回用户最近的睡眠记录
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (input?.limit || 30));
        const records = await db.getSleepRecordsByDateRange(ctx.user.id, startDate, endDate);
        return records || [];
      }),
    createManualRecord: protectedProcedure
      .input(z.object({
        recordDate: z.date(),
        totalDuration: z.number(),
        deepSleepPercentage: z.number(),
        remPercentage: z.number(),
        lightSleepPercentage: z.number(),
        awakePercentage: z.number(),
        qualityScore: z.number(),
        averageHeartRate: z.number(),
        minHeartRate: z.number(),
        maxHeartRate: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // 创建睡眠记录
        const sleepRecord = await db.createSleepRecord({
          userId: ctx.user.id,
          recordDate: input.recordDate,
          totalDuration: input.totalDuration,
          sleepScore: input.qualityScore,
          deepSleepPercentage: input.deepSleepPercentage,
          remPercentage: input.remPercentage,
          lightSleepPercentage: input.lightSleepPercentage,
          awakePercentage: input.awakePercentage,
          notes: input.notes,
          source: "manual",
        });

        // 创建心率记录
        await db.createHeartRateData({
          userId: ctx.user.id,
          recordDate: input.recordDate,
          averageHeartRate: input.averageHeartRate,
          minHeartRate: input.minHeartRate,
          maxHeartRate: input.maxHeartRate,
          source: "manual",
        });

        return sleepRecord;
      }),
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

  // AI Chat router
  ai: router({
    chat: protectedProcedure
      .input(z.object({
        message: z.string(),
        context: z.string().optional(),
        apiKey: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          const { GoogleGenerativeAI } = await import("@google/generative-ai");
          const genAI = new GoogleGenerativeAI(input.apiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-pro" });

          const systemPrompt = `You are a professional sleep health advisor powered by SomnoAI.
Your role is to provide personalized advice and analysis based on user sleep data.

Guidelines:
1. Always analyze based on specific data provided
2. Give scientific and actionable advice
3. If data suggests health issues, recommend consulting professionals
4. Use friendly and encouraging tone
5. Respond in Chinese

${input.context || ""}

Please provide professional advice based on the data and user question.`;

          const chat = model.startChat({
            history: [],
            generationConfig: {
              maxOutputTokens: 1024,
              temperature: 0.7,
            },
          });

          const result = await chat.sendMessage(systemPrompt + "\n\nUser question: " + input.message);
          const response = result.response.text();

          return { response };
        } catch (error) {
          console.error("AI chat error:", error);
          if (error instanceof Error) {
            if (error.message.includes("API key")) {
              throw new Error("Invalid API key");
            }
          }
          throw new Error("Failed to get AI response");
        }
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
