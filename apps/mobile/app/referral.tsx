import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, borderRadius } from '../src/lib/theme';
import {
  fetchMyInviteCode,
  fetchReferralStats,
  fetchMyTeam,
  type InviteCodeData,
  type ReferralStats,
  type ReferralTeamMember,
} from '../src/lib/api';

const PRIMARY = '#0066FF';
const GREEN = '#22C55E';

export default function ReferralScreen() {
  const [inviteCode, setInviteCode] = useState<InviteCodeData | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [team, setTeam] = useState<ReferralTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [code, st, tm] = await Promise.allSettled([
        fetchMyInviteCode(),
        fetchReferralStats(),
        fetchMyTeam(1),
      ]);
      if (code.status === 'fulfilled') setInviteCode(code.value);
      if (st.status === 'fulfilled') setStats(st.value);
      if (tm.status === 'fulfilled') setTeam(tm.value.items);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => { void load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); void load(); };

  const handleCopy = () => {
    if (!inviteCode) return;
    // Use Clipboard from React Native (available in RN 0.72+)
    Clipboard.setString(inviteCode.code);
    Alert.alert('已复制', `邀请码 ${inviteCode.code} 已复制到剪贴板`);
  };

  const handleShare = async () => {
    if (!inviteCode) return;
    await Share.share({
      message: `加入祖庭旅行平台，探索世界圣地！使用我的邀请码 ${inviteCode.code} 注册，双方均可获得积分奖励。${inviteCode.link}`,
      url: inviteCode.link,
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Invite Code Card */}
      <View style={styles.codeCard}>
        <Text style={styles.codeCardTitle}>我的邀请码</Text>
        <View style={styles.codeRow}>
          <Text style={styles.codeText}>{inviteCode?.code ?? '------'}</Text>
          <Pressable style={styles.copyBtn} onPress={handleCopy}>
            <Ionicons name="copy-outline" size={18} color="#FFFFFF" />
            <Text style={styles.copyBtnText}>复制</Text>
          </Pressable>
        </View>
        <Text style={styles.codeUsed}>已被使用 {inviteCode?.usedCount ?? 0} 次</Text>
        <Pressable style={styles.shareBtn} onPress={handleShare}>
          <Ionicons name="share-social" size={20} color="#FFFFFF" />
          <Text style={styles.shareBtnText}>分享邀请链接</Text>
        </Pressable>
      </View>

      {/* Stats */}
      <View style={styles.statsCard}>
        <StatsItem label="总邀请人数" value={stats?.totalInvited ?? 0} color={PRIMARY} />
        <StatsDivider />
        <StatsItem label="一级好友" value={stats?.level1Count ?? 0} color={GREEN} />
        <StatsDivider />
        <StatsItem label="二级好友" value={stats?.level2Count ?? 0} color="#F59E0B" />
        <StatsDivider />
        <StatsItem label="累计收益(积分)" value={stats?.totalEarnings ?? 0} color="#EC4899" />
      </View>

      {stats && stats.pendingEarnings > 0 && (
        <View style={styles.pendingBanner}>
          <Ionicons name="time" size={16} color={PRIMARY} />
          <Text style={styles.pendingText}>待结算收益: {stats.pendingEarnings} 积分</Text>
        </View>
      )}

      {/* Team List */}
      <View style={styles.teamSection}>
        <Text style={styles.sectionTitle}>我的团队 ({team.length} 人)</Text>
        {team.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="people-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>还没有邀请到好友</Text>
            <Text style={styles.emptyHint}>分享邀请码，邀请好友加入</Text>
          </View>
        ) : (
          <FlatList
            data={team}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.teamItem}>
                <View style={styles.teamAvatar}>
                  <Ionicons name="person" size={20} color={colors.textMuted} />
                </View>
                <View style={styles.teamInfo}>
                  <Text style={styles.teamNickname}>{item.nickname}</Text>
                  <Text style={styles.teamMeta}>
                    {item.level === 1 ? '一级好友' : '二级好友'} · {new Date(item.joinedAt).toLocaleDateString('zh-CN')}
                  </Text>
                </View>
                <View style={styles.teamContrib}>
                  <Text style={styles.teamContribNum}>{item.contribution}</Text>
                  <Text style={styles.teamContribLabel}>积分贡献</Text>
                </View>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>

      {/* Rules */}
      <View style={styles.rulesCard}>
        <Text style={styles.rulesTitle}>分销规则</Text>
        <Text style={styles.rulesText}>• 邀请好友注册，双方各获 50 积分</Text>
        <Text style={styles.rulesText}>• 好友成功预订行程，您获得订单金额 2% 的积分奖励</Text>
        <Text style={styles.rulesText}>• 二级好友下单，您获得订单金额 1% 的积分奖励</Text>
        <Text style={styles.rulesText}>• 积分可在积分商城兑换礼品或优惠券</Text>
      </View>
    </ScrollView>
  );
}

function StatsItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.statsItem}>
      <Text style={[styles.statsValue, { color }]}>{value.toLocaleString()}</Text>
      <Text style={styles.statsLabel}>{label}</Text>
    </View>
  );
}

function StatsDivider() {
  return <View style={styles.statsDivider} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  codeCard: {
    backgroundColor: PRIMARY,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  codeCardTitle: { color: 'rgba(255,255,255,0.8)', fontSize: fontSize.sm, marginBottom: spacing.sm },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  codeText: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', letterSpacing: 4, flex: 1 },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  copyBtnText: { color: '#FFFFFF', fontSize: fontSize.sm, fontWeight: '600' },
  codeUsed: { color: 'rgba(255,255,255,0.7)', fontSize: fontSize.sm, marginBottom: spacing.md },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  shareBtnText: { color: '#FFFFFF', fontSize: fontSize.lg, fontWeight: '700' },

  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  statsItem: { flex: 1, alignItems: 'center' },
  statsValue: { fontSize: fontSize.xl, fontWeight: '800' },
  statsLabel: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
  statsDivider: { width: 1, backgroundColor: '#E5E7EB', alignSelf: 'stretch' },

  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: `${PRIMARY}12`,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  pendingText: { color: PRIMARY, fontSize: fontSize.md, fontWeight: '600' },

  teamSection: { gap: spacing.sm },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary },
  emptyCard: {
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyText: { fontSize: fontSize.lg, color: colors.textSecondary, fontWeight: '600' },
  emptyHint: { fontSize: fontSize.sm, color: colors.textMuted },

  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    gap: spacing.md,
  },
  teamAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamInfo: { flex: 1 },
  teamNickname: { fontSize: fontSize.md, fontWeight: '600', color: colors.textPrimary },
  teamMeta: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  teamContrib: { alignItems: 'center' },
  teamContribNum: { fontSize: fontSize.lg, fontWeight: '700', color: GREEN },
  teamContribLabel: { fontSize: fontSize.xs, color: colors.textMuted },

  separator: { height: 1, backgroundColor: '#F3F4F6' },

  rulesCard: {
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.sm,
  },
  rulesTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
  rulesText: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20 },
});
