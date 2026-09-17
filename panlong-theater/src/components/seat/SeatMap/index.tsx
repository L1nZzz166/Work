import { View, Text, ScrollView } from '@tarojs/components';
import { SeatRow, SeatStatus, SeatZoneConfig } from '../../../types/seat';
import { formatPrice } from '../../../utils/format';
import styles from './index.module.scss';

interface SeatMapProps {
  rows: SeatRow[];
  zones: SeatZoneConfig[];
  onSeatClick: (seatId: string) => void;
}

export default function SeatMap({ rows, zones, onSeatClick }: SeatMapProps) {
  const getSeatClass = (status: SeatStatus) => {
    switch (status) {
      case SeatStatus.AVAILABLE: return styles.available;
      case SeatStatus.SOLD: return styles.sold;
      case SeatStatus.SELECTED: return styles.selected;
      case SeatStatus.LOCKED: return styles.locked;
      case SeatStatus.AISLE: return styles.aisle;
      case SeatStatus.DISABLED: return styles.disabled;
      default: return styles.available;
    }
  };

  const getRowLabel = (rowIndex: number, rowLabel: string) => {
    // 只在每排的开始和隔行显示排号
    return rowLabel;
  };

  return (
    <ScrollView className={styles.map} scrollX scrollY>
      <View className={styles.stage}>
        {/* 区域标签 */}
        {zones.map(zone => (
          <View
            key={zone.zone}
            className={styles.zoneLabel}
            style={{ top: `${zone.rowStart * 72 + 20}rpx` }}
          >
            <Text className={styles.zoneName}>{zone.name}</Text>
            <Text className={styles.zonePrice}>{formatPrice(zone.price)}</Text>
          </View>
        ))}

        {/* 座位网格 */}
        <View className={styles.grid}>
          {rows.map((row, ri) => (
            <View key={ri} className={styles.row}>
              <View className={styles.rowLabel}>
                <Text className={styles.rowLabelText}>{getRowLabel(ri, row.rowLabel)}</Text>
              </View>
              <View className={styles.seatsRow}>
                {row.seats.map(seat => {
                  if (seat.status === SeatStatus.AISLE) {
                    return <View key={seat.id} className={styles.aisleSpace} />;
                  }
                  return (
                    <View
                      key={seat.id}
                      className={`${styles.seat} ${getSeatClass(seat.status)}`}
                      onClick={() => onSeatClick(seat.id)}
                    >
                      <Text className={styles.seatNum}>{seat.colLabel}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
