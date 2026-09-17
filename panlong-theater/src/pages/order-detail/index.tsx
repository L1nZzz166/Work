import { View, Text, Canvas } from '@tarojs/components';
import { useEffect } from 'react';
import { useRouter } from '@tarojs/taro';
import Taro from '@tarojs/taro';
import { useOrderStore } from '../../stores/useOrderStore';
import CountdownTimer from '../../components/order/CountdownTimer';
import Loading from '../../components/common/Loading';
import { formatPrice, formatOrderStatus } from '../../utils/format';
import { COLORS } from '../../utils/constants';
import styles from './index.module.scss';

export default function OrderDetailPage() {
  const router = useRouter();
  const orderId = router.params.orderId || '';
  const { currentOrder, isLoading, fetchOrderDetail, payOrder, cancelOrder, requestRefund } = useOrderStore();

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail(orderId);
    }
  }, [orderId]);

  const handlePay = async () => {
    if (!currentOrder) return;
    await payOrder(currentOrder.id);
    fetchOrderDetail(orderId);
  };

  const handleCancel = async () => {
    if (!currentOrder) return;
    await cancelOrder(currentOrder.id);
    fetchOrderDetail(orderId);
  };

  const handleRefund = async () => {
    if (!currentOrder) return;
    await requestRefund(currentOrder.id, '个人原因');
    fetchOrderDetail(orderId);
  };

  if (isLoading || !currentOrder) {
    return <View className={styles.page}><Loading /></View>;
  }

  const order = currentOrder;
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
  const statusIcon: Record<string, string> = {
    unpaid: '⏱️',
    paid: '✅',
    completed: '🎉',
    refunding: '⏳',
    refunded: '↩️',
    cancelled: '❌',
    expired: '⏰',
  };

  return (
    <View className={styles.page}>
      {/* 状态横幅 */}
      <View className={styles.statusBanner} style={{ background: statusColor }}>
        <Text className={styles.statusIcon}>{statusIcon[order.status] || '📋'}</Text>
        <Text className={styles.statusText}>{formatOrderStatus(order.status)}</Text>
        {order.status === 'paid' && (
          <Text className={styles.statusHint}>请凭二维码至剧院取票</Text>
        )}
        {order.status === 'unpaid' && (
          <Text className={styles.statusHint}>请尽快完成支付</Text>
        )}
      </View>

      {/* 二维码（已出票时显示） */}
      {order.status === 'paid' && (
        <View className={styles.qrSection}>
          <View className={styles.qrCode}>
            <Text className={styles.qrPlaceholder}>🎫</Text>
            <Text className={styles.qrText}>取票二维码</Text>
            <Text className={styles.qrCodeText}>PL{order.id}</Text>
          </View>
          <Text className={styles.qrHint}>请向工作人员出示二维码取票</Text>
        </View>
      )}

      {/* 倒计时（未付款时显示） */}
      {order.status === 'unpaid' && order.expiredAt && (
        <View className={styles.section}>
          <CountdownTimer
            expireTimestamp={new Date(order.expiredAt).getTime()}
            onExpire={() => fetchOrderDetail(orderId)}
          />
        </View>
      )}

      {/* 订单信息 */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>订单信息</Text>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>演出</Text>
          <Text className={styles.infoValue}>{order.showTitle}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>场次</Text>
          <Text className={styles.infoValue}>{order.performanceDate} {order.performanceTime}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>场馆</Text>
          <Text className={styles.infoValue}>{order.venue}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>座位</Text>
          <Text className={styles.infoValue}>
            {order.tickets.map(t => t.seatNumber).join('、')}
          </Text>
        </View>
      </View>

      {/* 价格信息 */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>价格信息</Text>
        {order.tickets.map(t => (
          <View key={t.id} className={styles.infoRow}>
            <Text className={styles.infoLabel}>{t.seatNumber} ({t.zone})</Text>
            <Text className={styles.infoValue}>{formatPrice(t.price)}</Text>
          </View>
        ))}
        <View className={styles.divider} />
        <View className={styles.infoRow}>
          <Text className={styles.totalLabel}>总价</Text>
          <Text className={styles.totalValue}>{formatPrice(order.totalAmount)}</Text>
        </View>
      </View>

      {/* 订单元数据 */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>订单详情</Text>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>订单编号</Text>
          <Text className={styles.infoValueSmall}>{order.id}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>下单时间</Text>
          <Text className={styles.infoValueSmall}>{order.createdAt}</Text>
        </View>
        {order.paymentTime && (
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>支付时间</Text>
            <Text className={styles.infoValueSmall}>{order.paymentTime}</Text>
          </View>
        )}
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>联系人</Text>
          <Text className={styles.infoValueSmall}>{order.contactName} {order.contactPhone}</Text>
        </View>
      </View>

      {/* 操作按钮区 */}
      <View className={styles.actions}>
        {order.status === 'unpaid' && (
          <>
            <View className={styles.btnSecondary} onClick={handleCancel}>
              <Text>取消订单</Text>
            </View>
            <View className={styles.btnPrimary} onClick={handlePay}>
              <Text className={styles.btnPrimaryText}>去支付</Text>
            </View>
          </>
        )}
        {order.status === 'paid' && (
          <View className={styles.btnGhost} onClick={handleRefund}>
            <Text className={styles.btnGhostText}>申请退款</Text>
          </View>
        )}
      </View>

      <View className="safe-area-bottom" style={{ height: '80rpx' }} />
    </View>
  );
}
