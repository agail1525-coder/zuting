"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { getAccessToken } from "../../lib/auth";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";

const DEFAULT_SUGGESTIONS = [
  "推荐朝圣路线",
  "佛教圣地介绍",
  "三十印如何修炼",
  "道教祖庭",
  "今日修行指引",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "🙏 您好！我是小鸿，您的朝圣旅行智慧助手。\n\n我熟知全球12大信仰、60处圣地、27座祖庭的文化与历史。无论您想了解朝圣路线、修行方法，还是宗教文化，都可以问我。\n\n请问有什么可以帮到您的？",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Check auth status and fetch suggestions on mount
  useEffect(() => {
    const token = getAccessToken();
    setIsLoggedIn(!!token);

    // Fetch suggestions from API
    fetch(`${API_URL}/xiaohong/suggestions`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch suggestions");
      })
      .then((data) => {
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
        }
      })
      .catch(() => {
        // Keep default suggestions on error
      });
  }, []);

  const simulateTypewriter = useCallback(
    (fullText: string) => {
      setIsStreaming(true);
      const msgId = `assistant-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: msgId, role: "assistant", content: "", timestamp: new Date() },
      ]);

      let index = 0;
      const chunkSize = 3;
      const interval = setInterval(() => {
        index += chunkSize;
        if (index >= fullText.length) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msgId ? { ...m, content: fullText } : m
            )
          );
          setIsStreaming(false);
          clearInterval(interval);
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msgId
                ? { ...m, content: fullText.slice(0, index) }
                : m
            )
          );
        }
      }, 20);
    },
    []
  );

  const handleSend = useCallback(
    async (text?: string) => {
      const msg = (text || input).trim();
      if (!msg || isStreaming) return;

      const token = getAccessToken();
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          role: "user",
          content: msg,
          timestamp: new Date(),
        },
      ]);
      setInput("");

      try {
        const res = await fetch(`${API_URL}/xiaohong/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: msg }),
        });

        if (res.status === 401) {
          setIsLoggedIn(false);
          setMessages((prev) => [
            ...prev,
            {
              id: `error-${Date.now()}`,
              role: "assistant",
              content: "登录已过期，请重新登录后继续对话。",
              timestamp: new Date(),
            },
          ]);
          return;
        }

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const data = await res.json();
        const reply = data.reply || "抱歉，我暂时无法回答这个问题。";
        simulateTypewriter(reply);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content: "抱歉，网络出现问题，请稍后重试。",
            timestamp: new Date(),
          },
        ]);
      }
    },
    [input, isStreaming, simulateTypewriter]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gold/10">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center text-lg border border-gold/20">
          🏛
        </div>
        <div>
          <h1 className="text-lg font-serif font-bold text-gradient-gold">
            小鸿 AI 助手
          </h1>
          <p className="text-xs text-temple-400">
            全球祖庭朝圣智慧导航
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-jade animate-glow" />
          <span className="text-xs text-jade">在线</span>
        </div>
      </div>

      {/* Login prompt */}
      {!isLoggedIn && (
        <div className="mx-4 mt-4 px-4 py-3 rounded-xl border border-gold/20 bg-gold/5 text-sm text-temple-200">
          请先{" "}
          <a href="/login" className="text-gold underline hover:text-gold/80">
            登录
          </a>{" "}
          后再与小鸿对话。
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                msg.role === "assistant"
                  ? "bg-gradient-to-br from-gold/30 to-gold/10 border border-gold/20"
                  : "bg-temple-700 border border-temple-600"
              }`}
            >
              {msg.role === "assistant" ? "🏛" : "👤"}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "assistant"
                  ? "bg-temple-800/80 border border-gold/15 text-temple-100"
                  : "bg-gold/15 border border-gold/20 text-temple-100"
              }`}
            >
              {msg.content}
              {msg.id !== "welcome" &&
                msg.role === "assistant" &&
                isStreaming &&
                msg === messages[messages.length - 1] && (
                  <span className="inline-block w-1.5 h-4 bg-gold/60 ml-0.5 animate-pulse" />
                )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              disabled={!isLoggedIn}
              className="px-3 py-1.5 text-xs rounded-full border border-gold/20 text-gold/80 hover:bg-gold/10 hover:border-gold/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="px-4 pb-4 pt-2 border-t border-gold/10">
        <div className="flex items-center gap-2 bg-temple-800/60 border border-gold/10 rounded-2xl px-4 py-2 focus-within:border-gold/30 transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoggedIn ? "输入您的问题..." : "请先登录后再对话"}
            disabled={isStreaming || !isLoggedIn}
            className="flex-1 bg-transparent text-temple-100 placeholder:text-temple-500 outline-none text-sm py-1"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isStreaming || !isLoggedIn}
            className="w-8 h-8 rounded-full bg-gold/20 hover:bg-gold/30 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg
              className="w-4 h-4 text-gold"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19V5m0 0l-7 7m7-7l7 7"
              />
            </svg>
          </button>
        </div>
        <p className="text-center text-[10px] text-temple-600 mt-2">
          小鸿 AI 基于全球祖庭数据库提供文化参考，不构成宗教指导
        </p>
      </div>
    </div>
  );
}
