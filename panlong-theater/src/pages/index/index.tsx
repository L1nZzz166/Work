import { View, Text, Swiper, SwiperItem, ScrollView } from '@tarojs/components';
import { useEffect } from 'react';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { useShowStore } from '../../stores/useShowStore';
import { useAuthStore } from '../../stores/useAuthStore';
import NavBar from '../../components/common/NavBar';
import ShowCard from '../../components/show/ShowCard';
import CategoryTabs from '../../components/show/CategoryTabs';
import Loading from '../../components/common/Loading';
import { ShowCategory } from '../../types/show';
import { COLORS, THEATER_INFO, CATEGORIES } from '../../utils/constants';
import { navigateTo, switchTab } from '../../utils/navigation';
import styles from './index.module.scss';

export default function IndexPage() {
  const { banners, hotShows, upcomingShows, isLoading, fetchHomeData } = useShowStore();
  const { isLoggedIn, setShowLoginModal } = useAuthStore();

  useEffect(() => {
    fetchHomeData();
  }, []);

  usePullDownRefresh(async () => {
    await fetchHomeData();
    Taro.stopPullDownRefresh();
  });

  const handleShowClick = (showId: string) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    navigateTo(`/pages/show-detail/index?showId=${showId}`);
  };

  const handleBannerClick = (linkType: string, linkId?: string) => {
    if (linkType === 'show' && linkId) {
      handleShowClick(linkId);
    }
  };

  const handleSearchClick = () => {
    switchTab('/pages/schedule/index');
  };

  const handleCategoryClick = (category: ShowCategory | 'all') => {
    switchTab('/pages/schedule/index');
  };

  if (isLoading && banners.length === 0) {
    return (
      <View className={styles.page}>
        <NavBar />
        <Loading text="加载中..." />
      </View>
    );
  }

  return (
    <View className={styles.page}>
      {/* 自定义导航栏 */}
      <NavBar title="蟠龙剧院" />

      {/* 搜索栏 */}
      <View className={styles.searchBar} onClick={handleSearchClick}>
        <Text className={styles.searchIcon}>🔍</Text>
        <Text className={styles.searchPlaceholder}>搜索演出...</Text>
      </View>

      {/* 轮播图 */}
      <View className={styles.bannerWrap}>
        <Swiper
          className={styles.swiper}
          indicatorDots
          indicatorColor="#E8E0D5"
          indicatorActiveColor="#8B1A2B"
          autoplay
          interval={4000}
          circular
        >
          {banners.map(banner => (
            <SwiperItem key={banner.id} className={styles.swiperItem}>
              <View
                className={styles.bannerCard}
                onClick={() => handleBannerClick(banner.linkType, banner.linkId)}
              >
                <View className={styles.bannerContent}>
                  <Text className={styles.bannerTitle}>{banner.title}</Text>
                  {banner.subtitle && (
                    <Text className={styles.bannerSubtitle}>{banner.subtitle}</Text>
                  )}
                </View>
              </View>
            </SwiperItem>
          ))}
        </Swiper>
      </View>

      {/* 分类入口 */}
      <View className={styles.section}>
        <CategoryTabs
          selected="all"
          onChange={handleCategoryClick}
        />
      </View>

      {/* 近期上演 */}
      {hotShows.length > 0 && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>近期上演</Text>
            <Text
              className={styles.sectionMore}
              onClick={handleSearchClick}
            >
              更多 ›
            </Text>
          </View>
          <ScrollView className={styles.hShowList} scrollX showScrollbar={false}>
            {hotShows.map(show => (
              <ShowCard
                key={show.id}
                show={show}
                variant="horizontal"
                onClick={() => handleShowClick(show.id)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* 重磅推荐 */}
      {hotShows.length > 0 && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>重磅推荐</Text>
          </View>
          <View className={styles.gShowList}>
            {hotShows.slice(0, 4).map(show => (
              <View key={show.id} className={styles.gShowItem}>
                <ShowCard
                  show={show}
                  variant="grid"
                  onClick={() => handleShowClick(show.id)}
                />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 即将开售 */}
      {upcomingShows.length > 0 && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>即将开售</Text>
          </View>
          {upcomingShows.map(show => (
            <ShowCard
              key={show.id}
              show={show}
              variant="list"
              onClick={() => handleShowClick(show.id)}
            />
          ))}
        </View>
      )}

      {/* 剧院信息 */}
      <View className={styles.section}>
        <View className={styles.theaterCard}>
          <Text className={styles.theaterTitle}>🏛️ {THEATER_INFO.name}</Text>
          <Text className={styles.theaterInfo}>📍 {THEATER_INFO.address}</Text>
          <Text className={styles.theaterInfo}>📞 {THEATER_INFO.phone}</Text>
          <Text className={styles.theaterInfo}>⏰ 营业时间 {THEATER_INFO.hours}</Text>
        </View>
      </View>

      {/* 底部安全区 */}
      <View className="safe-area-bottom" style={{ height: '40rpx' }} />
    </View>
  );
}
