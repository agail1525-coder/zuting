import React, { useEffect, useState, useMemo } from 'react';
import {
  FlatList, Linking, Platform, Pressable, StyleSheet, Text, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api, HolySite, Religion } from '../../src/lib/api';
import { FilterChips } from '../../src/components/FilterChips';
import { LoadingView } from '../../src/components/LoadingView';
import { colors, spacing } from '../../src/lib/theme';

function openInMaps(lat: number, lng: number, label: string) {
  const encoded = encodeURIComponent(label);
  const url = Platform.select({
    ios: `maps:0,0?q=${encoded}&ll=${lat},${lng}`,
    default: `geo:${lat},${lng}?q=${lat},${lng}(${encoded})`,
  });
  Linking.openURL(url).catch(() => {
    Linking.openURL(`https://www.google.com/maps?q=${lat},${lng}`);
  });
}

interface RegionGroup {
  region: string;
  sites: HolySite[];
}

export default function MapScreen() {
  const router = useRouter();
  const [sites, setSites] = useState<HolySite[]>([]);
  const [religions, setReligions] = useState<Religion[]>([]);
  const [selectedReligion, setSelectedReligion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getHolySites(),
      api.getReligions(),
    ]).then(([s, r]) => {
      setSites(s);
      setReligions(r);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!selectedReligion) return sites;
    return sites.filter(s => (s as any).religionId === selectedReligion);
  }, [sites, selectedReligion]);

  const regions = useMemo<RegionGroup[]>(() => {
    const map = new Map<string, HolySite[]>();
    for (const s of filtered) {
      const region = s.country || 'Unknown';
      if (!map.has(region)) map.set(region, []);
      map.get(region)!.push(s);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .map(([region, regionSites]) => ({ region, sites: regionSites }));
  }, [filtered]);

  const chips = religions.map(r => ({ id: r.id, label: (r as any).name ?? r.nameZh }));

  if (loading) return <LoadingView />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>圣地地图</Text>
          <Text style={styles.subtitle}>{filtered.length} 个圣地 · {regions.length} 个国家/地区</Text>
        </View>
      </View>

      <FilterChips chips={chips} selected={selectedReligion} onSelect={setSelectedReligion} />

      <FlatList
        data={regions}
        keyExtractor={item => item.region}
        contentContainerStyle={styles.list}
        renderItem={({ item: group }) => (
          <View style={styles.regionSection}>
            <View style={styles.regionHeader}>
              <Ionicons name="globe-outline" size={16} color={colors.gold} />
              <Text style={styles.regionName}>{group.region}</Text>
              <Text style={styles.regionCount}>{group.sites.length}</Text>
            </View>
            {group.sites.map(site => {
              const name = (site as any).name ?? site.nameZh;
              return (
                <View key={site.id} style={styles.siteRow}>
                  <Pressable
                    style={styles.siteInfo}
                    onPress={() => router.push({ pathname: '/holy-sites/[id]', params: { id: site.id } })}
                  >
                    <Text style={styles.siteName} numberOfLines={1}>{name}</Text>
                    <Text style={styles.siteCity}>{site.city || ''}</Text>
                  </Pressable>
                  {site.latitude && site.longitude && (
                    <Pressable
                      style={styles.mapBtn}
                      onPress={() => openInMaps(site.latitude!, site.longitude!, name)}
                    >
                      <Ionicons name="navigate-outline" size={16} color="#FFFFFF" />
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="map-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>暂无圣地数据</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTop: { gap: 2 },
  title: { fontSize: 22, fontWeight: '800', color: '#1A1A1A' },
  subtitle: { fontSize: 13, color: colors.textMuted },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  regionSection: {
    backgroundColor: '#FFFFFF', borderRadius: 14, marginTop: 12,
    borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden',
  },
  regionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  regionName: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', flex: 1 },
  regionCount: {
    backgroundColor: 'rgba(0, 102, 255, 0.08)', color: colors.gold,
    fontSize: 12, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
  },
  siteRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#F9FAFB',
  },
  siteInfo: { flex: 1 },
  siteName: { fontSize: 14, fontWeight: '600', color: '#374151' },
  siteCity: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  mapBtn: {
    backgroundColor: colors.gold, width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginLeft: 8,
  },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: 12 },
  emptyText: { fontSize: 14, color: colors.textMuted },
});
