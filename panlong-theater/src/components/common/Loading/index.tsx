import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface LoadingProps {
  text?: string;
}

export default function Loading({ text = '加载中...' }: LoadingProps) {
  return (
    <View className={styles.loading}>
      <View className={styles.spinner}>
        <View className={styles.dot} />
        <View className={styles.dot} />
        <View className={styles.dot} />
      </View>
      <Text className={styles.text}>{text}</Text>
    </View>
  );
}
