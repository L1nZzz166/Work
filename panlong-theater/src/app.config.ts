export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/schedule/index',
    'pages/show-detail/index',
    'pages/seat-select/index',
    'pages/order-confirm/index',
    'pages/orders/index',
    'pages/order-detail/index',
    'pages/user/index',
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#1A0A0A',
    navigationBarTitleText: '蟠龙剧院',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F5F0EB',
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#8B1A2B',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
      },
      {
        pagePath: 'pages/schedule/index',
        text: '演出',
      },
      {
        pagePath: 'pages/orders/index',
        text: '订单',
      },
      {
        pagePath: 'pages/user/index',
        text: '我的',
      },
    ],
  },
});
