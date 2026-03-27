export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/holy-sites/index',
    'pages/seals/index',
    'pages/profile/index',
    'pages/religion-detail/index',
    'pages/holy-site-detail/index',
    'pages/temple-detail/index',
    'pages/patriarch-detail/index',
    'pages/seal-detail/index',
    'pages/chat/index',
    'pages/trips/index',
    'pages/trip-detail/index',
    'pages/journals/index',
    'pages/journal-create/index',
    'pages/journal-detail/index',
    'pages/map/index',
    'pages/search/index'
  ],
  tabBar: {
    color: '#94a3b8',
    selectedColor: '#D4A855',
    backgroundColor: '#0f172a',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/tab-home.png',
        selectedIconPath: 'assets/tab-home-active.png'
      },
      {
        pagePath: 'pages/holy-sites/index',
        text: '圣地',
        iconPath: 'assets/tab-map.png',
        selectedIconPath: 'assets/tab-map-active.png'
      },
      {
        pagePath: 'pages/seals/index',
        text: '修行',
        iconPath: 'assets/tab-seal.png',
        selectedIconPath: 'assets/tab-seal-active.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/tab-profile.png',
        selectedIconPath: 'assets/tab-profile-active.png'
      }
    ]
  },
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#0f172a',
    navigationBarTitleText: '祖庭之旅',
    navigationBarTextStyle: 'white',
    backgroundColor: '#020617'
  }
})
