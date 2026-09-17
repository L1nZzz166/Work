// ---------- 枚举 ----------

export enum OrderStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  COMPLETED = 'completed',
  REFUNDING = 'refunding',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum PaymentMethod {
  WECHAT_PAY = 'wechat_pay',
}

// ---------- 核心实体 ----------

export interface Ticket {
  id: string;
  orderId: string;
  showTitle: string;
  performanceDate: string;
  performanceTime: string;
  venue: string;
  seatNumber: string;
  zone: string;
  price: number;
  qrCodeData: string;
  status: 'valid' | 'used' | 'refunded';
}

export interface Order {
  id: string;
  userId: string;
  showId: string;
  showTitle: string;
  posterUrl: string;
  performanceId: string;
  performanceDate: string;
  performanceTime: string;
  venue: string;
  tickets: Ticket[];
  ticketCount: number;
  totalAmount: number;
  paidAmount: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentTime?: string;
  createdAt: string;
  expiredAt?: string;
  refundReason?: string;
  refundTime?: string;
  contactName: string;
  contactPhone: string;
}

export interface CreateOrderParams {
  performanceId: string;
  showId: string;
  showTitle: string;
  posterUrl: string;
  performanceDate: string;
  performanceTime: string;
  venue: string;
  seats: { id: string; seatNumber: string; zone: string; price: number }[];
  contactName: string;
  contactPhone: string;
}
