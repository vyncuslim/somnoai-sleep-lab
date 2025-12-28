import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Send, Settings, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "👋 你好！我是 SomnoAI 健康顾问。我可以根据你的睡眠数据和心率数据提供个性化的健康建议。\n\n请告诉我你最近的睡眠情况、任何健康问题或你想了解的信息，我会为你提供专业的建议。",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem("gemini_api_key") || "");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Query today's sleep data
  const { data: todaySleep } = trpc.sleep.getToday.useQuery();
  const { data: todayHeartRate } = trpc.heartRate.getToday.useQuery();
  
  // Query chat history
  const { data: chatHistory } = trpc.chatHistory.getHistory.useQuery();
  const saveChatMutation = trpc.chatHistory.save.useMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast.error("请输入 Gemini API Key");
      return;
    }
    localStorage.setItem("gemini_api_key", apiKey);
    toast.success("API Key 已保存");
    setShowSettings(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    if (!apiKey) {
      toast.error("请先设置 Gemini API Key");
      setShowSettings(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // 构建上下文信息
      const context = `
用户的最新健康数据：
- 睡眠评分: ${todaySleep?.sleepScore || 0}
- 总睡眠时长: ${todaySleep?.totalDuration || 0}分钟
- 深睡时长: ${todaySleep?.deepSleepDuration || 0}分钟
- REM 睡眠: ${todaySleep?.remDuration || 0}分钟
- 浅睡时长: ${todaySleep?.lightSleepDuration || 0}分钟
- 平均心率: ${todayHeartRate?.averageHeartRate || 0} BPM
- 最低心率: ${todayHeartRate?.minHeartRate || 0} BPM
- 最高心率: ${todayHeartRate?.maxHeartRate || 0} BPM

用户消息: ${inputValue}
`;

      // 使用 tRPC 调用 AI 聊天
      const data = await trpc.ai.chat.useMutation().mutateAsync({
        message: inputValue,
        context: context,
        apiKey: apiKey,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Save to chat history
      try {
        await saveChatMutation.mutateAsync({ role: "user", message: inputValue, context });
        await saveChatMutation.mutateAsync({ role: "assistant", message: data.response });
      } catch (error) {
        console.error("Failed to save chat history:", error);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("获取 AI 响应失败，请检查 API Key");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("已复制到剪贴板");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-in-down">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🤖</div>
            <div>
              <h1 className="text-3xl font-bold text-white">AI 健康顾问</h1>
              <p className="text-gray-400 text-sm">由 Google Gemini 提供支持</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-white/10 rounded-lg transition-all"
            >
              <Settings className="w-6 h-6 text-cyan-400" />
            </button>
            <Link href="/">
              <Button variant="ghost" className="text-gray-400 hover:text-cyan-400">
                返回首页
              </Button>
            </Link>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <Card className="glassmorphism p-6 mb-6 animate-fade-in-down">
            <h2 className="text-xl font-semibold text-white mb-4">设置 Gemini API Key</h2>
            <div className="space-y-4">
              <div>
                <label className="text-gray-300 text-sm font-semibold mb-2 block">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                />
                <p className="text-gray-400 text-xs mt-2">
                  获取 API Key：<a href="https://ai.google.dev/tutorials/setup" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">https://ai.google.dev/tutorials/setup</a>
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleSaveApiKey}
                  className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 text-white"
                >
                  保存
                </Button>
                <Button
                  onClick={() => setShowSettings(false)}
                  variant="ghost"
                  className="flex-1 text-gray-400 hover:text-white"
                >
                  取消
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-4 glassmorphism p-6 rounded-lg border border-white/10">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}
            >
              <div
                className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-br-none"
                    : "bg-white/10 text-gray-200 border border-white/20 rounded-bl-none"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <div className="flex items-center justify-between mt-2 gap-2">
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString("zh-CN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {message.role === "assistant" && (
                    <button
                      onClick={() => copyToClipboard(message.content, message.id)}
                      className="hover:opacity-100 opacity-50 transition-opacity"
                    >
                      {copiedId === message.id ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-fade-in-up">
              <div className="bg-white/10 text-gray-200 border border-white/20 px-4 py-3 rounded-lg rounded-bl-none flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">AI 正在思考...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="输入您的问题或健康状况..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 disabled:opacity-50"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Health Data Summary */}
        <div className="mt-4 text-xs text-gray-400 text-center">
          <p>
            💡 AI 将根据您的睡眠数据（评分: {todaySleep?.sleepScore || 0}）和心率数据（平均: {todayHeartRate?.averageHeartRate || 0} BPM）提供个性化建议
          </p>
        </div>
      </div>
    </div>
  );
}
