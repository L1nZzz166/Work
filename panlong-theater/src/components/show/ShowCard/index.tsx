import { View, Text, Image } from '@tarojs/components';
import { Show, ShowCategory } from '../../../types/show';
import { formatPrice, formatCategory } from '../../../utils/format';
import { COLORS } from '../../../utils/constants';
import styles from './index.module.scss';

interface ShowCardProps {
  show: Show;
  variant?: 'list' | 'grid' | 'horizontal';
  onClick?: () => void;
}

// 类别主题色映射
const categoryColors: Record<string, string> = {
  opera: '#8B2252',
  drama: '#8B4513',
  dance: '#483D8B',
  concert: '#2F4F4F',
  chinese_opera: '#B22222',
  musical: '#CD853F',
  children: '#228B22',
  crossover: '#6A5ACD',
};

export default function ShowCard({ show, variant = 'list', onClick }: ShowCardProps) {
  const catColor = categoryColors[show.category] || COLORS.PRIMARY;
  const catName = formatCategory(show.category);

  // 海报首字
  const initial = show.title.charAt(0);

  if (variant === 'horizontal') {
    return (
      <View className={styles.horizontal} onClick={onClick}>
        <View className={styles.hPoster}>
          <Text className={styles.hInitial}>{initial}</Text>
        </View>
        <View className={styles.hInfo}>
          <Text className={styles.hTitle}>{show.title}</Text>
          {show.subtitle && <Text className={styles.hSubtitle}>{show.subtitle}</Text>}
          <Text className={styles.hDate}>
            {formatPrice(show.minPrice)} - {formatPrice(show.maxPrice)}
          </Text>
        </View>
      </View>
    );
  }

  if (variant === 'grid') {
    return (
      <View className={styles.grid} onClick={onClick}>
        <View className={styles.gPoster}>
          <Text className={styles.gInitial}>{initial}</Text>
          {show.isNew && <Text className={styles.gBadge}>新上</Text>}
          {show.isHot && !show.isNew && <Text className={styles.gBadgeHot}>热推</Text>}
        </View>
        <View className={styles.gInfo}>
          <Text className={styles.gTitle}>{show.title}</Text>
          <View className={styles.gTags}>
            <Text className={styles.gCat} style={{ color: catColor }}>{catName}</Text>
            <Text className={styles.gRating}>⭐ {show.rating}</Text>
          </View>
          <Text className={styles.gPrice}>
            {formatPrice(show.minPrice)}起
          </Text>
        </View>
      </View>
    );
  }

  // list variant (default)
  return (
    <View className={styles.list} onClick={onClick}>
      <View className={styles.lPoster}>
        <Text className={styles.lInitial}>{initial}</Text>
      </View>
      <View className={styles.lInfo}>
        <View className={styles.lHeader}>
          <Text className={styles.lTitle}>{show.title}</Text>
          {show.subtitle && <Text className={styles.lSubtitle}>{show.subtitle}</Text>}
        </View>
        <View className={styles.lMeta}>
          <Text className={styles.lCat} style={{ color: catColor }}>{catName}</Text>
          <Text className={styles.lDuration}>| {show.duration}分钟</Text>
          {show.language && <Text className={styles.lLang}>| {show.language}</Text>}
        </View>
        <View className={styles.lFooter}>
          <View className={styles.lRating}>
            <Text className={styles.lStars}>⭐ {show.rating}</Text>
            <Text className={styles.lCount}>({show.ratingCount})</Text>
          </View>
          <Text className={styles.lPrice}>
            <Text className={styles.lPriceLabel}>¥</Text>
            {show.minPrice / 100}
            <Text className={styles.lPriceSep}> - </Text>
            <Text className={styles.lPriceLabel}>¥</Text>
            {show.maxPrice / 100}
          </Text>
        </View>
        {show.tags.length > 0 && (
          <View className={styles.lTags}>
            {show.tags.slice(0, 3).map(tag => (
              <Text key={tag} className={styles.lTag}>{tag}</Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
