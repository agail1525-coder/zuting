import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/lib/auth-context';
import { I18nProvider } from '../src/lib/i18n';
import { initSentry, wrap } from '../src/lib/sentry';

// Initialize Sentry before rendering
initSentry();

function RootLayout() {
  return (
    <AuthProvider>
      <I18nProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#FFFFFF',
            },
            headerTintColor: '#0066FF',
            headerTitleStyle: {
              fontWeight: '600',
            },
            contentStyle: {
              backgroundColor: '#FFFFFF',
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
          options={{ title: '文化详情' }}
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
          options={{ title: '文化日记' }}
        />
        <Stack.Screen
          name="search"
          options={{ title: '搜索' }}
        />
        <Stack.Screen
          name="checkout"
          options={{ title: '确认支付' }}
        />
        <Stack.Screen
          name="payment-result"
          options={{ title: '支付结果', headerBackVisible: false }}
        />
        <Stack.Screen
          name="coupons"
          options={{ title: '优惠券中心' }}
        />
        <Stack.Screen
          name="promotions"
          options={{ title: '促销活动' }}
        />
        <Stack.Screen
          name="membership"
          options={{ title: '会员中心' }}
        />
        <Stack.Screen
          name="referral"
          options={{ title: '分销中心' }}
        />
        <Stack.Screen
          name="points-mall"
          options={{ title: '积分商城' }}
        />
        <Stack.Screen
          name="packages"
          options={{ title: '套餐列表' }}
        />
        <Stack.Screen
          name="packages/[id]"
          options={{ title: '套餐详情' }}
        />
        <Stack.Screen
          name="prices"
          options={{ title: '价格工具' }}
        />
        <Stack.Screen
          name="price-calendar"
          options={{ title: '价格日历' }}
        />
        <Stack.Screen
          name="price-alerts"
          options={{ title: '价格提醒' }}
        />
        <Stack.Screen
          name="merchants"
          options={{ title: '合作商家' }}
        />
        <Stack.Screen
          name="merchants/[id]"
          options={{ title: '商家详情' }}
        />
        <Stack.Screen
          name="messages"
          options={{ title: '消息' }}
        />
        <Stack.Screen
          name="chat-room/[id]"
          options={{ title: '聊天' }}
        />
        <Stack.Screen
          name="edit-profile"
          options={{ title: '编辑资料' }}
        />
        <Stack.Screen
          name="about"
          options={{ title: '关于佳绩之旅' }}
        />
        <Stack.Screen
          name="privacy"
          options={{ title: '隐私政策' }}
        />
        <Stack.Screen
          name="terms"
          options={{ title: '用户协议' }}
        />
        </Stack>
      </I18nProvider>
    </AuthProvider>
  );
}

export default wrap(RootLayout);
