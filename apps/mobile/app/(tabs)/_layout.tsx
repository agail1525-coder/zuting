import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

const GOLD = '#D4A855';
const MUTED = '#64748B';
const BG = '#020617';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0f172a',
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: GOLD,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        tabBarStyle: {
          backgroundColor: BG,
          borderTopColor: 'rgba(212, 168, 85, 0.15)',
          borderTopWidth: 1,
          height: 88,
          paddingBottom: 28,
          paddingTop: 8,
        },
        tabBarActiveTintColor: GOLD,
        tabBarInactiveTintColor: MUTED,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          headerTitle: '全球祖庭之旅',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="holy-sites"
        options={{
          title: '圣地',
          headerTitle: '全球圣地',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'AI助手',
          headerTitle: '小鸿 · AI助手',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.centerTab,
                focused && styles.centerTabActive,
              ]}
            >
              <Ionicons
                name="chatbubble-ellipses"
                size={26}
                color={focused ? BG : color}
              />
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
            color: GOLD,
          },
        }}
      />
      <Tabs.Screen
        name="seals"
        options={{
          title: '修行',
          headerTitle: '曹溪愿命三十印',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flame" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          headerTitle: '我的',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  centerTab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(212, 168, 85, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(212, 168, 85, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  centerTabActive: {
    backgroundColor: GOLD,
    borderColor: GOLD,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
