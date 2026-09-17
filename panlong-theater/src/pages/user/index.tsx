import { View, Text } from '@tarojs/components';
import { useMemo } from 'react';
import Taro from '@tarojs/taro';
import { useAuthStore } from '../../stores/useAuthStore';
import { useOrderStore } from '../../stores/useOrderStore';
import NavBar from '../../components/common/NavBar';
import { formatMemberLevel } from '../../utils/format';
import { THEATER_INFO, COLORS } from '../../utils/constants';
import { switchTab } from '../../utils/navigation';
import styles from './index.module.scss';

export default function UserPage() {
  const { isLoggedIn, userInfo, setShowLoginModal, logout } = useAuthStore();
  const { orders } = useOrderStore();

  const orderStats = useMemo(() => {
    const unpaid = orders.filter(o => o.status === 'unpaid').length;
    const paid = orders.filter(o => o.status === 'paid' || o.status === 'completed').length;
    const completed = orders.filter(o => o.status === 'completed').length;
    return { unpaid, paid, completed };
  }, [orders]);

  const memberBg = {
    normal: '#8C7C7C',
    silver: '#A8A8A8',
    gold: '#C9A96E',
    diamond: '#8B1A2B',
  };

  return (
    <View className={styles.page}>
      <NavBar title="我的" />

      {/* 用户头部 */}
      <View
        className={styles.userHeader}
        style={{
          background: userInfo
            ? memberBg[userInfo.memberLevel]
            : '#1A0A0A',
        }}
      >
        {isLoggedIn && userInfo ? (
          <>
            <View className={styles.avatar}>
              <Text className={styles.avatarText}>
                {userInfo.nickName.charAt(0)}
              </Text>
            </View>
            <Text className={styles.nickName}>{userInfo.nickName}</Text>
            <View className={styles.memberBadge}>
              <Text className={styles.memberText}>
                {formatMemberLevel(userInfo.memberLevel)} · {userInfo.memberPoints} 积分
              </Text>
            </View>
          </>
        ) : (
          <View className={styles.loginPrompt} onClick={() => setShowLoginModal(true)}>
            <View className={styles.avatar}>
              <Text className={styles.avatarText}>👤</Text>
            </View>
            <Text className={styles.nickName}>点击登录</Text>
            <Text className={styles.loginHint}>登录享受会员权益</Text>
          </View>
        )}
      </View>

      {/* 订单统计 */}
      {isLoggedIn && (
        <View className={styles.statsCard}>
          <View className={styles.statItem} onClick={() => switchTab('/pages/orders/index')}>
            <Text className={styles.statNum}>{orderStats.unpaid}</Text>
            <Text className={styles.statLabel}>待付款</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem} onClick={() => switchTab('/pages/orders/index')}>
            <Text className={styles.statNum}>{orderStats.paid}</Text>
            <Text className={styles.statLabel}>已出票</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{orderStats.completed}</Text>
            <Text className={styles.statLabel}>已观演</Text>
          </View>
        </View>
      )}

      {/* 功能菜单 */}
      <View className={styles.menuCard}>
        <View className={styles.menuItem} onClick={() => switchTab('/pages/orders/index')}>
          <Text className={styles.menuIcon}>📋</Text>
          <Text className={styles.menuText}>我的订单</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => switchTab('/pages/orders/index')}>
          <Text className={styles.menuIcon}>🎫</Text>
          <Text className={styles.menuText}>我的票夹</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem}>
          <Text className={styles.menuIcon}>❤️</Text>
          <Text className={styles.menuText}>我的收藏</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem}>
          <Text className={styles.menuIcon}>🎁</Text>
          <Text className={styles.menuText}>优惠券</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      {/* 其他 */}
      <View className={styles.menuCard}>
        <View className={styles.menuItem} onClick={() => {
          Taro.showModal({ title: '关于蟠龙剧院', content: THEATER_INFO.description, showCancel: false });
        }}>
          <Text className={styles.menuIcon}>ℹ️</Text>
          <Text className={styles.menuText}>关于蟠龙剧院</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => {
          Taro.makePhoneCall({ phoneNumber: THEATER_INFO.phone });
        }}>
          <Text className={styles.menuIcon}>📞</Text>
          <Text className={styles.menuText}>联系我们</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem}>
          <Text className={styles.menuIcon}>📖</Text>
          <Text className={styles.menuText}>帮助中心</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      {/* 退出登录 */}
      {isLoggedIn && (
        <View className={styles.logoutBtn} onClick={logout}>
          <Text className={styles.logoutText}>退出登录</Text>
        </View>
      )}

      <View className="safe-area-bottom" style={{ height: '40rpx' }} />
    </View>
  );
}
