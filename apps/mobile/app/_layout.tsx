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
            headerTintColor: '#3264ff',
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
        {/* ── F2-F5 四部曲 ─────────────────────── */}
        <Stack.Screen
          name="culture-life/index"
          options={{ title: '文化与生命' }}
        />
        <Stack.Screen
          name="culture-life/questions/index"
          options={{ title: '十二命题' }}
        />
        <Stack.Screen
          name="culture-life/questions/[code]"
          options={{ title: '命题详情' }}
        />
        <Stack.Screen
          name="culture-life/stages"
          options={{ title: '七阶段' }}
        />
        <Stack.Screen
          name="culture-life/dialogue"
          options={{ title: 'AI 智者圆桌' }}
        />
        <Stack.Screen
          name="faith-assessment"
          options={{ title: '信仰力评估' }}
        />
        <Stack.Screen
          name="personal-growth/index"
          options={{ title: '个人圆满' }}
        />
        <Stack.Screen
          name="personal-growth/themes/[slug]"
          options={{ title: '主题详情' }}
        />
        <Stack.Screen
          name="personal-growth/cases/[slug]"
          options={{ title: '案例详情' }}
        />
        <Stack.Screen
          name="family-harmony/index"
          options={{ title: '家庭幸福' }}
        />
        <Stack.Screen
          name="family-harmony/themes/[slug]"
          options={{ title: '主题详情' }}
        />
        <Stack.Screen
          name="family-harmony/cases/[slug]"
          options={{ title: '案例详情' }}
        />
        <Stack.Screen
          name="rankings"
          options={{ title: '排行榜' }}
        />
        <Stack.Screen
          name="users/[userId]"
          options={{ title: '用户主页' }}
        />
        {/* ── Wave 4 补齐未注册路由 ────────────── */}
        <Stack.Screen
          name="prices/compare"
          options={{ title: '价格比较' }}
        />
        <Stack.Screen
          name="prices/trend"
          options={{ title: '价格趋势' }}
        />
        <Stack.Screen
          name="community/index"
          options={{ title: '攻略社区' }}
        />
        <Stack.Screen
          name="community/guide/[id]"
          options={{ title: '攻略详情' }}
        />
        <Stack.Screen
          name="community/question/[id]"
          options={{ title: '问答详情' }}
        />
        <Stack.Screen
          name="community/questions"
          options={{ title: '问答广场' }}
        />
        <Stack.Screen
          name="community/photos"
          options={{ title: '照片墙' }}
        />
        <Stack.Screen
          name="community/leaderboard"
          options={{ title: '排行榜' }}
        />
        <Stack.Screen
          name="guides/index"
          options={{ title: '攻略列表' }}
        />
        <Stack.Screen
          name="write-guide"
          options={{ title: '写攻略', presentation: 'modal' }}
        />
        <Stack.Screen
          name="write-review"
          options={{ title: '写评价', presentation: 'modal' }}
        />
        <Stack.Screen
          name="collections/index"
          options={{ title: '我的收藏' }}
        />
        <Stack.Screen
          name="collections/[id]"
          options={{ title: '收藏夹详情' }}
        />
        <Stack.Screen
          name="orders/index"
          options={{ title: '我的订单' }}
        />
        <Stack.Screen
          name="notifications/index"
          options={{ title: '通知' }}
        />
        <Stack.Screen
          name="map/index"
          options={{ title: '地图' }}
        />
        <Stack.Screen
          name="routes/index"
          options={{ title: '路线列表' }}
        />
        <Stack.Screen
          name="routes/[slug]"
          options={{ title: '路线详情' }}
        />
        <Stack.Screen
          name="routes/checkout"
          options={{ title: '路线结账' }}
        />
        <Stack.Screen
          name="teachings/index"
          options={{ title: '祖训列表' }}
        />
        <Stack.Screen
          name="teachings/[id]"
          options={{ title: '祖训详情' }}
        />
        <Stack.Screen
          name="trips/create"
          options={{ title: '创建行程', presentation: 'modal' }}
        />
        <Stack.Screen
          name="team-culture"
          options={{ title: '团队文化' }}
        />
        </Stack>
      </I18nProvider>
    </AuthProvider>
  );
}

export default wrap(RootLayout);
