import { mockApi } from '../utils/mock';
import { MOCK_USER } from '../mock/user';
import { UserInfo, LoginParams, AuthInfo } from '../types/user';

// 模拟 token
const MOCK_TOKEN = 'mock_token_panlong_theater_2025';

export const userService = {
  /** 模拟微信登录 */
  async mockLogin(params: LoginParams): Promise<AuthInfo> {
    await mockApi(null, 600);
    return {
      isLoggedIn: true,
      token: MOCK_TOKEN,
      userInfo: { ...MOCK_USER },
      loginCode: params.code,
    };
  },

  /** 获取用户信息 */
  async getUserInfo(): Promise<UserInfo> {
    await mockApi(null);
    return { ...MOCK_USER };
  },

  /** 更新用户信息 */
  async updateUserInfo(updates: Partial<UserInfo>): Promise<UserInfo> {
    await mockApi(null);
    return { ...MOCK_USER, ...updates };
  },

  /** 退出登录 */
  async logout(): Promise<void> {
    await mockApi(null, 200);
  },
};
