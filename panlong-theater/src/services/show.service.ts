import { mockApi } from '../utils/mock';
import { MOCK_SHOWS } from '../mock/shows';
import { MOCK_PERFORMANCES, getPerformancesByShowId } from '../mock/schedules';
import { MOCK_BANNERS } from '../mock/banners';
import { Show, Performance } from '../types/show';
import { Banner } from '../types/user';

export const showService = {
  /** 获取首页数据 */
  async getHomeData(): Promise<{
    banners: Banner[];
    hotShows: Show[];
    upcomingShows: Show[];
  }> {
    await mockApi(null);
    const hotShows = MOCK_SHOWS.filter(s => s.isHot && s.status !== 'ended');
    const upcomingShows = MOCK_SHOWS.filter(s => s.status === 'coming_soon');
    return {
      banners: [...MOCK_BANNERS],
      hotShows: hotShows.map(s => ({ ...s })),
      upcomingShows: upcomingShows.map(s => ({ ...s })),
    };
  },

  /** 获取所有演出 */
  async getAllShows(): Promise<Show[]> {
    await mockApi(null);
    return MOCK_SHOWS.filter(s => s.status !== 'ended').map(s => ({ ...s }));
  },

  /** 获取演出详情 */
  async getShowDetail(showId: string): Promise<{ show: Show; performances: Performance[] }> {
    await mockApi(null);
    const show = MOCK_SHOWS.find(s => s.id === showId);
    if (!show) throw new Error('演出不存在');
    const performances = getPerformancesByShowId(showId);
    return { show: { ...show }, performances: performances.map(p => ({ ...p })) };
  },

  /** 获取场次列表 */
  async getPerformances(showId: string): Promise<Performance[]> {
    await mockApi(null);
    return getPerformancesByShowId(showId).map(p => ({ ...p }));
  },

  /** 根据分类过滤演出 */
  async filterShows(keyword?: string, category?: string, date?: string): Promise<Show[]> {
    await mockApi(null, 200);
    let filtered = MOCK_SHOWS.filter(s => s.status !== 'ended');

    if (keyword) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(kw) ||
        s.tags.some(t => t.toLowerCase().includes(kw)) ||
        s.description.toLowerCase().includes(kw)
      );
    }

    if (category && category !== 'all') {
      filtered = filtered.filter(s => s.category === category);
    }

    return filtered.map(s => ({ ...s }));
  },
};
