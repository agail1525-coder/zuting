import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/lib/auth-context';
import { initSentry, wrap } from '../src/lib/sentry';

// Initialize Sentry before rendering
initSentry();

function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0f172a',
          },
          headerTintColor: '#D4A855',
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: '#0f172a',
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="login"
          options={{ title: '登录', presentation: 'modal' }}
        />
        <Stack.Screen
          name="register"
          options={{ title: '注册', presentation: 'modal' }}
        />
        <Stack.Screen
          name="religions/[slug]"
          options={{ title: '信仰详情' }}
        />
        <Stack.Screen
          name="holy-sites/[id]"
          options={{ title: '圣地详情' }}
        />
        <Stack.Screen
          name="temples/[id]"
          options={{ title: '祖庭详情' }}
        />
        <Stack.Screen
          name="patriarchs/[id]"
          options={{ title: '祖师详情' }}
        />
        <Stack.Screen
          name="seals/[id]"
          options={{ title: '印详情' }}
        />
        <Stack.Screen
          name="trips/index"
          options={{ title: '我的行程' }}
        />
        <Stack.Screen
          name="trips/[id]"
          options={{ title: '行程详情' }}
        />
        <Stack.Screen
          name="journals/index"
          options={{ title: '朝圣日记' }}
        />
      </Stack>
    </AuthProvider>
  );
}

export default wrap(RootLayout);
