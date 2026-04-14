import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

const PRIMARY = '#3264ff';
const MUTED = '#9CA3AF';
const BG = '#FFFFFF';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: '#1A1A1A',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        tabBarStyle: {
          backgroundColor: BG,
          borderTopColor: '#E5E7EB',
          borderTopWidth: 1,
          height: 88,
          paddingBottom: 28,
          paddingTop: 8,
        },
        tabBarActiveTintColor: PRIMARY,
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
          headerTitle: '走祖庭，看世界',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="holy-sites"
        options={{
          title: '目的地',
          headerTitle: '目的地',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'AI规划',
          headerTitle: 'AI旅行规划师',
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
                color={focused ? '#FFFFFF' : color}
              />
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
            color: PRIMARY,
          },
        }}
      />
      <Tabs.Screen
        name="seals"
        options={{
          title: '体验',
          headerTitle: '文化体验',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles" size={size} color={color} />
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
    backgroundColor: 'rgba(50, 100, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(50, 100, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  centerTabActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
