import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

export default function SeatLegend() {
  const items = [
    { color: '#E8F5E9', border: '#66BB6A', label: '可选' },
    { color: '#EEEEEE', border: '#E0E0E0', label: '已售' },
    { color: '#8B1A2B', border: '#6B1320', label: '已选' },
    { color: 'transparent', border: 'transparent', label: '过道' },
  ];

  return (
    <View className={styles.legend}>
      {items.map(item => (
        <View key={item.label} className={styles.item}>
          <View
            className={styles.block}
            style={{
              background: item.color,
              borderColor: item.border,
            }}
          />
          <Text className={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}
