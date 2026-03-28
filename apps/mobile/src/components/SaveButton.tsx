import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { api, CollectionEntityType } from '../lib/api';

interface SaveButtonProps {
  entityType: CollectionEntityType;
  entityId: string;
  size?: number;
}

export default function SaveButton({ entityType, entityId, size = 28 }: SaveButtonProps) {
  const [saved, setSaved] = useState(false);
  const [itemId, setItemId] = useState<string | null>(null);
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let cancelled = false;
    api.checkSaved(entityType, entityId)
      .then((result) => {
        if (cancelled) return;
        setSaved(result.saved);
        setItemId(result.itemId);
        setCollectionId(result.collectionId);
      })
      .catch(() => {
        // Not logged in or network error — default to unsaved
      });
    return () => { cancelled = true; };
  }, [entityType, entityId]);

  const animatePop = useCallback(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.35,
        useNativeDriver: true,
        speed: 30,
        bounciness: 8,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 30,
        bounciness: 4,
      }),
    ]).start();
  }, [scaleAnim]);

  const handlePress = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    animatePop();

    // Optimistic update
    const prevSaved = saved;
    const prevItemId = itemId;
    const prevCollectionId = collectionId;
    setSaved(!saved);

    try {
      if (prevSaved && prevItemId && prevCollectionId) {
        await api.removeFromCollection(prevCollectionId, prevItemId);
        setItemId(null);
        setCollectionId(null);
      } else {
        const result = await api.quickSave(entityType, entityId);
        setItemId(result.itemId);
        setCollectionId(result.collectionId);
        setSaved(true);
      }
    } catch {
      // Revert optimistic update on error
      setSaved(prevSaved);
      setItemId(prevItemId);
      setCollectionId(prevCollectionId);
    } finally {
      setLoading(false);
    }
  }, [loading, saved, itemId, collectionId, entityType, entityId, animatePop]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={styles.button}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityLabel={saved ? '取消收藏' : '收藏'}
      accessibilityRole="button"
    >
      <Animated.Text
        style={[
          styles.heart,
          { fontSize: size, transform: [{ scale: scaleAnim }] },
          saved ? styles.heartFilled : styles.heartEmpty,
        ]}
      >
        {saved ? '♥' : '♡'}
      </Animated.Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  heart: {
    lineHeight: undefined,
  },
  heartFilled: {
    color: '#EF4444',
  },
  heartEmpty: {
    color: 'rgba(0,0,0,0.4)',
  },
});
