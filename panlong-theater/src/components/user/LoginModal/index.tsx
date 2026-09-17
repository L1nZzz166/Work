import { View, Text } from '@tarojs/components';
import { useAuthStore } from '../../../stores/useAuthStore';
import styles from './index.module.scss';

export default function LoginModal() {
  const { showLoginModal, isLoggingIn, login, setShowLoginModal } = useAuthStore();

  if (!showLoginModal) return null;

  return (
    <View className={styles.overlay} onClick={() => setShowLoginModal(false)}>
      <View className={styles.modal} onClick={e => e.stopPropagation()}>
        <View className={styles.header}>
          <Text className={styles.logo}>蟠</Text>
          <Text className={styles.brand}>蟠龙剧院</Text>
        </View>

        <Text className={styles.slogan}>登录即可享受更多权益</Text>

        <View className={styles.benefits}>
          <Text className={styles.benefit}>🎫 在线选座购票</Text>
          <Text className={styles.benefit}>🎁 会员专属折扣</Text>
          <Text className={styles.benefit}>📋 订单随时查看</Text>
        </View>

        <View className={styles.loginBtn} onClick={login}>
          {isLoggingIn ? (
            <Text className={styles.loginBtnText}>登录中...</Text>
          ) : (
            <View className={styles.loginBtnContent}>
              <Text className={styles.wechatIcon}>💚</Text>
              <Text className={styles.loginBtnText}>微信一键登录</Text>
            </View>
          )}
        </View>

        <Text className={styles.agreement}>
          登录即同意《用户协议》和《隐私政策》
        </Text>

        <View className={styles.closeBtn} onClick={() => setShowLoginModal(false)}>
          <Text className={styles.closeText}>暂不登录</Text>
        </View>
      </View>
    </View>
  );
}
