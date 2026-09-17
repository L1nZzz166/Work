import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

interface NavBarProps {
  title?: string;
  showBack?: boolean;
  background?: string;
  onBack?: () => void;
}

export default function NavBar({
  title = '蟠龙剧院',
  showBack = false,
  background = '#1A0A0A',
  onBack,
}: NavBarProps) {
  const statusBarHeight = Taro.getWindowInfo?.()?.statusBarHeight || 20;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      Taro.navigateBack();
    }
  };

  return (
    <View className={styles.navBar} style={{ paddingTop: `${statusBarHeight}px`, background }}>
      <View className={styles.inner}>
        {showBack && (
          <View className={styles.backBtn} onClick={handleBack}>
            <Text className={styles.backIcon}>‹</Text>
          </View>
        )}
        <Text className={styles.title}>{title}</Text>
        {showBack && <View className={styles.placeholder} />}
      </View>
    </View>
  );
}
