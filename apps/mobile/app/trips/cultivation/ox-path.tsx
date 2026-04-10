import React, { useState, useEffect } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { spacing, borderRadius } from '../../../src/lib/theme';
import { api, type OxPathResponse } from '../../../src/lib/api';

const NAMES = [
  '寻牛', '见迹', '见牛', '得牛', '牧牛',
  '骑牛归家', '忘牛存人', '人牛俱忘', '返本还源', '入廛垂手',
];

export default function OxPathScreen() {
  const [data, setData] = useState<OxPathResponse | null>(null);

  useEffect(() => {
    api.getOxPath().then(setData).catch(() => {});
  }, []);

  const onAdvance = async () => {
    try {
      await api.advanceOxStage();
      api.getOxPath().then(setData);
    } catch (e) {
      Alert.alert('晋阶失败', e instanceof Error ? e.message : '条件不足');
    }
  };

  if (!data) return null;

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 80 }}>
      <Text style={s.title}>十牛图修行路径</Text>
      <Text style={s.subtitle}>禅宗主脉 · 十阶心性图</Text>

      {data.stages.map((st) => (
        <View
          key={st.stage}
          style={[s.card, st.current && s.cardCurrent, !st.unlocked && { opacity: 0.4 }]}
        >
          <View style={[s.num, st.current && { backgroundColor: '#D4A855' }]}>
            <Text style={[s.numText, st.current && { color: '#fff' }]}>{st.stage}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{NAMES[st.stage - 1]}</Text>
            <Text style={s.meta}>第 {st.stage} 阶{st.current ? ' · 当前' : ''}</Text>
          </View>
        </View>
      ))}

      <Pressable
        style={[s.btn, data.currentStage >= 10 && { opacity: 0.4 }]}
        onPress={onAdvance}
        disabled={data.currentStage >= 10}
      >
        <Text style={s.btnText}>
          {data.currentStage >= 10 ? '已至圆融境' : '申请晋阶 (需 21 天连击)'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0a06' },
  title: { color: '#D4A855', fontSize: 24, fontWeight: '700', marginBottom: 4 },
  subtitle: { color: 'rgba(212,168,85,0.5)', fontSize: 14, marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(120,85,40,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(120,85,40,0.2)',
    marginBottom: 8,
  },
  cardCurrent: { borderColor: '#D4A855', backgroundColor: 'rgba(212,168,85,0.1)' },
  num: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(120,85,40,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numText: { color: '#D4A855', fontWeight: '700', fontSize: 14 },
  name: { color: '#D4A855', fontWeight: '600', fontSize: 15 },
  meta: { color: 'rgba(212,168,85,0.4)', fontSize: 12, marginTop: 2 },
  btn: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    backgroundColor: '#D4A855',
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
