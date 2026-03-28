"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { getAccessToken } from "../../lib/auth";
import {
  chatWithXiaohong,
  chatStreamXiaohong,
  fetchXiaohongSuggestions,
} from "../../lib/api";
import { useTranslation } from "@/lib/i18n";

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
  const [isLoggedIn, setIsLoggedIn] = useState(true);
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

  // Check auth status and fetch suggestions on mount
  useEffect(() => {
    const token = getAccessToken();
    setIsLoggedIn(!!token);

    fetchXiaohongSuggestions()
      .then((data) => {
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
        }
      })
      .catch(() => {
        // Keep default suggestions on error
      });
  }, []);

  const handleSend = useCallback(
    async (text?: string) => {
      const msg = (text || input).trim();
      if (!msg || isStreaming) return;

      const token = getAccessToken();
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      // Add user message
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

      // Create assistant message placeholder
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

      // Try SSE streaming first
      try {
        let streamFailed = false;
        const controller = chatStreamXiaohong(
          msg,
          conversationId,
          (chunk, meta) => {
            if (meta?.conversationId && !conversationId) {
              setConversationId(meta.conversationId);
            }
            if (meta?.done) {
              setIsStreaming(false);
              return;
            }
            // Append chunk to assistant message
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

        // Set a timeout — if SSE fails within 10s with no data, fall back
        const timeout = setTimeout(async () => {
          // Check if we got any content
          const currentMsg = messages.find((m) => m.id === assistantMsgId);
          if (!currentMsg?.content && !streamFailed) {
            streamFailed = true;
            controller.abort();
            // Fallback to non-streaming
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
        }, 10000);

        // Clean up timeout if stream completes normally
        return () => clearTimeout(timeout);
      } catch (err) {
        // Fallback to regular chat
        try {
          const data = await chatWithXiaohong(msg, conversationId);
          const reply = data.content || data.reply || t("chat.fallbackReply");
          if (data.conversationId) setConversationId(data.conversationId);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, content: reply } : m
            )
          );
        } catch (innerErr) {
          const isAuthError =
            innerErr instanceof Error && innerErr.message.includes("401");
          if (isAuthError) {
            setIsLoggedIn(false);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? { ...m, content: t("chat.authExpired") }
                  : m
              )
            );
          } else {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? { ...m, content: t("chat.networkError") }
                  : m
              )
            );
          }
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

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gold/10">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center text-lg border border-gold/20">
          🏛
        </div>
        <div>
          <h1 className="text-lg font-serif font-bold text-gradient-gold">
            {t("chat.title")}
          </h1>
          <p className="text-xs text-temple-400">
            {t("chat.subtitle")}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-jade animate-glow" />
          <span className="text-xs text-jade">{t("chat.online")}</span>
        </div>
      </div>

      {/* Login prompt */}
      {!isLoggedIn && (
        <div className="mx-4 mt-4 px-4 py-3 rounded-xl border border-gold/20 bg-gold/5 text-sm text-temple-200">
          {t("chat.loginPromptPrefix")}{" "}
          <a href="/login" className="text-gold underline hover:text-gold/80">
            {t("chat.loginPromptLink")}
          </a>{" "}
          {t("chat.loginPromptSuffix")}
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
            placeholder={isLoggedIn ? t("chat.placeholder") : t("chat.loginRequired")}
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
          {t("chat.disclaimer")}
        </p>
      </div>
    </div>
  );
}
