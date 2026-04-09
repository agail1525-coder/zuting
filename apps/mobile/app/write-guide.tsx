import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createGuide, publishGuide } from '../src/lib/api';
import { colors, fontSize, spacing, borderRadius } from '../src/lib/theme';

export default function WriteGuideScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const tags = tagsInput
    .split(/[,，\s]+/)
    .map(t => t.trim())
    .filter(t => t.length > 0);

  const validateFields = () => {
    if (!title.trim()) {
      Alert.alert('提示', '请填写游记标题');
      return false;
    }
    if (!content.trim()) {
      Alert.alert('提示', '请填写游记内容');
      return false;
    }
    return true;
  };

  const handleSaveDraft = async () => {
    if (!validateFields()) return;
    setSaving(true);
    try {
      await createGuide({ title: title.trim(), content: content.trim(), tags });
      Alert.alert('已保存', '游记草稿已保存', [
        { text: '确定', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('错误', '保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!validateFields()) return;
    setPublishing(true);
    try {
      const guide = await createGuide({ title: title.trim(), content: content.trim(), tags });
      await publishGuide(guide.id);
      Alert.alert('发布成功', '游记已发布到社区', [
        { text: '查看', onPress: () => router.replace(`/community/guide/${guide.id}` as never) },
        { text: '返回', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('错误', '发布失败，请稍后重试');
    } finally {
      setPublishing(false);
    }
  };

  const busy = saving || publishing;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton} disabled={busy}>
            <Ionicons name="close" size={22} color="#111827" />
          </Pressable>
          <Text style={styles.headerTitle}>写游记</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.formPad}>
            {/* Title */}
            <Text style={styles.fieldLabel}>游记标题 *</Text>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="起一个吸引人的标题..."
              placeholderTextColor="#9CA3AF"
              maxLength={60}
              editable={!busy}
            />
            <Text style={styles.charCount}>{title.length}/60</Text>

            {/* Content */}
            <Text style={styles.fieldLabel}>游记正文 *</Text>
            <TextInput
              style={styles.contentInput}
              value={content}
              onChangeText={setContent}
              placeholder="分享你的文化之旅旅程、心得体会...&#10;&#10;可以描述沿途的风景、感悟到的禅意、遇到的人和事..."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              editable={!busy}
            />
            <Text style={styles.charCount}>{content.length} 字</Text>

            {/* Tags */}
            <Text style={styles.fieldLabel}>标签</Text>
            <Text style={styles.fieldHint}>用逗号或空格分隔，例如：禅宗,南华寺,文化之旅</Text>
            <TextInput
              style={styles.tagInput}
              value={tagsInput}
              onChangeText={setTagsInput}
              placeholder="禅宗, 文化之旅, 圣地探访..."
              placeholderTextColor="#9CA3AF"
              editable={!busy}
            />

            {/* Tag Preview */}
            {tags.length > 0 && (
              <View style={styles.tagPreview}>
                {tags.map(tag => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Tips */}
            <View style={styles.tipsBox}>
              <Ionicons name="information-circle-outline" size={16} color={colors.gold} />
              <View style={{ flex: 1 }}>
                <Text style={styles.tipsTitle}>写作建议</Text>
                <Text style={styles.tipsText}>
                  • 描述独特的文化之旅体验和感悟{'\n'}
                  • 分享实用的旅行信息和建议{'\n'}
                  • 加入标签让更多文化旅行者发现你的游记
                </Text>
              </View>
            </View>

            <View style={{ height: 32 }} />
          </View>
        </ScrollView>

        {/* Bottom Action Buttons */}
        <View style={styles.actionBar}>
          <Pressable
            style={[styles.draftBtn, busy && styles.btnDisabled]}
            onPress={handleSaveDraft}
            disabled={busy}
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.gold} />
            ) : (
              <>
                <Ionicons name="save-outline" size={16} color={colors.gold} />
                <Text style={styles.draftBtnText}>保存草稿</Text>
              </>
            )}
          </Pressable>
          <Pressable
            style={[styles.publishBtn, busy && styles.btnDisabled]}
            onPress={handlePublish}
            disabled={busy}
          >
            {publishing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="paper-plane-outline" size={16} color="#ffffff" />
                <Text style={styles.publishBtnText}>发布游记</Text>
              </>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: { width: 36, height: 36, justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: fontSize.xl, fontWeight: '700', color: '#111827', textAlign: 'center' },
  scroll: { flex: 1 },
  formPad: { padding: spacing.md },
  fieldLabel: { fontSize: fontSize.md, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: spacing.md },
  fieldHint: { fontSize: fontSize.sm, color: '#9CA3AF', marginBottom: 6 },
  titleInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSize.lg,
    color: '#111827',
    backgroundColor: '#FAFAFA',
  },
  charCount: { fontSize: fontSize.xs, color: '#9CA3AF', textAlign: 'right', marginTop: 4 },
  contentInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: '#111827',
    backgroundColor: '#FAFAFA',
    minHeight: 240,
    lineHeight: 24,
  },
  tagInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSize.md,
    color: '#111827',
    backgroundColor: '#FAFAFA',
  },
  tagPreview: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm },
  tag: {
    backgroundColor: 'rgba(0,102,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  tagText: { fontSize: fontSize.sm, color: colors.gold },
  tipsBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: 'rgba(0,102,255,0.04)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,102,255,0.1)',
  },
  tipsTitle: { fontSize: fontSize.sm, fontWeight: '600', color: colors.gold, marginBottom: 4 },
  tipsText: { fontSize: fontSize.sm, color: '#6b7280', lineHeight: 20 },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: spacing.md,
  },
  draftBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.gold,
    backgroundColor: '#ffffff',
  },
  draftBtnText: { fontSize: fontSize.md, color: colors.gold, fontWeight: '600' },
  publishBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gold,
  },
  publishBtnText: { fontSize: fontSize.md, color: '#ffffff', fontWeight: '700' },
  btnDisabled: { opacity: 0.5 },
});
