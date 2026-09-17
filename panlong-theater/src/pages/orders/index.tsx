import { View, Text } from '@tarojs/components';
import { useEffect, useMemo } from 'react';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { useOrderStore } from '../../stores/useOrderStore';
import { useAuthStore } from '../../stores/useAuthStore';
import OrderCard from '../../components/order/OrderCard';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import { navigateTo, NAV_PARAMS } from '../../utils/navigation';
import styles from './index.module.scss';

const TABS = [
  { key: 'all', label: '全部' },
  { key: 'unpaid', label: '待付款' },
  { key: 'paid', label: '已出票' },
  { key: 'refunded', label: '已退款' },
] as const;

export default function OrdersPage() {
  const { orders, activeTab, isLoading, fetchOrders, payOrder, cancelOrder, setActiveTab } = useOrderStore();
  const { isLoggedIn, setShowLoginModal } = useAuthStore();

  useEffect(() => {
    if (isLoggedIn) {
      fetchOrders();
    }
  }, [isLoggedIn]);

  usePullDownRefresh(async () => {
    if (isLoggedIn) {
      await fetchOrders();
    }
    Taro.stopPullDownRefresh();
  });

  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return orders;
    return orders.filter(o => o.status === activeTab);
  }, [orders, activeTab]);

  if (!isLoggedIn) {
    return (
      <View className={styles.page}>
        <EmptyState
          icon="🔒"
          text="请先登录"
          subText="登录后可查看您的订单"
        />
        <View className={styles.loginBtn} onClick={() => setShowLoginModal(true)}>
          <Text className={styles.loginBtnText}>微信一键登录</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      {/* 状态筛选标签 */}
      <View className={styles.tabs}>
        {TABS.map(tab => (
          <View
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text className={styles.tabText}>{tab.label}</Text>
          </View>
        ))}
      </View>

      {/* 订单列表 */}
      <View className={styles.listWrap}>
        {isLoading ? (
          <Loading />
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            icon="📋"
            text="暂无订单"
            subText="快去选一场心仪的演出吧"
          />
        ) : (
          filteredOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => navigateTo(NAV_PARAMS.orderDetail(order.id))}
              onPay={() => payOrder(order.id).then(() => navigateTo(NAV_PARAMS.orderDetail(order.id)))}
              onCancel={() => cancelOrder(order.id)}
              onViewQR={() => navigateTo(NAV_PARAMS.orderDetail(order.id))}
            />
          ))
        )}
      </View>

      <View className="safe-area-bottom" style={{ height: '40rpx' }} />
    </View>
  );
}
