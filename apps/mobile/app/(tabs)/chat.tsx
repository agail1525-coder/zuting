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

const QUICK_SUGGESTIONS = [
  '推荐一条朝圣路线',
  '佛教有哪些圣地？',
  '什么是曹溪三十印？',
  '如何开始修行？',
  '基督教圣地介绍',
  '道教祖庭在哪里？',
];

const BOT_RESPONSES: Record<string, string> = {
  '佛教': '佛教是世界三大宗教之一，起源于古印度。重要圣地包括：\n\n🏛 菩提伽耶 - 释迦牟尼成道之地\n🏛 鹿野苑 - 初转法轮之地\n🏛 拘尸那迦 - 涅槃之地\n🏛 蓝毗尼 - 诞生之地\n🏛 灵鹫山 - 说法之地\n\n您想了解哪个圣地的详细信息呢？',
  '道教': '道教是中国本土宗教，以"道"为最高信仰。主要祖庭包括：\n\n🏛 龙虎山天师府 - 正一派祖庭\n🏛 武当山 - 真武大帝道场\n🏛 青城山 - 天师道发源地\n\n道教讲究"道法自然"，追求天人合一的境界。需要我为您推荐道教朝圣路线吗？',
  '基督教': '基督教是世界最大的宗教，有约24亿信徒。重要圣地包括：\n\n🏛 耶路撒冷圣墓教堂 - 耶稣受难与复活之地\n🏛 伯利恒圣诞教堂 - 耶稣诞生之地\n🏛 梵蒂冈圣伯多禄大殿 - 天主教中心\n\n想了解更多基督教圣地信息吗？',
  '伊斯兰': '伊斯兰教是世界第二大宗教，核心圣地包括：\n\n🏛 麦加禁寺 - 伊斯兰教第一圣地\n🏛 麦地那先知寺 - 穆罕默德安息之地\n🏛 耶路撒冷远寺 - 夜行登霄之地\n\n每年数百万穆斯林前往麦加朝觐，这是伊斯兰五功之一。',
  '圣地': '全球祖庭平台收录了12大信仰的60个圣地，遍布世界各大洲。\n\n每个信仰有5个代表性圣地，包含：\n📍 GPS坐标定位\n🕐 当地时区信息\n📝 详细历史介绍\n\n您可以在"圣地"标签页浏览所有圣地，也可以告诉我您感兴趣的信仰，我为您推荐相关圣地。',
  '印': '曹溪愿命三十印是一套完整的修行体系，分为五系：\n\n🟣 初印系 - 初发心阶段\n🟣 中印系 - 深入修行\n💗 印果印 - 证悟阶段\n🟡 成道印 - 成就阶段\n🟢 归源印 - 圆满回归\n\n共30印，每印包含诗偈、要义、修行法门和大愿。您可以在"修行"标签页查看完整内容。',
  '路线': '为您推荐三条热门朝圣路线：\n\n🗺️ 东亚佛教之旅（14天）\n洛阳白马寺 → 嵩山少林寺 → 九华山 → 普陀山 → 日本奈良东大寺\n\n🗺️ 中东三教圣地之旅（10天）\n耶路撒冷 → 伯利恒 → 麦地那 → 伊斯坦布尔\n\n🗺️ 印度灵性之旅（12天）\n菩提伽耶 → 瓦拉纳西 → 阿姆利则金庙 → 瑞诗凯诗\n\n想了解哪条路线的详细行程？',
  '修行': '修行是一段回归内心的旅程。平台提供多种修行资源：\n\n🪷 曹溪三十印 - 系统修行指南\n📿 每日功课提醒\n📖 各信仰祖训精选\n✍️ 朝圣日记记录\n\n建议从"初印系"开始，循序渐进。您想从哪个方面开始？',
};

const DEFAULT_RESPONSE = '感谢您的提问！作为小鸿AI助手，我可以帮您：\n\n🏛 了解全球圣地和祖庭\n🗺️ 规划朝圣路线\n📿 学习曹溪三十印\n📖 了解各大信仰文化\n\n请告诉我您感兴趣的方向，我来为您详细介绍。';

function getBotResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();
  for (const [keyword, response] of Object.entries(BOT_RESPONSES)) {
    if (msg.includes(keyword.toLowerCase()) || msg.includes(keyword)) {
      return response;
    }
  }
  return DEFAULT_RESPONSE;
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'bot',
  content: '您好！我是小鸿 🏛，您的全球祖庭旅行AI助手。\n\n我可以帮您了解世界各大信仰的圣地、祖庭、祖师和修行法门，也可以为您规划朝圣路线。\n\n请问有什么可以帮您的？',
  timestamp: new Date(),
};

export default function ChatScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingOpacity = useSharedValue(1);

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

  const sendMessage = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isTyping) return;

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

    // Try to call real API with auth token
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
        responseText = data.reply || data.content || data.message || getBotResponse(text);
      } else {
        responseText = getBotResponse(text);
      }
    } catch {
      // Fallback to local responses
      responseText = getBotResponse(text);
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, botMsg]);
      scrollToEnd();

      // Start typewriter effect
      setTimeout(() => {
        simulateTyping(responseText, botMsgId);
      }, 300);
    }, 600);
  }, [inputText, isTyping, scrollToEnd, simulateTyping]);

  const handleSuggestion = useCallback(
    (suggestion: string) => {
      setInputText(suggestion);
      setTimeout(() => {
        const userMsg: Message = {
          id: `user-${Date.now()}`,
          role: 'user',
          content: suggestion,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setIsTyping(true);
        scrollToEnd();

        setTimeout(() => {
          const responseText = getBotResponse(suggestion);
          const botMsgId = `bot-${Date.now()}`;
          const botMsg: Message = {
            id: botMsgId,
            role: 'bot',
            content: '',
            timestamp: new Date(),
            isTyping: true,
          };
          setMessages((prev) => [...prev, botMsg]);
          scrollToEnd();
          setTimeout(() => {
            simulateTyping(responseText, botMsgId);
          }, 300);
        }, 600);

        setInputText('');
      }, 100);
    },
    [scrollToEnd, simulateTyping],
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
          {QUICK_SUGGESTIONS.map((suggestion) => (
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
  }, [messages.length, handleSuggestion]);

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
            登录后即可与小鸿对话{'\n'}了解全球圣地、规划朝圣路线
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
            <Text style={{ color: colors.backgroundDark, fontSize: fontSize.lg, fontWeight: '700' }}>
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
                  ? colors.backgroundDark
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
    backgroundColor: 'rgba(212, 168, 85, 0.03)',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: 100,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(212, 168, 85, 0.02)',
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
    backgroundColor: 'rgba(212, 168, 85, 0.15)',
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: 'rgba(212, 168, 85, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 85, 0.15)',
    borderBottomLeftRadius: borderRadius.sm,
  },
  userBubble: {
    backgroundColor: colors.backgroundCardSolid,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
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
    color: colors.textPrimary,
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
    backgroundColor: 'rgba(212, 168, 85, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 85, 0.2)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  suggestionChipPressed: {
    backgroundColor: 'rgba(212, 168, 85, 0.2)',
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
    borderTopColor: 'rgba(212, 168, 85, 0.1)',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: 'rgba(212, 168, 85, 0.15)',
  },
  sendButtonPressed: {
    backgroundColor: colors.goldDark,
  },
});
