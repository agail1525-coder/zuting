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
import { useRouter } from 'expo-router';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';
import { useAuth } from '../../src/lib/auth-context';
import { getAccessToken, API_URL } from '../../src/lib/auth';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

const DEFAULT_SUGGESTIONS = [
  '推荐一条文化之旅路线',
  '佛教文化有哪些圣地？',
  '什么是曹溪三十印？',
  '如何开始修行？',
  '基督文化圣地介绍',
  '道教文化祖庭在哪里？',
];

const ERROR_RESPONSE = 'AI助手暂时不可用，请稍后重试';

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'bot',
  content: '您好！我是小鸿 🏛，您的佳绩之旅AI助手。\n\n我可以帮您了解世界各大文化传统的圣地、祖庭、祖师和修行法门，也可以为您规划文化之旅路线。\n\n请问有什么可以帮您的？',
  timestamp: new Date(),
};

export default function ChatScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const flatListRef = useRef<FlatList>(null);
  const typingOpacity = useSharedValue(1);

  useEffect(() => {
    fetch(`${API_URL}/xiaohong/suggestions`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch suggestions');
      })
      .then((data: { suggestions?: string[] }) => {
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
        }
      })
      .catch(() => {
        // Keep default suggestions on error
      });
  }, []);

  useEffect(() => {
    typingOpacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 500 }),
        withTiming(1, { duration: 500 }),
      ),
      -1,
      true,
    );
  }, []);

  const typingStyle = useAnimatedStyle(() => ({
    opacity: typingOpacity.value,
  }));

  const scrollToEnd = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const simulateTyping = useCallback(
    (fullText: string, messageId: string) => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        currentIndex += 2;
        if (currentIndex >= fullText.length) {
          currentIndex = fullText.length;
          clearInterval(interval);
          setIsTyping(false);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId
                ? { ...m, content: fullText, isTyping: false }
                : m,
            ),
          );
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId
                ? { ...m, content: fullText.slice(0, currentIndex) }
                : m,
            ),
          );
        }
        scrollToEnd();
      }, 20);
    },
    [scrollToEnd],
  );

  const sendMessageWithText = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    scrollToEnd();

    const botMsgId = `bot-${Date.now()}`;
    const botMsg: Message = {
      id: botMsgId,
      role: 'bot',
      content: '',
      timestamp: new Date(),
      isTyping: true,
    };

    let responseText: string;
    try {
      const token = await getAccessToken();
      const res = await fetch(`${API_URL}/xiaohong/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: text }),
      });
      if (res.ok) {
        const data = await res.json();
        responseText = data.reply || data.content || data.message || ERROR_RESPONSE;
      } else {
        responseText = ERROR_RESPONSE;
      }
    } catch {
      responseText = ERROR_RESPONSE;
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, botMsg]);
      scrollToEnd();
      setTimeout(() => {
        simulateTyping(responseText, botMsgId);
      }, 300);
    }, 600);
  }, [isTyping, scrollToEnd, simulateTyping]);

  const sendMessage = useCallback(async () => {
    const text = inputText.trim();
    if (!text) return;
    sendMessageWithText(text);
  }, [inputText, sendMessageWithText]);

  const handleSuggestion = useCallback(
    (suggestion: string) => {
      sendMessageWithText(suggestion);
    },
    [sendMessageWithText],
  );

  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isBot = item.role === 'bot';
      return (
        <Animated.View
          entering={FadeInDown.duration(300).delay(index === 0 ? 0 : 100)}
          style={[styles.messageRow, isBot ? styles.botRow : styles.userRow]}
        >
          {isBot && (
            <View style={styles.botAvatar}>
              <Text style={styles.botAvatarText}>🏛</Text>
            </View>
          )}
          <View
            style={[
              styles.messageBubble,
              isBot ? styles.botBubble : styles.userBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                isBot ? styles.botText : styles.userText,
              ]}
            >
              {item.content}
            </Text>
            {item.isTyping && (
              <Animated.View style={[styles.typingCursor, typingStyle]}>
                <View style={styles.cursor} />
              </Animated.View>
            )}
          </View>
        </Animated.View>
      );
    },
    [typingStyle],
  );

  const renderSuggestions = useCallback(() => {
    if (messages.length > 2) return null;
    return (
      <Animated.View entering={FadeInUp.duration(400).delay(400)} style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>您可以问我：</Text>
        <View style={styles.suggestionsGrid}>
          {suggestions.map((suggestion) => (
            <Pressable
              key={suggestion}
              style={({ pressed }) => [
                styles.suggestionChip,
                pressed && styles.suggestionChipPressed,
              ]}
              onPress={() => handleSuggestion(suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>
    );
  }, [messages.length, handleSuggestion, suggestions]);

  // Auth gate: if not logged in, show prompt
  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl }]}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 48, marginBottom: spacing.md }}>🏛</Text>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: '700', marginBottom: spacing.sm }}>
            小鸿 AI 助手
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 22 }}>
            登录后即可与小鸿对话{'\n'}了解全球圣地、规划文化之旅路线
          </Text>
          <Pressable
            style={{
              backgroundColor: colors.gold,
              paddingHorizontal: spacing.xl,
              paddingVertical: spacing.md,
              borderRadius: borderRadius.full,
            }}
            onPress={() => router.push('/login')}
          >
            <Text style={{ color: '#FFFFFF', fontSize: fontSize.lg, fontWeight: '700' }}>
              登录 / 注册
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Background decoration */}
      <View style={styles.bgDecoration}>
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        ListFooterComponent={renderSuggestions}
        showsVerticalScrollIndicator={false}
      />

      {/* Typing indicator */}
      {isTyping && (
        <Animated.View style={[styles.typingIndicator, typingStyle]}>
          <Text style={styles.typingText}>小鸿正在输入...</Text>
        </Animated.View>
      )}

      {/* Input bar */}
      <View style={styles.inputBar}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="向小鸿提问..."
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
            blurOnSubmit
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              (!inputText.trim() || isTyping) && styles.sendButtonDisabled,
              pressed && inputText.trim() && !isTyping && styles.sendButtonPressed,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isTyping}
          >
            <Ionicons
              name="send"
              size={20}
              color={
                inputText.trim() && !isTyping
                  ? '#FFFFFF'
                  : colors.textMuted
              }
            />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bgDecoration: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(0, 102, 255, 0.03)',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: 100,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(0, 102, 255, 0.02)',
  },
  messageList: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-end',
  },
  botRow: {
    justifyContent: 'flex-start',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  botAvatarText: {
    fontSize: 18,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.lg,
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderBottomLeftRadius: borderRadius.sm,
  },
  userBubble: {
    backgroundColor: colors.gold,
    borderBottomRightRadius: borderRadius.sm,
  },
  messageText: {
    fontSize: fontSize.lg,
    lineHeight: 24,
  },
  botText: {
    color: colors.textPrimary,
  },
  userText: {
    color: '#FFFFFF',
  },
  typingCursor: {
    marginTop: 4,
  },
  cursor: {
    width: 8,
    height: 2,
    backgroundColor: colors.gold,
    borderRadius: 1,
  },
  typingIndicator: {
    paddingHorizontal: spacing.md + 36 + spacing.sm,
    paddingBottom: spacing.xs,
  },
  typingText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    marginTop: spacing.md,
    paddingBottom: spacing.md,
  },
  suggestionsTitle: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
    marginLeft: 36 + spacing.sm,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginLeft: 36 + spacing.sm,
  },
  suggestionChip: {
    backgroundColor: 'rgba(0, 102, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.15)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  suggestionChipPressed: {
    backgroundColor: 'rgba(0, 102, 255, 0.15)',
  },
  suggestionText: {
    color: colors.gold,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  inputBar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F5F5F5',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    maxHeight: 100,
    paddingVertical: spacing.sm,
    lineHeight: 22,
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
  sendButtonPressed: {
    backgroundColor: colors.goldDark,
  },
});
