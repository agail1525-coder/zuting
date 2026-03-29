import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, borderRadius } from '../src/lib/theme';
import { useAuth } from '../src/lib/auth-context';
import { API_URL, getAccessToken } from '../src/lib/auth';

interface UserProfile {
  displayName: string | null;
  bio: string | null;
  location: string | null;
  avatar: string | null;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoadingProfile(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError('请先登录');
        setLoadingProfile(false);
        return;
      }
      const res = await fetch(`${API_URL}/users/me/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error(`获取资料失败: ${res.status}`);
      }
      const data = await res.json();
      const p: UserProfile = data.profile ?? data;
      setProfile(p);
      setDisplayName(p.displayName ?? user?.nickname ?? '');
      setBio(p.bio ?? '');
      setLocation(p.location ?? '');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '获取资料失败';
      setError(msg);
    } finally {
      setLoadingProfile(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError('请先登录');
        setSaving(false);
        return;
      }

      const body: Record<string, string> = {};
      if (displayName.trim()) body.displayName = displayName.trim();
      if (bio.trim()) body.bio = bio.trim();
      if (location.trim()) body.location = location.trim();

      const res = await fetch(`${API_URL}/users/me/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(errBody || `保存失败: ${res.status}`);
      }

      await refreshUser();
      Alert.alert('成功', '资料已更新', [
        { text: '好的', onPress: () => router.back() },
      ]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '保存失败';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  const initials = (user?.nickname ?? '?')
    .split('')
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (loadingProfile) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={styles.loadingText}>加载资料中...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.avatarHint}>头像暂不支持修改</Text>
        </View>

        {/* Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Read-only user fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>账户信息</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>昵称</Text>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyValue}>
                {user?.nickname ?? '-'}
              </Text>
              <Ionicons name="lock-closed" size={14} color={colors.textMuted} />
            </View>
          </View>

          {user?.email != null && (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>邮箱</Text>
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyValue}>{user.email}</Text>
                <Ionicons name="lock-closed" size={14} color={colors.textMuted} />
              </View>
            </View>
          )}

          {user?.phone != null && (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>手机号</Text>
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyValue}>{user.phone}</Text>
                <Ionicons name="lock-closed" size={14} color={colors.textMuted} />
              </View>
            </View>
          )}
        </View>

        {/* Editable profile fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>个人资料</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>显示名称</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="输入您的显示名称"
              placeholderTextColor={colors.textMuted}
              maxLength={50}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>所在地</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="如：上海、东京、纽约"
              placeholderTextColor={colors.textMuted}
              maxLength={100}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>个人简介</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="简单介绍一下自己..."
              placeholderTextColor={colors.textMuted}
              maxLength={500}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{bio.length}/500</Text>
          </View>
        </View>

        {/* Save Button */}
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            saving && styles.saveButtonDisabled,
            pressed && !saving && styles.saveButtonPressed,
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>保存修改</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginTop: spacing.md,
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: fontSize.xxl,
    fontWeight: '700',
  },
  avatarHint: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },

  // Error
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.md,
    flex: 1,
  },

  // Sections
  section: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },

  // Fields
  fieldGroup: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: '500',
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  readOnlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundCardSolid,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    opacity: 0.7,
  },
  readOnlyValue: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    flex: 1,
  },
  input: {
    backgroundColor: colors.backgroundCardSolid,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontSize: fontSize.lg,
  },
  textArea: {
    minHeight: 100,
    paddingTop: spacing.md,
  },
  charCount: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'right',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
  },

  // Save Button
  saveButton: {
    backgroundColor: colors.gold,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonPressed: {
    opacity: 0.85,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
});
