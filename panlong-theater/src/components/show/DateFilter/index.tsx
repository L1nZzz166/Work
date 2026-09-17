import { View, Text, ScrollView } from '@tarojs/components';
import { formatDateShort, formatWeekday, isToday, isTomorrow } from '../../../utils/format';
import { getDateRange } from '../../../utils/format';
import styles from './index.module.scss';

interface DateFilterProps {
  selected: string;
  onChange: (date: string) => void;
  dates?: string[];
}

export default function DateFilter({ selected, onChange, dates }: DateFilterProps) {
  const dateRange = dates || getDateRange(14);

  const getLabel = (dateStr: string) => {
    if (isToday(dateStr)) return '今天';
    if (isTomorrow(dateStr)) return '明天';
    return formatDateShort(dateStr);
  };

  return (
    <ScrollView className={styles.dates} scrollX showScrollbar={false}>
      {dateRange.map(dateStr => (
        <View
          key={dateStr}
          className={`${styles.date} ${selected === dateStr ? styles.active : ''}`}
          onClick={() => onChange(dateStr)}
        >
          <Text className={styles.label}>{getLabel(dateStr)}</Text>
          <Text className={styles.weekday}>{formatWeekday(dateStr)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
