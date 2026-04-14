import React, { useState, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, fontSize, spacing, borderRadius } from '../src/lib/theme';
import { fetchPriceCalendar, PriceCalendarDay, api, Route } from '../src/lib/api';
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

const PRICE_CONFIG = {
  cheap: { bg: '#DCFCE7', text: '#15803D', label: '低价' },
  normal: { bg: '#FEF9C3', text: '#A16207', label: '平价' },
  expensive: { bg: '#FEE2E2', text: '#B91C1C', label: '高价' },
} as const;

type PriceLevel = keyof typeof PRICE_CONFIG;

function buildCalendarGrid(
  year: number,
  month: number,
  days: PriceCalendarDay[],
): Array<PriceCalendarDay | null> {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const totalDays = new Date(year, month, 0).getDate();
  const dayMap: Record<string, PriceCalendarDay> = {};
  for (const d of days) {
    const key = d.date.slice(8, 10);
    dayMap[key] = d;
  }
  const cells: Array<PriceCalendarDay | null> = new Array(firstDay).fill(null);
  for (let i = 1; i <= totalDays; i++) {
    const key = String(i).padStart(2, '0');
    cells.push(dayMap[key] ?? null);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}


export default function PriceCalendarScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<PriceCalendarDay | null>(null);
  const [days, setDays] = useState<PriceCalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [routeId, setRouteId] = useState<string | null>(null);
  const [routeTitle, setRouteTitle] = useState<string>('');

  // Load the first available route on mount
  useEffect(() => {
    api.getFeaturedRoutes(1)
      .then((routes: Route[]) => {
        if (routes.length > 0) {
          setRouteId(routes[0].id);
          setRouteTitle(routes[0].title);
        }
      })
      .catch(() => {
        // No routes available — calendar will show empty
      });
  }, []);

  // Fetch price calendar when routeId or month changes
  useEffect(() => {
    if (!routeId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchPriceCalendar(routeId, year, month)
      .then(res => {
        if (!cancelled) setDays(res.days);
      })
      .catch(() => {
        if (!cancelled) {
          setDays([]);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [routeId, year, month]);

  const cells = useMemo(() => buildCalendarGrid(year, month, days), [year, month, days]);

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  }

  const cheapDays = days.filter(d => d.level === 'cheap');
  const cheapCount = cheapDays.length;
  const cheapMin = cheapDays.length > 0
    ? cheapDays.reduce((min: number, d: PriceCalendarDay) => Math.min(min, d.price), Infinity)
    : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Route Title */}
      {routeTitle ? (
        <Text style={styles.routeTitle} numberOfLines={1}>{routeTitle}</Text>
      ) : null}

      {/* Month Navigator */}
      <View style={styles.nav}>
        <Pressable onPress={prevMonth} style={styles.navBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color={colors.gold} />
        </Pressable>
        <Text style={styles.navTitle}>{year} 年 {month} 月</Text>
        <Pressable onPress={nextMonth} style={styles.navBtn} hitSlop={12}>
          <Ionicons name="chevron-forward" size={22} color={colors.gold} />
        </Pressable>
      </View>

      {/* Summary Bar */}
      {cheapCount > 0 && (
        <Animated.View entering={FadeIn} style={styles.summaryBar}>
          <Ionicons name="flash" size={16} color="#15803D" />
          <Text style={styles.summaryText}>
            本月有 <Text style={styles.summaryHighlight}>{cheapCount}</Text> 天低价，
            最低 <Text style={styles.summaryHighlight}>¥{cheapMin.toLocaleString()}</Text>
          </Text>
        </Animated.View>
      )}

      {/* Weekday Headers */}
      <View style={styles.weekRow}>
        {WEEKDAYS.map(w => (
          <Text key={w} style={[styles.weekDay, (w === '日' || w === '六') && styles.weekDayWknd]}>
            {w}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.gold} style={styles.loader} />
      ) : (
        <View style={styles.grid}>
          {cells.map((cell, idx) => {
            if (!cell) {
              return <View key={`empty-${idx}`} style={styles.cell} />;
            }
            const dayNum = parseInt(cell.date.slice(8, 10), 10);
            const cfg = PRICE_CONFIG[cell.level as PriceLevel];
            const isSelected = selectedDay?.date === cell.date;
            const isToday = cell.date === now.toISOString().slice(0, 10);
            return (
              <Pressable
                key={cell.date}
                style={[
                  styles.cell,
                  cell.available && { backgroundColor: cfg.bg },
                  isSelected && styles.cellSelected,
                  !cell.available && styles.cellUnavailable,
                ]}
                onPress={() => cell.available && setSelectedDay(isSelected ? null : cell)}
              >
                <Text style={[
                  styles.cellDay,
                  cell.available && { color: cfg.text },
                  isToday && styles.cellToday,
                  !cell.available && styles.cellDayMuted,
                ]}>
                  {dayNum}
                </Text>
                {cell.available && (
                  <Text style={[styles.cellPrice, { color: cfg.text }]}>
                    ¥{(cell.price / 1000).toFixed(1)}k
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        {(Object.entries(PRICE_CONFIG) as Array<[PriceLevel, typeof PRICE_CONFIG[PriceLevel]]>).map(([key, cfg]) => (
          <View key={key} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: cfg.bg, borderColor: cfg.text }]} />
            <Text style={[styles.legendText, { color: cfg.text }]}>{cfg.label}</Text>
          </View>
        ))}
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F3F4F6', borderColor: '#D1D5DB' }]} />
          <Text style={[styles.legendText, { color: colors.textMuted }]}>不可订</Text>
        </View>
      </View>

      {/* Selected Day Detail */}
      {selectedDay && (
        <Animated.View entering={FadeIn} style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailDate}>{selectedDay.date}</Text>
            <View style={[styles.detailBadge, { backgroundColor: PRICE_CONFIG[selectedDay.level as PriceLevel].bg }]}>
              <Text style={[styles.detailBadgeText, { color: PRICE_CONFIG[selectedDay.level as PriceLevel].text }]}>
                {PRICE_CONFIG[selectedDay.level as PriceLevel].label}
              </Text>
            </View>
          </View>
          <Text style={styles.detailPrice}>¥ {selectedDay.price.toLocaleString()}</Text>
          <Text style={styles.detailNote}>起/人 · 含税费</Text>
          <Pressable style={styles.bookBtn}>
            <Text style={styles.bookBtnText}>立即预订此日期</Text>
          </Pressable>
        </Animated.View>
      )}

      {error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={20} color="#B91C1C" />
          <Text style={styles.errorText}>暂无价格数据，请稍后重试</Text>
        </View>
      )}

      {!loading && !error && days.length === 0 && (
        <View style={styles.emptyBox}>
          <Ionicons name="calendar-outline" size={36} color={colors.textMuted} />
          <Text style={styles.emptyText}>暂无价格数据</Text>
          <Text style={styles.emptySubtext}>该路线本月尚未发布价格</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl },
  routeTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundCardSolid,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  summaryText: { fontSize: fontSize.sm, color: '#166534' },
  summaryHighlight: { fontWeight: '700' },
  weekRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: 4,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  weekDayWknd: { color: '#EF4444' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: 3,
  },
  cell: {
    width: `${(100 - 1.8) / 7}%`,
    aspectRatio: 0.85,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  cellSelected: {
    borderWidth: 2,
    borderColor: '#3264ff',
  },
  cellUnavailable: {
    backgroundColor: '#F9FAFB',
  },
  cellDay: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cellToday: {
    textDecorationLine: 'underline',
    fontWeight: '800',
  },
  cellDayMuted: {
    color: colors.textMuted,
  },
  cellPrice: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 1,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
  },
  legendText: { fontSize: fontSize.xs, fontWeight: '600' },
  loader: { marginVertical: spacing.xxl },
  detailCard: {
    backgroundColor: colors.backgroundCardSolid,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  detailDate: { fontSize: fontSize.md, color: colors.textSecondary },
  detailBadge: { borderRadius: borderRadius.full, paddingHorizontal: 10, paddingVertical: 3 },
  detailBadgeText: { fontSize: fontSize.xs, fontWeight: '700' },
  detailPrice: { fontSize: 32, fontWeight: '800', color: colors.textPrimary },
  detailNote: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.md },
  bookBtn: {
    backgroundColor: '#3264ff',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  bookBtnText: { color: '#FFFFFF', fontSize: fontSize.lg, fontWeight: '700' },
  errorBox: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: '#FEF2F2',
    borderRadius: borderRadius.md,
  },
  errorText: { color: '#B91C1C', fontSize: fontSize.sm, textAlign: 'center' },
  emptyBox: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: { color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: '600' },
  emptySubtext: { color: colors.textMuted, fontSize: fontSize.sm },
});
