import { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/lib/i18n";
import { chatStreamXiaohong, fetchXiaohongSuggestions } from "@/lib/api";
import PageHeader from "@/components/PageHeader";

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

export default function Chat() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [convId, setConvId] = useState<string | undefined>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetchXiaohongSuggestions().then((r) => setSuggestions(r.suggestions || [])).catch(() => {});
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const send = (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || streaming) return;
    setInput("");

    const userMsg: ChatMsg = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg, { role: "assistant", content: "" }]);
    setStreaming(true);

    let accumulated = "";
    abortRef.current = chatStreamXiaohong(msg, convId, (chunk, meta) => {
      // Handle error codes from api.ts
      const text = chunk === "[ERROR:UNAVAILABLE]" ? t("chat.errorUnavailable")
        : chunk === "[ERROR:NETWORK]" ? t("chat.errorNetwork")
        : chunk;
      accumulated += text;
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "assistant", content: accumulated };
        return copy;
      });
      if (meta?.conversationId) setConvId(meta.conversationId);
      if (meta?.done) setStreaming(false);
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <PageHeader title={t("chat.title")} />

      {/* Feature badges */}
      <div className="flex gap-2 px-4 py-1.5 bg-white border-b border-gray-100 overflow-x-auto scrollbar-hide">
        {["faiths", "sites", "temples", "routes"].map((f) => (
          <span key={f} className="px-2 py-0.5 text-[10px] bg-blue-50 text-blue-600 rounded-full whitespace-nowrap">
            {t(`chat.feature.${f}`)}
          </span>
        ))}
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-2xl mb-3">🙏</div>
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed max-w-xs mx-auto">{t("chat.welcome")}</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-md"
                  : "bg-white text-gray-800 rounded-bl-md shadow-sm"
              }`}
            >
              {msg.content || (streaming && i === messages.length - 1 ? "..." : "")}
            </div>
          </div>
        ))}
      </div>

      {/* Suggestion chips */}
      {messages.length === 0 && suggestions.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {suggestions.slice(0, 5).map((s, i) => (
            <button
              key={i}
              onClick={() => send(s)}
              className="px-3 py-1.5 bg-white border border-blue-200 text-blue-600 text-xs rounded-full"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={t("chat.placeholder")}
          className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button
          onClick={() => send()}
          disabled={streaming || !input.trim()}
          className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center disabled:opacity-40 active:bg-blue-700"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
