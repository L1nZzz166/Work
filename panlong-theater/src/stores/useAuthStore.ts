import { create } from 'zustand';
import { UserInfo, AuthInfo } from '../types/user';
import { userService } from '../services/user.service';
import Taro from '@tarojs/taro';

interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  userInfo: UserInfo | null;
  isLoggingIn: boolean;
  showLoginModal: boolean;

  login: () => Promise<void>;
  logout: () => void;
  updateUserInfo: (info: Partial<UserInfo>) => void;
  setShowLoginModal: (show: boolean) => void;
  checkLoginStatus: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  token: null,
  userInfo: null,
  isLoggingIn: false,
  showLoginModal: false,

  /** 检查登录状态——从本地缓存恢复 */
  checkLoginStatus: () => {
    try {
      const token = Taro.getStorageSync('token');
      const userInfo = Taro.getStorageSync('userInfo');
      if (token && userInfo) {
        set({ isLoggedIn: true, token, userInfo: JSON.parse(userInfo) });
      }
    } catch {
      // 未登录或缓存已过期
    }
  },

  /** 模拟微信登录 */
  login: async () => {
    set({ isLoggingIn: true });
    try {
      // 模拟获取微信 code
      const mockCode = 'mock_wx_code_' + Date.now();
      const authInfo: AuthInfo = await userService.mockLogin({ code: mockCode });

      // 持久化到本地缓存
      Taro.setStorageSync('token', authInfo.token);
      Taro.setStorageSync('userInfo', JSON.stringify(authInfo.userInfo));

      set({
        isLoggedIn: true,
        token: authInfo.token,
        userInfo: authInfo.userInfo,
        isLoggingIn: false,
        showLoginModal: false,
      });

      Taro.showToast({ title: '登录成功', icon: 'success', duration: 2000 });
    } catch {
      set({ isLoggingIn: false });
      Taro.showToast({ title: '登录失败，请重试', icon: 'error' });
    }
  },

  /** 退出登录 */
  logout: () => {
    try {
      Taro.removeStorageSync('token');
      Taro.removeStorageSync('userInfo');
    } catch {
      // ignore
    }
    set({ isLoggedIn: false, token: null, userInfo: null });
    Taro.showToast({ title: '已退出登录', icon: 'none' });
  },

  /** 更新用户信息 */
  updateUserInfo: (info: Partial<UserInfo>) => {
    const { userInfo } = get();
    if (userInfo) {
      const updated = { ...userInfo, ...info };
      Taro.setStorageSync('userInfo', JSON.stringify(updated));
      set({ userInfo: updated });
    }
  },

  /** 显隐登录弹窗 */
  setShowLoginModal: (show: boolean) => set({ showLoginModal: show }),
}));
