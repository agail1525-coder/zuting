import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Religion } from '../lib/api';
import {
  colors,
  fontSize,
  borderRadius,
  spacing,
  religionEmojis,
  religionGradients,
} from '../lib/theme';

interface ReligionCardProps {
  religion: Religion;
}

export function ReligionCard({ religion }: ReligionCardProps) {
  const router = useRouter();
  const emoji = religionEmojis[religion.slug] || '🙏';
  const gradient = religionGradients[religion.slug] || ['#6366F1', '#4F46E5'];

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push({ pathname: '/religions/[slug]', params: { slug: religion.slug } })}
    >
      <View style={[styles.iconContainer, { backgroundColor: gradient[0] }]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={styles.nameZh} numberOfLines={1}>
        {religion.name}
      </Text>
      <Text style={styles.nameEn} numberOfLines={1}>
        {religion.nameEn}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    margin: spacing.xs,
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  nameZh: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  nameEn: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
});
