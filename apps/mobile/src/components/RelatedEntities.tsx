import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api, RecommendationEntityType, RecommendationItem } from '../lib/api';

function getDetailRoute(type: RecommendationEntityType, id: string): string {
  switch (type) {
    case 'HOLY_SITE': return `/holy-sites/${id}`;
    case 'TEMPLE': return `/temples/${id}`;
    case 'PATRIARCH': return `/patriarchs/${id}`;
    case 'ROUTE': return `/routes/${id}`;
    case 'JOURNAL': return `/journals/${id}`;
    default: return '/';
  }
}

interface RelatedEntitiesProps {
  entityType: RecommendationEntityType;
  entityId: string;
  title?: string;
}

export default function RelatedEntities({ entityType, entityId, title = '相关推荐' }: RelatedEntitiesProps) {
  const router = useRouter();
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entityId) return;
    api.fetchRelatedItems(entityType, entityId, 8)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [entityType, entityId]);

  if (loading || items.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(getDetailRoute(item.type, item.id) as never)}
          >
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
            ) : (
              <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                <Ionicons name="image" size={24} color="#CBD5E1" />
              </View>
            )}
            <View style={styles.cardBody}>
              <View
                style={[
                  styles.religionBadge,
                  { backgroundColor: item.religionColor ? `${item.religionColor}22` : '#EFF6FF' },
                ]}
              >
                <Text
                  style={[
                    styles.religionBadgeText,
                    { color: item.religionColor ?? '#0066FF' },
                  ]}
                  numberOfLines={1}
                >
                  {item.religionName}
                </Text>
              </View>
              <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
              {item.country ? (
                <Text style={styles.cardSub} numberOfLines={1}>{item.country}</Text>
              ) : null}
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20 },
  title: { fontSize: 17, fontWeight: '700', color: '#1A1A1A', marginBottom: 12, paddingHorizontal: 16 },
  list: { paddingHorizontal: 16, gap: 10 },
  card: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardImage: { width: '100%', height: 100 },
  cardImagePlaceholder: { backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  cardBody: { padding: 8, gap: 4 },
  religionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 6,
  },
  religionBadgeText: { fontSize: 10, fontWeight: '600' },
  cardName: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', lineHeight: 18 },
  cardSub: { fontSize: 11, color: '#9CA3AF' },
});
