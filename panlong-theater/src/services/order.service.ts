import { mockApi } from '../utils/mock';
import { MOCK_ORDERS } from '../mock/orders';
import { Order, CreateOrderParams, OrderStatus, Ticket } from '../types/order';
import { formatOrderId } from '../utils/format';

// 内存中的订单存储（模拟后端）
let ordersStore: Order[] = [...MOCK_ORDERS];

export const orderService = {
  /** 获取用户所有订单 */
  async getOrders(): Promise<Order[]> {
    await mockApi(null);
    return ordersStore.map(o => ({ ...o, tickets: o.tickets.map(t => ({ ...t })) }));
  },

  /** 获取订单详情 */
  async getOrderDetail(orderId: string): Promise<Order> {
    await mockApi(null);
    const order = ordersStore.find(o => o.id === orderId);
    if (!order) throw new Error('订单不存在');
    return { ...order, tickets: order.tickets.map(t => ({ ...t })) };
  },

  /** 创建订单 */
  async createOrder(params: CreateOrderParams): Promise<Order> {
    await mockApi(null);
    const orderId = formatOrderId(new Date().toISOString());
    const tickets: Ticket[] = params.seats.map((seat, idx) => ({
      id: `ticket_${orderId}_${idx}`,
      orderId,
      showTitle: params.showTitle,
      performanceDate: params.performanceDate,
      performanceTime: params.performanceTime,
      venue: params.venue,
      seatNumber: seat.seatNumber,
      zone: seat.zone,
      price: seat.price,
      qrCodeData: `${orderId}|user_001|ticket_${orderId}_${idx}`,
      status: 'valid' as const,
    }));

    const totalAmount = tickets.reduce((sum, t) => sum + t.price, 0);

    const order: Order = {
      id: orderId,
      userId: 'user_001',
      showId: params.showId,
      showTitle: params.showTitle,
      posterUrl: params.posterUrl,
      performanceId: params.performanceId,
      performanceDate: params.performanceDate,
      performanceTime: params.performanceTime,
      venue: params.venue,
      tickets,
      ticketCount: tickets.length,
      totalAmount,
      paidAmount: 0,
      status: OrderStatus.UNPAID,
      createdAt: new Date().toISOString(),
      expiredAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      contactName: params.contactName,
      contactPhone: params.contactPhone,
    };

    ordersStore = [order, ...ordersStore];
    return { ...order, tickets: order.tickets.map(t => ({ ...t })) };
  },

  /** 支付订单 */
  async payOrder(orderId: string): Promise<Order> {
    await mockApi(null, 800);
    const idx = ordersStore.findIndex(o => o.id === orderId);
    if (idx === -1) throw new Error('订单不存在');

    ordersStore[idx] = {
      ...ordersStore[idx],
      status: OrderStatus.PAID,
      paidAmount: ordersStore[idx].totalAmount,
      paymentTime: new Date().toISOString(),
      paymentMethod: 'wechat_pay' as any,
    };

    return { ...ordersStore[idx], tickets: ordersStore[idx].tickets.map(t => ({ ...t })) };
  },

  /** 取消订单 */
  async cancelOrder(orderId: string): Promise<void> {
    await mockApi(null);
    const idx = ordersStore.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      ordersStore[idx] = { ...ordersStore[idx], status: OrderStatus.CANCELLED };
    }
  },

  /** 申请退款 */
  async requestRefund(orderId: string, reason: string): Promise<Order> {
    await mockApi(null);
    const idx = ordersStore.findIndex(o => o.id === orderId);
    if (idx === -1) throw new Error('订单不存在');

    ordersStore[idx] = {
      ...ordersStore[idx],
      status: OrderStatus.REFUNDED,
      refundReason: reason,
      refundTime: new Date().toISOString(),
    };

    return { ...ordersStore[idx], tickets: ordersStore[idx].tickets.map(t => ({ ...t })) };
  },
};
