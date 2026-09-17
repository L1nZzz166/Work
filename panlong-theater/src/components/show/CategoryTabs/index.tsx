import { View, Text, ScrollView } from '@tarojs/components';
import { ShowCategory } from '../../../types/show';
import { CATEGORIES } from '../../../utils/constants';
import styles from './index.module.scss';

interface CategoryTabsProps {
  selected: ShowCategory | 'all';
  onChange: (category: ShowCategory | 'all') => void;
}

export default function CategoryTabs({ selected, onChange }: CategoryTabsProps) {
  return (
    <ScrollView className={styles.tabs} scrollX showScrollbar={false}>
      {CATEGORIES.map(cat => (
        <View
          key={cat.key}
          className={`${styles.tab} ${selected === cat.key ? styles.active : ''}`}
          onClick={() => onChange(cat.key as ShowCategory | 'all')}
        >
          <Text className={styles.icon}>{cat.icon}</Text>
          <Text className={styles.name}>{cat.name}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
