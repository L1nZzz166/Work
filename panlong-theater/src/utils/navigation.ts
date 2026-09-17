import Taro from '@tarojs/taro';

// ========== 带类型的导航跳转 ==========

export const NAV_PARAMS = {
  showDetail: (showId: string) => `/pages/show-detail/index?showId=${showId}`,
  seatSelect: (performanceId: string) => `/pages/seat-select/index?performanceId=${performanceId}`,
  orderConfirm: (performanceId: string, seatIds: string) =>
    `/pages/order-confirm/index?performanceId=${performanceId}&seatIds=${seatIds}`,
  orderDetail: (orderId: string) => `/pages/order-detail/index?orderId=${orderId}`,
};

export function navigateTo(url: string) {
  Taro.navigateTo({ url });
}

export function redirectTo(url: string) {
  Taro.redirectTo({ url });
}

export function switchTab(url: string) {
  Taro.switchTab({ url });
}

export function navigateBack(delta: number = 1) {
  Taro.navigateBack({ delta });
}
