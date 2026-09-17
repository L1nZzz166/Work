import { Performance, ShowStatus } from '../types/show';

// 生成 14 天的排期
function generatePerformances(): Performance[] {
  const performances: Performance[] = [];
  const today = new Date();
  let perfIndex = 1;

  // 排期配置：[showId, venue, layoutId, baseDayOffset, gapDays, timesPerDay]
  const scheduleConfig: [string, string, string, number, number, string[]][] = [
    ['show_001', '蟠龙大剧场', 'layout_large', 0, 2, ['14:30', '19:30']],
    ['show_001', '蟠龙小剧场', 'layout_small', 1, 3, ['19:00']],
    ['show_002', '蟠龙大剧场', 'layout_large', 0, 1, ['19:30']],
    ['show_002', '蟠龙大剧场', 'layout_large', 2, 1, ['14:00', '19:30']],
    ['show_003', '蟠龙大剧场', 'layout_large', 1, 2, ['19:30']],
    ['show_003', '蟠龙小剧场', 'layout_small', 3, 3, ['15:00', '20:00']],
    ['show_004', '蟠龙小剧场', 'layout_small', 0, 2, ['19:00']],
    ['show_004', '蟠龙大剧场', 'layout_large', 2, 3, ['19:30']],
    ['show_005', '蟠龙大剧场', 'layout_large', 3, 3, ['19:30']],
    ['show_006', '蟠龙小剧场', 'layout_small', 1, 2, ['19:00']],
    ['show_006', '蟠龙小剧场', 'layout_small', 4, 3, ['14:00', '19:00']],
    ['show_007', '蟠龙小剧场', 'layout_small', 0, 1, ['10:30', '14:30', '16:30']],
    ['show_008', '蟠龙大剧场', 'layout_large', 10, 2, ['19:30']],
  ];

  for (const [showId, venue, layoutId, baseDay, gap, times] of scheduleConfig) {
    for (let d = baseDay; d < 14; d += gap) {
      const date = new Date(today);
      date.setDate(date.getDate() + d);
      const dateStr = formatISODate(date);

      for (const time of times) {
        const [h, m] = time.split(':').map(Number);
        const endH = m + 150; // assume ~2.5h
        const endTime = `${(h + Math.floor(endH / 60) + (endH % 60 > 0 ? 1 : 0)).toString().padStart(2, '0')}:${(endH % 60).toString().padStart(2, '0')}`;

        performances.push({
          id: `perf_${perfIndex.toString().padStart(4, '0')}`,
          showId,
          date: dateStr,
          time,
          endTime,
          venue,
          status: ShowStatus.ON_SALE,
          seatLayoutId: layoutId,
          availableSeats: Math.floor(Math.random() * 100) + 20,
          totalSeats: layoutId === 'layout_large' ? 480 : 180,
          note: d === 0 ? '今日场次' : d <= 3 ? '热卖中' : undefined,
        });
        perfIndex++;
      }
    }
  }

  return performances;
}

function formatISODate(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const MOCK_PERFORMANCES: Performance[] = generatePerformances();

// 按 showId 分组
export function getPerformancesByShowId(showId: string): Performance[] {
  return MOCK_PERFORMANCES.filter(p => p.showId === showId);
}

// 按日期过滤
export function getPerformancesByDate(date: string): Performance[] {
  return MOCK_PERFORMANCES.filter(p => p.date === date);
}
