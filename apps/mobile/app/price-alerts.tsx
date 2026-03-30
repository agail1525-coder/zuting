import React, { useState, useEffect, useCallback } from 'react';
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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, fontSize, spacing, borderRadius } from '../src/lib/theme';
import { fetchPriceAlerts, createPriceAlert, deletePriceAlert, PriceAlert, api, Route } from '../src/lib/api';

interface PopularRoute {
  id: string;
  title: string;
  price: number;
}

interface AlertCardProps {
  alert: PriceAlert;
  onDelete: (id: string) => void;
}

function AlertCard({ alert, onDelete }: AlertCardProps) {
  const diff = alert.currentPrice - alert.targetPrice;
  const pct = Math.round(Math.abs(diff) / alert.currentPrice * 100);

  return (
    <View style={[styles.alertCard, alert.isTriggered && styles.alertCardTriggered]}>
      {alert.isTriggered && (
        <View style={styles.triggeredBanner}>
          <Ionicons name="checkmark-circle" size={14} color="#15803D" />
          <Text style={styles.triggeredText}>
            已触发 · {new Date(alert.triggeredAt!).toLocaleDateString('zh-CN')}
          </Text>
        </View>
      )}
      <Text style={styles.alertRouteTitle} numberOfLines={2}>{alert.routeTitle}</Text>
      <View style={styles.alertPriceRow}>
        <View>
          <Text style={styles.alertLabel}>目标价</Text>
          <Text style={styles.alertTarget}>¥{alert.targetPrice.toLocaleString()}</Text>
        </View>
        <View style={styles.alertArrow}>
          <Ionicons name="arrow-forward" size={18} color={colors.textMuted} />
        </View>
        <View>
          <Text style={styles.alertLabel}>当前价</Text>
          <Text style={[styles.alertCurrent, diff <= 0 && styles.alertCurrentGreen]}>
            ¥{alert.currentPrice.toLocaleString()}
          </Text>
        </View>
        <View style={styles.alertDiffBox}>
          {diff > 0 ? (
            <>
              <Ionicons name="arrow-up" size={12} color="#B91C1C" />
              <Text style={styles.alertDiffRed}>高 {pct}%</Text>
            </>
          ) : (
            <>
              <Ionicons name="arrow-down" size={12} color="#15803D" />
              <Text style={styles.alertDiffGreen}>低 {pct}%</Text>
            </>
          )}
        </View>
      </View>
      <View style={styles.alertFooter}>
        <Text style={styles.alertDate}>
          创建于 {new Date(alert.createdAt).toLocaleDateString('zh-CN')}
        </Text>
        <Pressable
          onPress={() => onDelete(alert.id)}
          style={styles.deleteBtn}
          hitSlop={8}
        >
          <Ionicons name="trash-outline" size={16} color={colors.error} />
          <Text style={styles.deleteBtnText}>删除</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function PriceAlertsScreen() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [popularRoutes, setPopularRoutes] = useState<PopularRoute[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [targetPrice, setTargetPrice] = useState('');

  // Load popular routes for the create form
  useEffect(() => {
    api.getFeaturedRoutes(4)
      .then((routes: Route[]) => {
        const mapped = routes.map(r => ({ id: r.id, title: r.title, price: r.priceFrom }));
        setPopularRoutes(mapped);
        if (mapped.length > 0 && !selectedRouteId) {
          setSelectedRouteId(mapped[0].id);
        }
      })
      .catch(() => {
        // No routes available — form will show empty
      });
  }, []);

  const loadAlerts = useCallback(() => {
    setLoading(true);
    fetchPriceAlerts()
      .then(data => setAlerts(data))
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  function handleCreate() {
    if (!selectedRouteId) {
      Alert.alert('请选择一条路线');
      return;
    }
    const price = parseFloat(targetPrice);
    if (!targetPrice || isNaN(price) || price <= 0) {
      Alert.alert('请输入有效的目标价格');
      return;
    }
    setCreating(true);
    createPriceAlert({ routeId: selectedRouteId, targetPrice: price })
      .then(() => {
        setShowForm(false);
        setTargetPrice('');
        loadAlerts();
      })
      .catch(() => Alert.alert('创建失败', '请稍后重试'))
      .finally(() => setCreating(false));
  }

  function handleDelete(id: string) {
    Alert.alert('确认删除', '删除后将不再收到此路线的价格提醒', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          deletePriceAlert(id)
            .then(() => loadAlerts())
            .catch(() => Alert.alert('删除失败', '请稍后重试'));
        },
      },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={styles.kbWrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>价格提醒</Text>
            <Text style={styles.headerSubtitle}>降价时即时推送，绝不错过好价</Text>
          </View>
          <Pressable
            style={styles.addBtn}
            onPress={() => setShowForm(v => !v)}
          >
            <Ionicons name={showForm ? 'close' : 'add'} size={22} color="#FFFFFF" />
            <Text style={styles.addBtnText}>{showForm ? '关闭' : '新建'}</Text>
          </Pressable>
        </View>

        {/* Create Form */}
        {showForm && (
          <Animated.View entering={FadeInDown.duration(250)} style={styles.form}>
            <Text style={styles.formTitle}>新建价格提醒</Text>

            <Text style={styles.formLabel}>选择路线</Text>
            <View style={styles.routeList}>
              {popularRoutes.map(r => (
                <Pressable
                  key={r.id}
                  style={[styles.routeItem, selectedRouteId === r.id && styles.routeItemSelected]}
                  onPress={() => setSelectedRouteId(r.id)}
                >
                  <View style={styles.routeItemInner}>
                    <Text
                      style={[styles.routeItemTitle, selectedRouteId === r.id && styles.routeItemTitleSelected]}
                      numberOfLines={1}
                    >
                      {r.title}
                    </Text>
                    <Text style={[styles.routeItemPrice, selectedRouteId === r.id && { color: '#0052CC' }]}>
                      当前 ¥{r.price.toLocaleString()}
                    </Text>
                  </View>
                  {selectedRouteId === r.id && (
                    <Ionicons name="checkmark-circle" size={20} color="#0066FF" />
                  )}
                </Pressable>
              ))}
            </View>

            <Text style={styles.formLabel}>目标价格 (¥)</Text>
            <TextInput
              style={styles.input}
              value={targetPrice}
              onChangeText={setTargetPrice}
              keyboardType="numeric"
              placeholder="例如：4000"
              placeholderTextColor={colors.textMuted}
            />
            <Text style={styles.formHint}>
              当价格降至或低于此金额时，您将收到推送通知
            </Text>

            <Pressable
              style={[styles.submitBtn, creating && styles.submitBtnDisabled]}
              onPress={handleCreate}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>创建提醒</Text>
              )}
            </Pressable>
          </Animated.View>
        )}

        {/* Alert List */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.gold} style={styles.loader} />
        ) : alerts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>暂无价格提醒</Text>
            <Text style={styles.emptySubtitle}>点击「新建」设置降价通知</Text>
          </View>
        ) : (
          <View style={styles.list}>
            <Text style={styles.listHeader}>我的提醒 ({alerts.length})</Text>
            {alerts.map(a => (
              <AlertCard key={a.id} alert={a} onDelete={handleDelete} />
            ))}
          </View>
        )}

        {/* Tip */}
        <View style={styles.tip}>
          <Ionicons name="information-circle-outline" size={16} color="#0066FF" />
          <Text style={styles.tipText}>提醒最多同时设置 5 条，触发后自动保留 7 天</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kbWrapper: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { paddingBottom: spacing.xxl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.textPrimary },
  headerSubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0066FF',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  addBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: fontSize.md },
  form: {
    backgroundColor: colors.backgroundCardSolid,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: spacing.md,
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  formLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textSecondary, marginBottom: 6, marginTop: spacing.sm },
  routeList: { gap: spacing.xs },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  routeItemSelected: {
    borderColor: '#0066FF',
    backgroundColor: '#EFF6FF',
  },
  routeItemInner: { flex: 1 },
  routeItemTitle: { fontSize: fontSize.sm, fontWeight: '500', color: colors.textPrimary },
  routeItemTitleSelected: { color: '#0066FF', fontWeight: '600' },
  routeItemPrice: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  formHint: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4 },
  submitBtn: {
    backgroundColor: '#0066FF',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#FFFFFF', fontSize: fontSize.lg, fontWeight: '700' },
  loader: { marginVertical: spacing.xxl },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.textSecondary, marginTop: spacing.md },
  emptySubtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 4 },
  list: { paddingHorizontal: spacing.md, gap: spacing.sm },
  listHeader: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textMuted, marginBottom: spacing.xs },
  alertCard: {
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  alertCardTriggered: {
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
  },
  triggeredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.xs,
  },
  triggeredText: { fontSize: fontSize.xs, color: '#15803D', fontWeight: '600' },
  alertRouteTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  alertPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  alertLabel: { fontSize: fontSize.xs, color: colors.textMuted, marginBottom: 2 },
  alertTarget: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary },
  alertArrow: { marginTop: spacing.sm },
  alertCurrent: { fontSize: fontSize.lg, fontWeight: '700', color: '#EF4444' },
  alertCurrentGreen: { color: '#15803D' },
  alertDiffBox: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: spacing.sm },
  alertDiffRed: { fontSize: fontSize.xs, color: '#B91C1C', fontWeight: '600' },
  alertDiffGreen: { fontSize: fontSize.xs, color: '#15803D', fontWeight: '600' },
  alertFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: spacing.sm,
  },
  alertDate: { fontSize: fontSize.xs, color: colors.textMuted },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deleteBtnText: { fontSize: fontSize.sm, color: colors.error, fontWeight: '600' },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: '#EFF6FF',
    borderRadius: borderRadius.md,
  },
  tipText: { flex: 1, fontSize: fontSize.xs, color: '#1D4ED8' },
});
