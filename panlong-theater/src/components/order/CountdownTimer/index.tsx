import { View, Text } from '@tarojs/components';
import { useEffect, useState } from 'react';
import { formatTimeLeft } from '../../../utils/format';
import styles from './index.module.scss';

interface CountdownTimerProps {
  expireTimestamp: number;
  onExpire?: () => void;
}

export default function CountdownTimer({ expireTimestamp, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const total = 15 * 60 * 1000; // 15 min total

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = expireTimestamp - now;

      if (diff <= 0) {
        setTimeLeft('已过期');
        setProgress(0);
        clearInterval(timer);
        onExpire?.();
        return;
      }

      setTimeLeft(formatTimeLeft(expireTimestamp));
      setProgress(Math.max(0, (diff / total) * 100));
    }, 1000);

    return () => clearInterval(timer);
  }, [expireTimestamp, onExpire]);

  const isUrgent = progress < 30;

  return (
    <View className={styles.timer}>
      <View className={styles.labelRow}>
        <Text className={styles.icon}>⏱</Text>
        <Text className={styles.label}>剩余支付时间</Text>
        <Text className={`${styles.time} ${isUrgent ? styles.urgent : ''}`}>
          {timeLeft}
        </Text>
      </View>
      <View className={styles.progressBar}>
        <View
          className={`${styles.progressFill} ${isUrgent ? styles.urgentFill : ''}`}
          style={{ width: `${progress}%` }}
        />
      </View>
    </View>
  );
}
