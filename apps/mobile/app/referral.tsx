import React, { useState, useCallback, useMemo } from 'react';
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
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
const GOLD = '#F59E0B';

export default function ReferralScreen() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState<InviteCodeData | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [team, setTeam] = useState<ReferralTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  // G4: Enhanced stats computed from data
  const enhancedStats = useMemo(() => ({
    totalReferrals: stats?.totalInvited ?? 0,
    commissionEarned: stats?.totalEarnings ?? 0,
    pendingRewards: stats?.pendingEarnings ?? 0,
    level1: stats?.level1Count ?? 0,
    level2: stats?.level2Count ?? 0,
  }), [stats]);

  // G4: Client-side search filtering for team
  const filteredTeam = useMemo(() => {
    if (!searchQuery.trim()) return team;
    const q = searchQuery.trim().toLowerCase();
    return team.filter(m => m.nickname.toLowerCase().includes(q));
  }, [team, searchQuery]);

  const isSearchActive = searchQuery.trim().length > 0;

  const handleCopy = () => {
    if (!inviteCode) return;
    Clipboard.setString(inviteCode.code);
    Alert.alert('已复制', `邀请码 ${inviteCode.code} 已复制到剪贴板`);
  };

  const handleShare = async () => {
    if (!inviteCode) return;
    await Share.share({
      message: `加入佳绩之旅，探索世界圣地！使用我的邀请码 ${inviteCode.code} 注册，双方均可获得积分奖励。${inviteCode.link}`,
      url: inviteCode.link,
    });
  };

  const handleShareWechat = () => {
    if (!inviteCode) return;
    Clipboard.setString(`我的JOINUS邀请码：${inviteCode.code}，复制后打开APP注册即可获得积分奖励！`);
    Alert.alert('已复制', '分享文案已复制，可粘贴到微信发送给好友');
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

        {/* G4: Quick share buttons */}
        <View style={styles.shareRow}>
          <Pressable style={styles.shareBtn} onPress={handleShare}>
            <Ionicons name="share-social" size={18} color="#FFFFFF" />
            <Text style={styles.shareBtnText}>系统分享</Text>
          </Pressable>
          <Pressable style={[styles.shareBtn, styles.shareBtnAlt]} onPress={handleShareWechat}>
            <Ionicons name="chatbubble-ellipses" size={18} color="#FFFFFF" />
            <Text style={styles.shareBtnText}>复制文案</Text>
          </Pressable>
        </View>
      </View>

      {/* G4: Enhanced Stats Card */}
      <View style={styles.statsCard}>
        <StatsItem label="总邀请" value={enhancedStats.totalReferrals} color={PRIMARY} icon="people" />
        <StatsDivider />
        <StatsItem label="累计收益" value={enhancedStats.commissionEarned} color={GREEN} icon="wallet" />
        <StatsDivider />
        <StatsItem label="待结算" value={enhancedStats.pendingRewards} color={GOLD} icon="time" />
      </View>

      {/* G4: Level breakdown */}
      <View style={styles.levelRow}>
        <View style={[styles.levelCard, { borderLeftColor: GREEN }]}>
          <Text style={styles.levelValue}>{enhancedStats.level1}</Text>
          <Text style={styles.levelLabel}>一级好友</Text>
        </View>
        <View style={[styles.levelCard, { borderLeftColor: GOLD }]}>
          <Text style={styles.levelValue}>{enhancedStats.level2}</Text>
          <Text style={styles.levelLabel}>二级好友</Text>
        </View>
      </View>

      {/* Team List */}
      <View style={styles.teamSection}>
        <Text style={styles.sectionTitle}>我的团队 ({team.length} 人)</Text>

        {/* G4: Search for team members */}
        {team.length > 0 && (
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="搜索团队成员..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={colors.textMuted} />
              </Pressable>
            )}
          </View>
        )}

        {team.length === 0 ? (
          /* G4: Data-empty state */
          <View style={styles.emptyCard}>
            <Ionicons name="people-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>还没有邀请到好友</Text>
            <Text style={styles.emptyHint}>分享邀请码，邀请好友加入</Text>
          </View>
        ) : isSearchActive && filteredTeam.length === 0 ? (
          /* G4: Search-empty state */
          <View style={styles.emptyCard}>
            <Ionicons name="search" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>未找到匹配的成员</Text>
            <Pressable style={styles.clearSearchBtn} onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearchText}>清除搜索</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={filteredTeam}
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

      {/* G4: Bottom CTA */}
      <View style={styles.bottomCta}>
        <Text style={styles.bottomCtaText}>邀请更多好友，赚取更多积分</Text>
        <Pressable style={styles.bottomCtaBtn} onPress={handleShare}>
          <Ionicons name="share-social" size={18} color="#FFFFFF" />
          <Text style={styles.bottomCtaBtnText}>立即邀请好友</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function StatsItem({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <View style={styles.statsItem}>
      <Ionicons name={icon as any} size={16} color={color} style={{ marginBottom: 2 }} />
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

  // G4: Quick share row
  shareRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  shareBtnAlt: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.25)',
  },
  shareBtnText: { color: '#FFFFFF', fontSize: fontSize.md, fontWeight: '600' },

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

  // G4: Level breakdown row
  levelRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  levelCard: {
    flex: 1,
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  levelValue: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  levelLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },

  // G4: Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    padding: 0,
  },

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

  // G4: Clear search button
  clearSearchBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: `${PRIMARY}15`,
  },
  clearSearchText: {
    color: PRIMARY,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },

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

  // G4: Bottom CTA
  bottomCta: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  bottomCtaText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  bottomCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: PRIMARY,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.full,
  },
  bottomCtaBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
});
