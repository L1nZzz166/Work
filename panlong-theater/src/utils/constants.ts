// ========== 应用常量 ==========

export const APP_NAME = '蟠龙剧院';

// 剧院信息
export const THEATER_INFO = {
  name: '蟠龙剧院',
  address: '上海市黄浦区蟠龙路168号',
  phone: '021-6688-1234',
  hours: '09:00 - 22:00',
  description: '蟠龙剧院始建于1928年，是一座具有近百年历史的经典剧院。剧院融合了中西方建筑美学，拥有蟠龙大剧场（1280座）和蟠龙小剧场（420座）两个演出厅，每年上演超过200场中外优秀剧目。',
  venues: [
    { name: '蟠龙大剧场', seats: 1280, description: '主演出厅，配备国际一流声光系统' },
    { name: '蟠龙小剧场', seats: 420, description: '实验剧场，适合中小型剧目演出' },
  ],
};

// 选座限制
export const SEAT_LIMITS = {
  MAX_SELECT: 6,           // 单次最多选 6 个座位
  LOCK_TIMEOUT: 15 * 60 * 1000, // 选座锁定时间 15 分钟
  PAY_TIMEOUT: 15 * 60 * 1000,  // 支付超时 15 分钟
};

// 服务费比例
export const SERVICE_FEE_RATE = 0.05; // 5%

// 价格区间（用于筛选，单位：分）
export const PRICE_RANGES = [
  { label: '全部', min: 0, max: Infinity },
  { label: '¥180以下', min: 0, max: 18000 },
  { label: '¥180-¥380', min: 18000, max: 38000 },
  { label: '¥380-¥680', min: 38000, max: 68000 },
  { label: '¥680以上', min: 68000, max: Infinity },
];

// 颜色常量
export const COLORS = {
  PRIMARY: '#8B1A2B',
  PRIMARY_DARK: '#6B1320',
  PRIMARY_LIGHT: '#B22234',
  GOLD: '#C9A96E',
  GOLD_LIGHT: '#D4BC8B',
  BG: '#F5F0EB',
  BG_CARD: '#FFFFFF',
  TEXT: '#1A0A0A',
  TEXT_SECONDARY: '#8C7C7C',
  TEXT_HINT: '#B8A8A8',
  BORDER: '#E8E0D5',
  SUCCESS: '#52C41A',
  WARNING: '#FAAD14',
  ERROR: '#FF4D4F',
  INFO: '#1890FF',
  SEAT_AVAILABLE: '#E8F5E9',
  SEAT_AVAILABLE_BORDER: '#66BB6A',
  SEAT_SOLD: '#EEEEEE',
  SEAT_SOLD_BORDER: '#E0E0E0',
  SEAT_SELECTED: '#8B1A2B',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
};

// 类别映射（含图标和名称）
export const CATEGORIES = [
  { key: 'all', name: '全部', icon: '🎭' },
  { key: 'drama', name: '话剧', icon: '🎭' },
  { key: 'opera', name: '歌剧', icon: '🎼' },
  { key: 'musical', name: '音乐剧', icon: '🎵' },
  { key: 'dance', name: '舞剧', icon: '💃' },
  { key: 'concert', name: '音乐会', icon: '🎹' },
  { key: 'chinese_opera', name: '戏曲', icon: '🎋' },
  { key: 'children', name: '亲子', icon: '👶' },
];
