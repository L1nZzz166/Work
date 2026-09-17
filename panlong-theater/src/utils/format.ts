import { SeatStatus, SeatZone } from '../types/seat';

// ========== 价格格式化 ==========
export function formatPrice(cents: number): string {
  return `¥${(cents / 100).toFixed(2)}`;
}

// ========== 日期格式化 ==========
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${month}-${day}`;
}

export function formatWeekday(dateStr: string): string {
  const date = new Date(dateStr);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return weekdays[date.getDay()];
}

export function formatDateFull(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}

export function formatDateTime(dateStr: string, timeStr: string): string {
  return `${formatDateFull(dateStr)} ${timeStr}`;
}

export function formatOrderId(dateStr: string): string {
  const now = new Date();
  const y = now.getFullYear().toString();
  const m = (now.getMonth() + 1).toString().padStart(2, '0');
  const d = now.getDate().toString().padStart(2, '0');
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PL${y}${m}${d}${rand}`;
}

// ========== 日期工具 ==========
export function getDateRange(days: number = 14): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    dates.push(formatISODate(d));
  }
  return dates;
}

export function formatISODate(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getToday(): string {
  return formatISODate(new Date());
}

export function isToday(dateStr: string): boolean {
  return dateStr === getToday();
}

export function isTomorrow(dateStr: string): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return dateStr === formatISODate(tomorrow);
}

// ========== 座位格式化 ==========
export function formatSeatNumber(rowLabel: string, colLabel: string): string {
  return `${rowLabel}排${colLabel}座`;
}

export function formatZoneName(zone: SeatZone): string {
  const names: Record<SeatZone, string> = {
    [SeatZone.VIP]: '贵宾区',
    [SeatZone.A]: 'A区',
    [SeatZone.B]: 'B区',
    [SeatZone.C]: 'C区',
    [SeatZone.BALCONY]: '楼座',
  };
  return names[zone] || zone;
}

// ========== 订单状态格式化 ==========
export function formatOrderStatus(status: string): string {
  const statusMap: Record<string, string> = {
    unpaid: '待付款',
    paid: '已出票',
    completed: '已观演',
    refunding: '退款中',
    refunded: '已退款',
    cancelled: '已取消',
    expired: '已过期',
  };
  return statusMap[status] || status;
}

// ========== 类别格式化 ==========
export function formatCategory(category: string): string {
  const catMap: Record<string, string> = {
    opera: '歌剧',
    drama: '话剧',
    dance: '舞剧',
    concert: '音乐会',
    chinese_opera: '戏曲',
    musical: '音乐剧',
    children: '儿童剧',
    crossover: '跨界演出',
  };
  return catMap[category] || category;
}

// ========== 时长格式化 ==========
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}分钟`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}小时${m}分钟` : `${h}小时`;
}

// ========== 会员等级 ==========
export function formatMemberLevel(level: string): string {
  const levelMap: Record<string, string> = {
    normal: '普通会员',
    silver: '银卡会员',
    gold: '金卡会员',
    diamond: '钻石会员',
  };
  return levelMap[level] || level;
}

// ========== 距离现在的时间 ==========
export function formatTimeLeft(expireTimestamp: number): string {
  const now = Date.now();
  const diff = expireTimestamp - now;
  if (diff <= 0) return '已过期';
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
