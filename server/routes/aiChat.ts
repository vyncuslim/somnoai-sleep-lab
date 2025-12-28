import { Router, Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router();

/**
 * AI 聊天 API
 * 接收用户消息和 Gemini API Key，返回 AI 响应
 */
router.post("/api/ai/chat", async (req: Request, res: Response) => {
  try {
    const { message, context, apiKey } = req.body;

    if (!message || !apiKey) {
      return res.status(400).json({ error: "Missing message or API key" });
    }

    // 初始化 Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // 构建完整的 prompt
    const systemPrompt = `你是一个专业的睡眠健康顾问，由 SomnoAI 提供支持。
你的职责是根据用户的睡眠数据和健康信息提供个性化的建议和分析。

重要指南：
1. 始终基于用户提供的具体数据进行分析
2. 提供科学、可行的建议
3. 如果用户的数据表明可能存在健康问题，建议咨询医疗专业人士
4. 使用友好、鼓励的语气
5. 用中文回答

用户的健康数据：
${context}

请根据上述数据和用户的问题提供专业的建议。`;

    const chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(systemPrompt + "\n\n用户问题：" + message);
    const response = result.response.text();

    res.json({ response });
  } catch (error) {
    console.error("AI chat error:", error);
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return res.status(401).json({ error: "Invalid API key" });
      }
    }
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

export default router;
