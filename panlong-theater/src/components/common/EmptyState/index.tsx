import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface EmptyStateProps {
  icon?: string;
  text?: string;
  subText?: string;
}

export default function EmptyState({
  icon = '🎭',
  text = '暂无内容',
  subText,
}: EmptyStateProps) {
  return (
    <View className={styles.empty}>
      <Text className={styles.icon}>{icon}</Text>
      <Text className={styles.text}>{text}</Text>
      {subText && <Text className={styles.subText}>{subText}</Text>}
    </View>
  );
}
