"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  chatWithXiaohong,
  chatStreamXiaohong,
  fetchXiaohongSuggestions,
} from "../../lib/api";
import { useTranslation } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  intent?: string;
}

export default function ChatPage() {
  const { t } = useTranslation();

  const DEFAULT_SUGGESTIONS = [
    t("chat.suggestion.route"),
    t("chat.suggestion.buddhism"),
    t("chat.suggestion.seals"),
    t("chat.suggestion.taoism"),
    t("chat.suggestion.practice"),
  ];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: t("chat.welcomeFull"),
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    fetchXiaohongSuggestions()
      .then((data) => {
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
        }
      })
      .catch((err) => { console.error('Load suggestions failed:', err) });
  }, []);

  const handleSend = useCallback(
    async (text?: string) => {
      const msg = (text || input).trim();
      if (!msg || isStreaming) return;

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
      setIsStreaming(true);

      const assistantMsgId = `assistant-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
        },
      ]);

      try {
        let gotChunk = false;
        const controller = chatStreamXiaohong(
          msg,
          conversationId,
          (chunk, meta) => {
            gotChunk = true;
            if (meta?.conversationId && !conversationId) {
              setConversationId(meta.conversationId);
            }
            if (meta?.done) {
              setIsStreaming(false);
              return;
            }
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? { ...m, content: m.content + chunk, intent: meta?.intent || m.intent }
                  : m
              )
            );
          }
        );
        streamControllerRef.current = controller;

        // Fallback: if no chunk received after 15s, try sync API
        setTimeout(async () => {
          if (gotChunk) return; // stream is working, don't interfere
          controller.abort();
          try {
            const data = await chatWithXiaohong(msg, conversationId);
            const reply = data.content || data.reply || t("chat.fallbackReply");
            if (data.conversationId) setConversationId(data.conversationId);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId ? { ...m, content: reply } : m
              )
            );
          } catch {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? { ...m, content: t("chat.networkError") }
                  : m
              )
            );
          }
          setIsStreaming(false);
        }, 15000);
      } catch {
        try {
          const data = await chatWithXiaohong(msg, conversationId);
          const reply = data.content || data.reply || t("chat.fallbackReply");
          if (data.conversationId) setConversationId(data.conversationId);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, content: reply } : m
            )
          );
        } catch {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, content: t("chat.networkError") }
                : m
            )
          );
        }
        setIsStreaming(false);
      }
    },
    [input, isStreaming, conversationId, t]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasUserMessages = messages.length > 1;

  return (
    <div className="flex flex-col h-screen pt-16 max-w-4xl mx-auto bg-white">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white shrink-0">
        <div className="w-10 h-10 rounded-full bg-[#0066FF] flex items-center justify-center text-lg text-white">
          💬
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">
            {t("chat.title")}
          </h1>
          <p className="text-xs text-gray-500">
            {t("chat.subtitle")}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-glow" />
          <span className="text-xs text-green-600">{t("chat.online")}</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {/* Welcome Hero — only before user sends first message */}
        {!hasUserMessages && (
          <div className="relative overflow-hidden bg-gradient-to-br from-[#0066FF] to-[#003D99] px-6 py-10 text-center">
            {/* Decorative circles */}
            <div className="absolute top-[-40px] right-[-40px] w-40 h-40 rounded-full bg-white/5" />
            <div className="absolute bottom-[-20px] left-[-20px] w-28 h-28 rounded-full bg-white/5" />
            <div className="absolute top-[30%] left-[15%] w-3 h-3 rounded-full bg-white/20" />
            <div className="absolute top-[20%] right-[20%] w-2 h-2 rounded-full bg-white/30" />

            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl">
                🙏
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                {t("chat.title")}
              </h2>
              <p className="text-blue-100 text-sm max-w-md mx-auto leading-relaxed">
                {t("chat.subtitle")}
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap justify-center gap-2 mt-5">
                {[
                  { icon: "🌍", label: t("chat.feature.faiths") },
                  { icon: "📍", label: t("chat.feature.sites") },
                  { icon: "🏛️", label: t("chat.feature.temples") },
                  { icon: "✈️", label: t("chat.feature.routes") },
                ].map((f) => (
                  <span
                    key={f.label}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/15 text-white text-xs"
                  >
                    {f.icon} {f.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat messages */}
        <div className="px-4 py-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                  msg.role === "assistant"
                    ? "bg-[#0066FF] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {msg.role === "assistant" ? "💬" : "👤"}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "assistant"
                    ? "bg-white border border-gray-200 text-gray-800 shadow-sm"
                    : "bg-[#0066FF] text-white"
                }`}
              >
                {msg.content}
                {msg.id !== "welcome" &&
                  msg.role === "assistant" &&
                  isStreaming &&
                  msg === messages[messages.length - 1] && (
                    <span className="inline-block w-1.5 h-4 bg-[#0066FF]/60 ml-0.5 animate-pulse" />
                  )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestions */}
      {!hasUserMessages && (
        <div className="px-4 pb-3 pt-2 bg-gray-50 flex flex-wrap justify-center gap-2 shrink-0">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="px-3 py-1.5 text-xs rounded-full border border-gray-300 text-gray-600 hover:bg-[#0066FF] hover:text-white hover:border-[#0066FF] transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="px-4 pb-20 md:pb-4 pt-2 border-t border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-2xl px-4 py-2 focus-within:border-[#0066FF] focus-within:ring-2 focus-within:ring-[#0066FF]/20 transition-all">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("chat.placeholder")}
            disabled={isStreaming}
            className="flex-1 bg-transparent text-gray-900 placeholder:text-gray-400 outline-none text-sm py-1"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isStreaming}
            className="w-8 h-8 rounded-full bg-[#0066FF] hover:bg-[#0052CC] flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg
              className="w-4 h-4 text-white"
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
        <p className="text-center text-[10px] text-gray-400 mt-2">
          {t("chat.disclaimer")}
        </p>
      </div>

      <MobileNav />
    </div>
  );
}
