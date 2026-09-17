import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

export default function ScreenCurve() {
  return (
    <View className={styles.wrapper}>
      <View className={styles.curve}>
        <Text className={styles.label}>屏  幕</Text>
      </View>
    </View>
  );
}
