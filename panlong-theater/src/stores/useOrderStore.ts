import { create } from 'zustand';
import { Order, CreateOrderParams, OrderStatus } from '../types/order';
import { orderService } from '../services/order.service';
import Taro from '@tarojs/taro';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  activeTab: 'all' | 'unpaid' | 'paid' | 'refunded';
  isLoading: boolean;
  isSubmitting: boolean;

  fetchOrders: () => Promise<void>;
  fetchOrderDetail: (orderId: string) => Promise<void>;
  createOrder: (params: CreateOrderParams) => Promise<Order | null>;
  payOrder: (orderId: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  requestRefund: (orderId: string, reason: string) => Promise<void>;
  setActiveTab: (tab: OrderState['activeTab']) => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  currentOrder: null,
  activeTab: 'all',
  isLoading: false,
  isSubmitting: false,

  /** 获取订单列表 */
  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      const orders = await orderService.getOrders();
      set({ orders, isLoading: false });
    } catch {
      set({ isLoading: false });
      Taro.showToast({ title: '加载订单失败', icon: 'none' });
    }
  },

  /** 获取订单详情 */
  fetchOrderDetail: async (orderId: string) => {
    set({ isLoading: true });
    try {
      const order = await orderService.getOrderDetail(orderId);
      set({ currentOrder: order, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  /** 创建订单 */
  createOrder: async (params: CreateOrderParams) => {
    set({ isSubmitting: true });
    try {
      const order = await orderService.createOrder(params);
      set(state => ({
        orders: [order, ...state.orders],
        isSubmitting: false,
      }));
      Taro.showToast({ title: '下单成功，请尽快支付', icon: 'success' });
      return order;
    } catch {
      set({ isSubmitting: false });
      Taro.showToast({ title: '下单失败', icon: 'error' });
      return null;
    }
  },

  /** 支付订单 */
  payOrder: async (orderId: string) => {
    set({ isSubmitting: true });
    try {
      const updated = await orderService.payOrder(orderId);
      set(state => ({
        orders: state.orders.map(o => o.id === orderId ? updated : o),
        currentOrder: state.currentOrder?.id === orderId ? updated : state.currentOrder,
        isSubmitting: false,
      }));
      Taro.showToast({ title: '支付成功！', icon: 'success' });
    } catch {
      set({ isSubmitting: false });
      Taro.showToast({ title: '支付失败', icon: 'error' });
    }
  },

  /** 取消订单 */
  cancelOrder: async (orderId: string) => {
    const res = await Taro.showModal({
      title: '取消订单',
      content: '确定要取消该订单吗？',
    });
    if (!res.confirm) return;

    try {
      await orderService.cancelOrder(orderId);
      set(state => ({
        orders: state.orders.map(o =>
          o.id === orderId ? { ...o, status: OrderStatus.CANCELLED } : o
        ),
        currentOrder: state.currentOrder?.id === orderId
          ? { ...state.currentOrder, status: OrderStatus.CANCELLED }
          : state.currentOrder,
      }));
      Taro.showToast({ title: '订单已取消', icon: 'none' });
    } catch {
      Taro.showToast({ title: '取消失败', icon: 'error' });
    }
  },

  /** 申请退款 */
  requestRefund: async (orderId: string, reason: string) => {
    const res = await Taro.showModal({
      title: '申请退款',
      content: '确定要申请退款吗？退款将在3-5个工作日内到账。',
    });
    if (!res.confirm) return;

    try {
      const updated = await orderService.requestRefund(orderId, reason);
      set(state => ({
        orders: state.orders.map(o => o.id === orderId ? updated : o),
        currentOrder: state.currentOrder?.id === orderId ? updated : state.currentOrder,
      }));
      Taro.showToast({ title: '退款申请已提交', icon: 'success' });
    } catch {
      Taro.showToast({ title: '申请失败', icon: 'error' });
    }
  },

  /** 切换订单筛选标签页 */
  setActiveTab: (tab: OrderState['activeTab']) => set({ activeTab: tab }),
}));
