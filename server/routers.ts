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
    list: publicProcedure
      .input(z.object({ limit: z.number().default(50) }).optional())
      .query(async ({ ctx, input }) => {
        const userId = 1; // Default guest user
        return await db.getUserNotifications(userId, input?.limit || 50);
      }),
    unread: publicProcedure.query(async ({ ctx }) => {
      const userId = 1; // Default guest user
      return await db.getUnreadNotifications(userId);
    }),
    create: publicProcedure
      .input(z.object({
        title: z.string(),
        content: z.string().optional(),
        type: z.string(),
        actionUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = 1; // Default guest user
        return await db.createNotification({
          userId,
          ...input,
        });
      }),
    markAsRead: publicProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input }) => {
        await db.markNotificationAsRead(input.notificationId);
        return { success: true };
      }),
    markAllAsRead: publicProcedure.mutation(async ({ ctx }) => {
      const userId = 1; // Default guest user
      await db.markAllNotificationsAsRead(userId);
      return { success: true };
    }),
    delete: publicProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteNotification(input.notificationId);
        return { success: true };
      }),
  }),

  // Sleep Records router
  sleep: router({
    getRecords: publicProcedure
      .input(z.object({ limit: z.number().default(30) }).optional())
      .query(async ({ ctx, input }) => {
        // 返回用户最近的睡眠记录
        const userId = 1; // Default guest user
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (input?.limit || 30));
        const records = await db.getSleepRecordsByDateRange(userId, startDate, endDate);
        return records || [];
      }),
    createManualRecord: publicProcedure
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
        const userId = 1; // Default guest user
        const sleepRecord = await db.createSleepRecord({
          userId,
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
          userId,
          recordDate: input.recordDate,
          averageHeartRate: input.averageHeartRate,
          minHeartRate: input.minHeartRate,
          maxHeartRate: input.maxHeartRate,
          source: "manual",
        });

        return sleepRecord;
      }),
    getToday: publicProcedure.query(async ({ ctx }) => {
      const userId = 1; // Default guest user
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const record = await db.getSleepRecord(userId, today);
      if (!record) {
        return {
          id: 0,
          userId,
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
    getByDateRange: publicProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ ctx, input }) => {
        const userId = 1; // Default guest user
        return await db.getSleepRecordsByDateRange(userId, input.startDate, input.endDate);
      }),
    create: publicProcedure
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
        const userId = 1; // Default guest user
        return await db.createSleepRecord({
          userId,
          source: "manual",
          ...input,
        });
      }),
  }),

  // AI Chat router
  ai: router({
    chat: publicProcedure
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
    getToday: publicProcedure.query(async ({ ctx }) => {
      const userId = 1; // Default guest user
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const record = await db.getHeartRateData(userId, today);
      if (!record) {
        return {
          id: 0,
          userId: 1,
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
    getByDateRange: publicProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ ctx, input }) => {
        const userId = 1; // Default guest user
        return await db.getHeartRateDataByDateRange(userId, input.startDate, input.endDate);
      }),
    create: publicProcedure
      .input(z.object({
        recordDate: z.date(),
        averageHeartRate: z.number().optional(),
        minHeartRate: z.number().optional(),
        maxHeartRate: z.number().optional(),
        restingHeartRate: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = 1; // Default guest user
        return await db.createHeartRateData({
          userId,
          source: "manual",
          ...input,
        });
      }),
  }),

  // AI Chat History router
  chatHistory: router({
    save: publicProcedure
      .input(z.object({
        role: z.enum(["user", "assistant"]),
        message: z.string(),
        context: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = 1; // Default guest user
        return await db.saveAIChatMessage(userId, input.role, input.message, input.context);
      }),
    getHistory: publicProcedure
      .input(z.object({ limit: z.number().default(50) }).optional())
      .query(async ({ ctx, input }) => {
        const userId = 1; // Default guest user
        return await db.getAIChatHistory(userId, input?.limit || 50);
      }),
  }),

  // Google Fit Integration router
  googleFit: router({
    getAuthUrl: publicProcedure.query(async ({ ctx }) => {
      try {
        // 获取用户的 Google Fit 集成状态
        const userId = 1; // Default guest user
        const integration = await db.getGoogleFitIntegration(userId);
        if (integration && integration.accessToken) {
          return { connected: true, message: "Already connected" };
        }

        // 构建 Google OAuth 授权 URL
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const redirectUri = `${process.env.VITE_FRONTEND_FORGE_API_URL || 'http://localhost:3000'}/api/google-fit/callback`;
        const scopes = [
          "https://www.googleapis.com/auth/fitness.sleep.read",
          "https://www.googleapis.com/auth/fitness.heart_rate.read",
          "https://www.googleapis.com/auth/fitness.activity.read",
          "https://www.googleapis.com/auth/fitness.body.read",
        ];

        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes.join(' '))}&access_type=offline`;

        return { connected: false, authUrl };
      } catch (error) {
        console.error("Failed to get auth URL:", error);
        throw new Error("Failed to get Google Fit auth URL");
      }
    }),
    getStatus: publicProcedure.query(async ({ ctx }) => {
      try {
        const userId = 1; // Default guest user
        const integration = await db.getGoogleFitIntegration(userId);
        return {
          connected: !!integration && !!integration.accessToken,
          lastSync: integration?.lastSyncAt || null,
        };
      } catch (error) {
        console.error("Failed to get status:", error);
        throw new Error("Failed to get Google Fit status");
      }
    }),
  }),

  // Sleep Goals router
  sleepGoals: router({
    get: publicProcedure.query(async ({ ctx }) => {
      const userId = 1; // Default guest user
      return await db.getUserSleepGoal(userId);
    }),
    create: publicProcedure
      .input(z.object({
        targetSleepDuration: z.number().optional(),
        targetDeepSleepPercentage: z.number().optional(),
        targetRemPercentage: z.number().optional(),
        targetSleepEfficiency: z.number().optional(),
        notifyWhenMissed: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = 1; // Default guest user
        const existingGoal = await db.getUserSleepGoal(userId);
        if (existingGoal) {
          return await db.updateSleepGoal(userId, input);
        }
        return await db.createSleepGoal({
          userId,
          ...input,
        });
      }),
    update: publicProcedure
      .input(z.object({
        targetSleepDuration: z.number().optional(),
        targetDeepSleepPercentage: z.number().optional(),
        targetRemPercentage: z.number().optional(),
        targetSleepEfficiency: z.number().optional(),
        notifyWhenMissed: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = 1; // Default guest user
        return await db.updateSleepGoal(userId, input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
