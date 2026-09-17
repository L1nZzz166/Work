import { View, Text, Input } from '@tarojs/components';
import { useEffect, useState } from 'react';
import { useRouter } from '@tarojs/taro';
import Taro from '@tarojs/taro';
import { useSeatStore } from '../../stores/useSeatStore';
import { useShowStore } from '../../stores/useShowStore';
import { useOrderStore } from '../../stores/useOrderStore';
import CountdownTimer from '../../components/order/CountdownTimer';
import { formatPrice } from '../../utils/format';
import { SERVICE_FEE_RATE } from '../../utils/constants';
import { redirectTo, NAV_PARAMS } from '../../utils/navigation';
import styles from './index.module.scss';

export default function OrderConfirmPage() {
  const router = useRouter();
  const { selectedSeats, totalPrice } = useSeatStore();
  const { currentShow } = useShowStore();
  const { createOrder, payOrder } = useOrderStore();

  const [contactName, setContactName] = useState('张三');
  const [contactPhone, setContactPhone] = useState('138****8888');

  const serviceFee = Math.round(totalPrice * SERVICE_FEE_RATE);
  const grandTotal = totalPrice + serviceFee;
  const expireTimestamp = Date.now() + 15 * 60 * 1000;

  const handlePay = async () => {
    if (!contactName.trim()) {
      Taro.showToast({ title: '请输入联系人姓名', icon: 'none' });
      return;
    }
    if (!currentShow) return;

    const order = await createOrder({
      performanceId: router.params.performanceId || '',
      showId: currentShow.id,
      showTitle: currentShow.title,
      posterUrl: currentShow.posterUrl,
      performanceDate: '2025-06-01',
      performanceTime: '19:30',
      venue: '蟠龙大剧场',
      seats: selectedSeats.map(s => ({
        id: s.id,
        seatNumber: s.seatNumber,
        zone: s.zone,
        price: s.price,
      })),
      contactName,
      contactPhone,
    });

    if (order) {
      // 模拟微信支付
      Taro.showLoading({ title: '支付中...' });
      setTimeout(async () => {
        Taro.hideLoading();
        await payOrder(order.id);
        Taro.showToast({ title: '支付成功！', icon: 'success' });
        setTimeout(() => {
          redirectTo(NAV_PARAMS.orderDetail(order.id));
        }, 1500);
      }, 1000);
    }
  };

  if (!currentShow || selectedSeats.length === 0) {
    return (
      <View className={styles.page}>
        <View className={styles.empty}>
          <Text>订单信息不存在</Text>
        </View>
      </View>
    );
  }

  const initial = currentShow.title.charAt(0);

  return (
    <View className={styles.page}>
      {/* 演出摘要 */}
      <View className={styles.showSummary}>
        <View className={styles.poster}>
          <Text className={styles.initial}>{initial}</Text>
        </View>
        <View className={styles.summaryInfo}>
          <Text className={styles.summaryTitle}>{currentShow.title}</Text>
          <Text className={styles.summaryMeta}>2025年6月1日 19:30</Text>
          <Text className={styles.summaryMeta}>蟠龙大剧场</Text>
        </View>
      </View>

      {/* 票种明细 */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>票种明细</Text>
        {selectedSeats.map(seat => (
          <View key={seat.id} className={styles.ticketRow}>
            <View className={styles.ticketInfo}>
              <Text className={styles.ticketZone}>
                {seat.zone === 'vip' ? '贵宾区' : seat.zone === 'a' ? 'A区' : seat.zone === 'b' ? 'B区' : 'C区'}
              </Text>
              <Text className={styles.ticketSeat}>{seat.seatNumber}</Text>
            </View>
            <Text className={styles.ticketPrice}>{formatPrice(seat.price)}</Text>
          </View>
        ))}
        <Text className={styles.ticketCount}>共 {selectedSeats.length} 张</Text>
      </View>

      {/* 支付倒计时 */}
      <View className={styles.section}>
        <CountdownTimer expireTimestamp={expireTimestamp} />
      </View>

      {/* 价格摘要 */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>价格明细</Text>
        <View className={styles.priceRow}>
          <Text className={styles.priceLabel}>票面金额</Text>
          <Text className={styles.priceValue}>{formatPrice(totalPrice)}</Text>
        </View>
        <View className={styles.priceRow}>
          <Text className={styles.priceLabel}>服务费 (5%)</Text>
          <Text className={styles.priceValue}>{formatPrice(serviceFee)}</Text>
        </View>
        <View className={styles.priceDivider} />
        <View className={styles.priceRow}>
          <Text className={styles.totalLabel}>合计</Text>
          <Text className={styles.totalValue}>{formatPrice(grandTotal)}</Text>
        </View>
      </View>

      {/* 联系人信息 */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>联系人信息</Text>
        <View className={styles.contactRow}>
          <Text className={styles.contactLabel}>姓名</Text>
          <Input
            className={styles.contactInput}
            value={contactName}
            onInput={e => setContactName(e.detail.value)}
            placeholder="请输入姓名"
          />
        </View>
        <View className={styles.contactRow}>
          <Text className={styles.contactLabel}>手机</Text>
          <Input
            className={styles.contactInput}
            value={contactPhone}
            onInput={e => setContactPhone(e.detail.value)}
            placeholder="请输入手机号"
            type="number"
            maxlength={11}
          />
        </View>
      </View>

      {/* 支付按钮 */}
      <View className={styles.paySection}>
        <View className={styles.payBtn} onClick={handlePay}>
          <Text className={styles.payBtnText}>💳 微信支付 {formatPrice(grandTotal)}</Text>
        </View>
      </View>

      <View className="safe-area-bottom" style={{ height: '40rpx' }} />
    </View>
  );
}
