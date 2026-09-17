import { View, Text } from '@tarojs/components';
import { Order, OrderStatus } from '../../../types/order';
import { formatPrice, formatOrderStatus } from '../../../utils/format';
import styles from './index.module.scss';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
  onPay?: () => void;
  onCancel?: () => void;
  onViewQR?: () => void;
}

export default function OrderCard({ order, onClick, onPay, onCancel, onViewQR }: OrderCardProps) {
  const statusColorMap: Record<string, string> = {
    unpaid: '#FF4D4F',
    paid: '#52C41A',
    completed: '#1890FF',
    refunding: '#FAAD14',
    refunded: '#8C7C7C',
    cancelled: '#8C7C7C',
    expired: '#8C7C7C',
  };

  const statusColor = statusColorMap[order.status] || '#8C7C7C';
  const initial = order.showTitle.charAt(0);

  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.header}>
        <View className={styles.poster}>
          <Text className={styles.initial}>{initial}</Text>
        </View>
        <View className={styles.info}>
          <Text className={styles.title}>{order.showTitle}</Text>
          <Text className={styles.meta}>
            {order.performanceDate} {order.performanceTime}
          </Text>
          <Text className={styles.meta}>{order.venue}</Text>
          <Text className={styles.tickets}>{order.ticketCount}张票</Text>
        </View>
        <View className={styles.status} style={{ color: statusColor }}>
          <Text className={styles.statusText}>{formatOrderStatus(order.status)}</Text>
        </View>
      </View>

      {order.tickets.length > 0 && (
        <View className={styles.seats}>
          {order.tickets.map(t => (
            <Text key={t.id} className={styles.seat}>{t.seatNumber}</Text>
          ))}
        </View>
      )}

      <View className={styles.footer}>
        <Text className={styles.orderId}>订单号: {order.id}</Text>
        <Text className={styles.amount}>{formatPrice(order.totalAmount)}</Text>
      </View>

      {/* 操作按钮 */}
      {order.status === 'unpaid' && (
        <View className={styles.actions}>
          {onCancel && (
            <View className={styles.btnGhost} onClick={e => { e.stopPropagation(); onCancel(); }}>
              <Text className={styles.btnGhostText}>取消订单</Text>
            </View>
          )}
          {onPay && (
            <View className={styles.btnPrimary} onClick={e => { e.stopPropagation(); onPay(); }}>
              <Text className={styles.btnPrimaryText}>去支付</Text>
            </View>
          )}
        </View>
      )}
      {order.status === 'paid' && onViewQR && (
        <View className={styles.actions}>
          <View className={styles.btnPrimary} onClick={e => { e.stopPropagation(); onViewQR(); }}>
            <Text className={styles.btnPrimaryText}>查看二维码</Text>
          </View>
        </View>
      )}
    </View>
  );
}
