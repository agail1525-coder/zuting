import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';
import { useAuth } from '../../src/lib/auth-context';
import {
  ChatMessageItem,
  fetchChatMessages,
  sendChatMessage,
  markChatRead,
} from '../../src/lib/api';

const POLL_INTERVAL = 5000;

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const currentUserId = user?.id ?? '';

  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList<ChatMessageItem>>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadMessages = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetchChatMessages(id);
      setMessages(res.items.slice().reverse());
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadMessages();
    if (id) {
      markChatRead(id).catch(() => {});
    }
  }, [id, loadMessages]);

  // Polling for new messages
  useEffect(() => {
    pollRef.current = setInterval(() => {
      loadMessages();
    }, POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [loadMessages]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || !id || sending) return;
    setSending(true);
    setInputText('');
    try {
      const newMsg = await sendChatMessage(id, text);
      setMessages((prev) => [...prev, newMsg]);
    } catch (err) {
      console.error('Failed to send message:', err);
      setInputText(text);
    } finally {
      setSending(false);
    }
  }, [inputText, id, sending]);

  const renderMessage = ({ item }: { item: ChatMessageItem }) => {
    const isOwn = item.senderId === currentUserId;
    return (
      <View style={[styles.messageRow, isOwn ? styles.messageRowOwn : styles.messageRowOther]}>
        {!isOwn && (
          <View style={styles.otherAvatar}>
            <Ionicons name="person" size={14} color={colors.textMuted} />
          </View>
        )}
        <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
          {item.isDeleted ? (
            <Text style={[styles.messageText, styles.deletedText]}>消息已撤回</Text>
          ) : (
            <Text style={[styles.messageText, isOwn ? styles.messageTextOwn : styles.messageTextOther]}>
              {item.content}
            </Text>
          )}
          <Text style={[styles.timeText, isOwn ? styles.timeTextOwn : styles.timeTextOther]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无消息，发送第一条消息吧</Text>
          </View>
        }
      />
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="输入消息..."
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <Pressable
          style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || sending}
        >
          <Ionicons
            name="send"
            size={20}
            color={inputText.trim() && !sending ? '#FFFFFF' : colors.textMuted}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
  messageList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: spacing.xs,
    alignItems: 'flex-end',
  },
  messageRowOwn: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  otherAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.lg,
  },
  bubbleOwn: {
    backgroundColor: colors.gold,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: colors.backgroundCardSolid,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: fontSize.md,
    lineHeight: 20,
  },
  messageTextOwn: {
    color: '#FFFFFF',
  },
  messageTextOther: {
    color: colors.textPrimary,
  },
  deletedText: {
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
  },
  timeTextOwn: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  timeTextOther: {
    color: colors.textMuted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundCardSolid,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
});
