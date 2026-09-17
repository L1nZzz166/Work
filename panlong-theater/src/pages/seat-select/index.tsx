import { View, Text } from '@tarojs/components';
import { useEffect } from 'react';
import { useRouter } from '@tarojs/taro';
import Taro from '@tarojs/taro';
import { useSeatStore } from '../../stores/useSeatStore';
import { useShowStore } from '../../stores/useShowStore';
import { useAuthStore } from '../../stores/useAuthStore';
import ScreenCurve from '../../components/seat/ScreenCurve';
import SeatLegend from '../../components/seat/SeatLegend';
import SeatMap from '../../components/seat/SeatMap';
import SeatInfoBar from '../../components/seat/SeatInfoBar';
import Loading from '../../components/common/Loading';
import { getLayoutById } from '../../mock/seats';
import { navigateTo, NAV_PARAMS } from '../../utils/navigation';
import styles from './index.module.scss';

export default function SeatSelectPage() {
  const router = useRouter();
  const performanceId = router.params.performanceId || '';
  const {
    seatLayout, seats, selectedSeats, totalPrice,
    isLayoutLoading, fetchSeatLayout,
    toggleSeat, clearSelection,
  } = useSeatStore();
  const { isLoggedIn, setShowLoginModal } = useAuthStore();
  const { currentShow } = useShowStore();

  useEffect(() => {
    // Determine layout from the performance
    // For now, find the performance in mock data and use its layoutId
    // Using a simple heuristic: if performanceId contains odd number, use large layout
    const layoutId = performanceId.includes('small') ? 'layout_small' : 'layout_large';
    fetchSeatLayout(layoutId);
  }, [performanceId]);

  const handleConfirm = () => {
    if (selectedSeats.length === 0) {
      Taro.showToast({ title: '请先选择座位', icon: 'none' });
      return;
    }
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    const seatIds = selectedSeats.map(s => s.id).join(',');
    navigateTo(NAV_PARAMS.orderConfirm(performanceId, seatIds));
  };

  if (isLayoutLoading || !seatLayout) {
    return (
      <View className={styles.page}>
        <Loading text="加载座位信息..." />
      </View>
    );
  }

  return (
    <View className={styles.page}>
      {/* 顶部演出信息 */}
      <View className={styles.topInfo}>
        <Text className={styles.showTitle}>
          {currentShow?.title || '请选择场次'}
        </Text>
        <Text className={styles.perfInfo}>
          {currentShow?.title ? '蟠龙大剧场' : ''}
        </Text>
      </View>

      {/* 屏幕 */}
      <ScreenCurve />

      {/* 座位图例 */}
      <SeatLegend />

      {/* 座位图 */}
      <SeatMap
        rows={seats}
        zones={seatLayout.zones}
        onSeatClick={toggleSeat}
      />

      {/* 底部选座信息栏 */}
      <SeatInfoBar
        selectedSeats={selectedSeats}
        totalPrice={totalPrice}
        onConfirm={handleConfirm}
        onClear={clearSelection}
      />
    </View>
  );
}
