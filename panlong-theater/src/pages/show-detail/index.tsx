import { View, Text, ScrollView } from '@tarojs/components';
import { useEffect } from 'react';
import { useRouter } from '@tarojs/taro';
import { useShowStore } from '../../stores/useShowStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useSeatStore } from '../../stores/useSeatStore';
import Loading from '../../components/common/Loading';
import { formatPrice, formatDuration, formatCategory, formatDateFull } from '../../utils/format';
import { navigateTo, NAV_PARAMS } from '../../utils/navigation';
import { COLORS, THEATER_INFO } from '../../utils/constants';
import styles from './index.module.scss';

export default function ShowDetailPage() {
  const router = useRouter();
  const showId = router.params.showId || '';
  const { currentShow, currentShowPerformances, isLoading, fetchShowDetail } = useShowStore();
  const { isLoggedIn, setShowLoginModal } = useAuthStore();
  const { clearSelection } = useSeatStore();

  useEffect(() => {
    if (showId) {
      fetchShowDetail(showId);
    }
  }, [showId]);

  const handleBuyTicket = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    if (!currentShowPerformances || currentShowPerformances.length === 0) {
      return;
    }
    clearSelection();
    const perf = currentShowPerformances[0];
    navigateTo(NAV_PARAMS.seatSelect(perf.id));
  };

  if (isLoading || !currentShow) {
    return <View className={styles.page}><Loading /></View>;
  }

  const show = currentShow;
  const performances = currentShowPerformances;
  const initial = show.title.charAt(0);

  return (
    <View className={styles.page}>
      {/* 海报区域 */}
      <View className={styles.posterSection}>
        <View className={styles.poster}>
          <Text className={styles.posterInitial}>{initial}</Text>
        </View>
        <View className={styles.posterOverlay}>
          <Text className={styles.posterTitle}>{show.title}</Text>
          {show.subtitle && <Text className={styles.posterSubtitle}>{show.subtitle}</Text>}
          <View className={styles.posterMeta}>
            <Text className={styles.posterRating}>⭐ {show.rating}</Text>
            <Text className={styles.posterCount}>({show.ratingCount}人评价)</Text>
            <Text className={styles.posterCat}>{formatCategory(show.category)}</Text>
            <Text className={styles.posterDuration}>| {formatDuration(show.duration)}</Text>
          </View>
          {show.language && <Text className={styles.posterLang}>{show.language}</Text>}
        </View>
      </View>

      {/* 场次信息 */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>场次信息</Text>
        <View className={styles.venueCard}>
          <Text className={styles.venueName}>📍 {performances.length > 0 ? performances[0].venue : '蟠龙大剧场'}</Text>
          {performances.length > 0 && (
            <View className={styles.venueDates}>
              {performances.slice(0, 5).map(p => (
                <Text key={p.id} className={styles.venueDate}>
                  {formatDateFull(p.date)} {p.time}
                </Text>
              ))}
              {performances.length > 5 && (
                <Text className={styles.venueMore}>等 {performances.length} 个场次</Text>
              )}
            </View>
          )}
        </View>
      </View>

      {/* 演员阵容 */}
      {show.castList.length > 0 && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>演员阵容</Text>
          <ScrollView className={styles.castList} scrollX showScrollbar={false}>
            {show.castList.map(cast => (
              <View key={cast.id} className={styles.castItem}>
                <View className={styles.castAvatar}>
                  <Text className={styles.castInitial}>{cast.name.charAt(0)}</Text>
                </View>
                <Text className={styles.castName}>{cast.name}</Text>
                <Text className={styles.castRole}>{cast.role}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 演出介绍 */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>演出介绍</Text>
        <Text className={styles.description}>{show.fullDescription}</Text>
      </View>

      {/* 观演须知 */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>观演须知</Text>
        <View className={styles.noticeCard}>
          {show.notice.split('。').filter(Boolean).map((line, i) => (
            <Text key={i} className={styles.noticeItem}>• {line.trim()}</Text>
          ))}
        </View>
      </View>

      {/* 标签 */}
      <View className={styles.section}>
        <View className={styles.tags}>
          {show.tags.map(tag => (
            <Text key={tag} className={styles.tag}>{tag}</Text>
          ))}
        </View>
      </View>

      {/* 底部购票栏 */}
      <View className={styles.bottomBar}>
        <View className={styles.priceInfo}>
          <Text className={styles.priceLabel}>票价</Text>
          <Text className={styles.price}>
            {formatPrice(show.minPrice)} - {formatPrice(show.maxPrice)}
          </Text>
        </View>
        <View
          className={`${styles.buyBtn} ${!isLoggedIn ? styles.buyBtnDisabled : ''}`}
          onClick={handleBuyTicket}
        >
          <Text className={styles.buyBtnText}>
            {show.status === 'on_sale' ? '立即购票' : show.status === 'coming_soon' ? '即将开售' : '已结束'}
          </Text>
        </View>
      </View>

      <View className="safe-area-bottom" style={{ height: '120rpx' }} />
    </View>
  );
}
