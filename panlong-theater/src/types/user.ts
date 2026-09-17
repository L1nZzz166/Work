export interface UserInfo {
  id: string;
  openId: string;
  unionId?: string;
  nickName: string;
  avatarUrl: string;
  gender: 0 | 1 | 2;
  phone?: string;
  memberLevel: MemberLevel;
  memberPoints: number;
  createdAt: string;
}

export enum MemberLevel {
  NORMAL = 'normal',
  SILVER = 'silver',
  GOLD = 'gold',
  DIAMOND = 'diamond',
}

export interface AuthInfo {
  isLoggedIn: boolean;
  token: string | null;
  userInfo: UserInfo | null;
  loginCode?: string;
}

export interface LoginParams {
  code: string;
  encryptedData?: string;
  iv?: string;
}

export interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  linkType: 'show' | 'schedule' | 'none';
  linkId?: string;
}
