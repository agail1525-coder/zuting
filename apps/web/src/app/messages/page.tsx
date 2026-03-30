"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import {
  fetchChatRooms,
  fetchChatMessages,
  sendChatMessage,
  markChatRead,
  ChatRoom,
  ChatMessage,
} from "@/lib/api";
import MobileNav from "@/components/MobileNav";

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;

  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "yesterday";
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatDateLabel(dateStr: string, t: (k: string) => string): string {
  const date = new Date(dateStr);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) return t("chat.today");

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return t("chat.yesterday");

  return date.toLocaleDateString([], { year: "numeric", month: "long", day: "numeric" });
}

function groupMessagesByDate(messages: ChatMessage[]): { date: string; messages: ChatMessage[] }[] {
  const groups: Map<string, ChatMessage[]> = new Map();
  for (const msg of messages) {
    const key = new Date(msg.createdAt).toDateString();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(msg);
  }
  return Array.from(groups.entries()).map(([date, msgs]) => ({
    date: msgs[0].createdAt,
    messages: msgs,
  }));
}

function RoomListItem({
  room,
  isActive,
  userId,
  onClick,
}: {
  room: ChatRoom;
  isActive: boolean;
  userId: string;
  onClick: () => void;
}) {
  const displayName =
    room.name ??
    (room.participants
      .filter((p) => p.userId !== userId)
      .map((p) => p.userId.slice(0, 6))
      .join(", ") ||
    "Chat");

  const initials = displayName.charAt(0).toUpperCase();
  const lastMsg = room.lastMessage;
  const unread = room.unreadCount ?? 0;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
        isActive
          ? "bg-blue-50 border-r-2 border-[#0066FF]"
          : "hover:bg-gray-50"
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0066FF] to-[#0052CC] flex items-center justify-center text-white font-semibold text-sm shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={`text-sm truncate ${unread > 0 ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
            {displayName}
          </span>
          {lastMsg && (
            <span className="text-xs text-gray-400 shrink-0 ml-2">
              {formatMessageTime(lastMsg.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className={`text-xs truncate ${unread > 0 ? "text-gray-700 font-medium" : "text-gray-500"}`}>
            {lastMsg?.isDeleted ? "[deleted]" : lastMsg?.content ?? ""}
          </p>
          {unread > 0 && (
            <span className="ml-2 shrink-0 bg-[#0066FF] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default function MessagesPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeRoom = rooms.find((r) => r.id === activeRoomId) ?? null;

  const loadRooms = useCallback(async () => {
    try {
      const data = await fetchChatRooms();
      setRooms(Array.isArray(data) ? data : []);
    } catch {
      // API may not exist yet
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  const loadMessages = useCallback(async (roomId: string) => {
    setLoadingMessages(true);
    try {
      const data = await fetchChatMessages(roomId);
      setMessages(Array.isArray(data?.items) ? data.items : []);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // Load rooms on mount
  useEffect(() => {
    if (!authLoading && user) {
      loadRooms();
    }
  }, [authLoading, user, loadRooms]);

  // Load messages when active room changes
  useEffect(() => {
    if (activeRoomId) {
      loadMessages(activeRoomId);
      markChatRead(activeRoomId).catch((err) => { console.error('Mark chat read failed:', err); });
    } else {
      setMessages([]);
    }
  }, [activeRoomId, loadMessages]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (activeRoomId) {
      pollingRef.current = setInterval(() => {
        loadMessages(activeRoomId);
        loadRooms();
      }, 5000);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeRoomId, loadMessages, loadRooms]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !activeRoomId || sending) return;
    const text = inputText.trim();
    setInputText("");
    setSending(true);
    try {
      const newMsg = await sendChatMessage(activeRoomId, text);
      if (newMsg?.id) {
        setMessages((prev) => [...prev, newMsg]);
      } else {
        // Refetch messages if response was unexpected
        await loadMessages(activeRoomId);
      }
    } catch {
      // Refetch in case it went through
      await loadMessages(activeRoomId);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredRooms = searchQuery
    ? rooms.filter((r) => {
        const name = r.name ?? "";
        return name.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : rooms;

  const userId = user?.id ?? "";
  const grouped = groupMessagesByDate(messages);

  if (authLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#0066FF] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center text-gray-500 gap-4">
        <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-lg">{t("chat.messages")}</p>
        <a href="/login" className="text-[#0066FF] hover:underline">
          {t("nav.login")}
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)] flex border-x border-gray-200 bg-white">
        {/* Left Panel - Room List */}
        <div className="w-80 border-r border-gray-200 flex flex-col shrink-0">
          {/* Header */}
          <div className="px-4 py-4 border-b border-gray-200">
            <h1 className="text-lg font-bold text-gray-900 mb-3">
              {t("chat.messages")}
            </h1>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("chat.sendPlaceholder")}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] bg-gray-50"
              />
            </div>
          </div>

          {/* Room List */}
          <div className="flex-1 overflow-y-auto">
            {loadingRooms ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-6 h-6 border-2 border-[#0066FF] border-t-transparent rounded-full" />
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm">{t("chat.noRooms")}</p>
              </div>
            ) : (
              filteredRooms.map((room) => (
                <RoomListItem
                  key={room.id}
                  room={room}
                  isActive={room.id === activeRoomId}
                  userId={userId}
                  onClick={() => setActiveRoomId(room.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {!activeRoom ? (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <svg className="w-20 h-20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-lg font-medium">{t("chat.selectRoom")}</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="px-6 py-3 border-b border-gray-200 flex items-center gap-3 bg-white shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0066FF] to-[#0052CC] flex items-center justify-center text-white font-semibold text-sm">
                  {(activeRoom.name ?? "C").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    {activeRoom.name ??
                      (activeRoom.participants
                        .filter((p) => p.userId !== userId)
                        .map((p) => p.userId.slice(0, 8))
                        .join(", ") ||
                      "Chat")}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {activeRoom.participants.length} participant{activeRoom.participants.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin w-6 h-6 border-2 border-[#0066FF] border-t-transparent rounded-full" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
                    {t("chat.noRooms")}
                  </div>
                ) : (
                  grouped.map((group) => (
                    <div key={group.date}>
                      {/* Date label */}
                      <div className="flex items-center justify-center my-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                          {formatDateLabel(group.date, t)}
                        </span>
                      </div>
                      {/* Messages */}
                      <div className="space-y-2">
                        {group.messages.map((msg) => {
                          const isOwn = msg.senderId === userId;
                          return (
                            <div
                              key={msg.id}
                              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                                  isOwn
                                    ? "bg-[#0066FF] text-white rounded-br-md"
                                    : "bg-gray-100 text-gray-900 rounded-bl-md"
                                }`}
                              >
                                {msg.isDeleted ? (
                                  <p className="text-sm italic opacity-60">[deleted]</p>
                                ) : (
                                  <p className="text-sm whitespace-pre-wrap break-words">
                                    {msg.content}
                                  </p>
                                )}
                                <p
                                  className={`text-[10px] mt-1 ${
                                    isOwn ? "text-white/60" : "text-gray-400"
                                  }`}
                                >
                                  {new Date(msg.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="px-4 py-3 border-t border-gray-200 bg-white shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t("chat.sendPlaceholder")}
                    disabled={sending}
                    className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] disabled:opacity-50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim() || sending}
                    className="px-5 py-2.5 bg-[#0066FF] text-white text-sm font-medium rounded-full hover:bg-[#0052CC] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      t("chat.send")
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
