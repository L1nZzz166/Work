import { View, Text, ScrollView } from '@tarojs/components';
import { Seat } from '../../../types/seat';
import { formatPrice } from '../../../utils/format';
import styles from './index.module.scss';

interface SeatInfoBarProps {
  selectedSeats: Seat[];
  totalPrice: number;
  onConfirm: () => void;
  onClear?: () => void;
}

export default function SeatInfoBar({
  selectedSeats,
  totalPrice,
  onConfirm,
  onClear,
}: SeatInfoBarProps) {
  if (selectedSeats.length === 0) {
    return (
      <View className={styles.bar}>
        <View className={styles.empty}>
          <Text className={styles.emptyText}>请选择座位</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.bar}>
      <View className={styles.seatsRow}>
        <ScrollView scrollX showScrollbar={false} className={styles.seatsScroll}>
          {selectedSeats.map(seat => (
            <View key={seat.id} className={styles.seatTag}>
              <Text className={styles.seatNum}>{seat.seatNumber}</Text>
              <Text className={styles.seatPrice}>{formatPrice(seat.price)}</Text>
            </View>
          ))}
        </ScrollView>
        {onClear && (
          <View className={styles.clearBtn} onClick={onClear}>
            <Text className={styles.clearText}>清除</Text>
          </View>
        )}
      </View>
      <View className={styles.bottomRow}>
        <Text className={styles.total}>
          合计 <Text className={styles.totalPrice}>{formatPrice(totalPrice)}</Text>
        </Text>
        <View className={styles.confirmBtn} onClick={onConfirm}>
          <Text className={styles.confirmText}>确认选座</Text>
        </View>
      </View>
    </View>
  );
}
