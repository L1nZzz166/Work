import { View, Text, Input } from '@tarojs/components';
import { useEffect, useState } from 'react';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { useShowStore } from '../../stores/useShowStore';
import { useAuthStore } from '../../stores/useAuthStore';
import CategoryTabs from '../../components/show/CategoryTabs';
import DateFilter from '../../components/show/DateFilter';
import ShowCard from '../../components/show/ShowCard';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import { ShowCategory } from '../../types/show';
import { navigateTo } from '../../utils/navigation';
import styles from './index.module.scss';

export default function SchedulePage() {
  const {
    filteredShows, selectedCategory, selectedDate,
    searchKeyword, isLoading, fetchAllShows,
    setCategory, setDate, setSearchKeyword,
  } = useShowStore();
  const { isLoggedIn, setShowLoginModal } = useAuthStore();
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    fetchAllShows();
  }, []);

  usePullDownRefresh(async () => {
    await fetchAllShows();
    Taro.stopPullDownRefresh();
  });

  const handleShowClick = (showId: string) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    navigateTo(`/pages/show-detail/index?showId=${showId}`);
  };

  return (
    <View className={styles.page}>
      {/* 搜索栏 */}
      <View className={styles.searchRow}>
        {showSearch ? (
          <View className={styles.searchActive}>
            <Input
              className={styles.searchInput}
              placeholder="搜索演出、演员、剧团..."
              value={searchKeyword}
              onInput={e => setSearchKeyword(e.detail.value)}
              focus
            />
            <Text className={styles.cancelBtn} onClick={() => { setShowSearch(false); setSearchKeyword(''); }}>
              取消
            </Text>
          </View>
        ) : (
          <View className={styles.searchBar} onClick={() => setShowSearch(true)}>
            <Text className={styles.searchIcon}>🔍</Text>
            <Text className={styles.searchPlaceholder}>搜索演出...</Text>
          </View>
        )}
      </View>

      {/* 分类标签 */}
      <CategoryTabs selected={selectedCategory} onChange={setCategory} />

      {/* 日期筛选 */}
      <DateFilter selected={selectedDate} onChange={setDate} />

      {/* 结果数量 */}
      <View className={styles.resultCount}>
        <Text className={styles.countText}>共 {filteredShows.length} 部演出</Text>
      </View>

      {/* 演出列表 */}
      <View className={styles.listWrap}>
        {isLoading ? (
          <Loading />
        ) : filteredShows.length === 0 ? (
          <EmptyState
            icon="🎭"
            text="暂无符合条件的演出"
            subText="换个筛选条件试试吧"
          />
        ) : (
          filteredShows.map(show => (
            <ShowCard
              key={show.id}
              show={show}
              variant="list"
              onClick={() => handleShowClick(show.id)}
            />
          ))
        )}
      </View>

      <View className="safe-area-bottom" style={{ height: '40rpx' }} />
    </View>
  );
}
