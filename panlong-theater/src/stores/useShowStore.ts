import { create } from 'zustand';
import { Show, Performance, ShowCategory } from '../types/show';
import { Banner } from '../types/user';
import { showService } from '../services/show.service';
import { getToday } from '../utils/format';
import Taro from '@tarojs/taro';

interface ShowState {
  // 首页数据
  banners: Banner[];
  hotShows: Show[];
  upcomingShows: Show[];

  // 排期页数据
  allShows: Show[];
  filteredShows: Show[];
  selectedCategory: ShowCategory | 'all';
  selectedDate: string;
  searchKeyword: string;
  isLoading: boolean;

  // 详情页数据
  currentShow: Show | null;
  currentShowPerformances: Performance[];

  // 操作
  fetchHomeData: () => Promise<void>;
  fetchAllShows: () => Promise<void>;
  fetchShowDetail: (showId: string) => Promise<void>;
  setCategory: (category: ShowCategory | 'all') => void;
  setDate: (date: string) => void;
  setSearchKeyword: (keyword: string) => void;
  applyFilters: () => void;
}

export const useShowStore = create<ShowState>((set, get) => ({
  banners: [],
  hotShows: [],
  upcomingShows: [],
  allShows: [],
  filteredShows: [],
  selectedCategory: 'all',
  selectedDate: getToday(),
  searchKeyword: '',
  isLoading: false,
  currentShow: null,
  currentShowPerformances: [],

  /** 获取首页数据 */
  fetchHomeData: async () => {
    set({ isLoading: true });
    try {
      const data = await showService.getHomeData();
      set({
        banners: data.banners,
        hotShows: data.hotShows,
        upcomingShows: data.upcomingShows,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
      Taro.showToast({ title: '加载失败，请下拉刷新', icon: 'none' });
    }
  },

  /** 获取所有演出 */
  fetchAllShows: async () => {
    set({ isLoading: true });
    try {
      const shows = await showService.getAllShows();
      set({ allShows: shows, isLoading: false });
      get().applyFilters();
    } catch {
      set({ isLoading: false });
    }
  },

  /** 获取演出详情 */
  fetchShowDetail: async (showId: string) => {
    set({ isLoading: true });
    try {
      const data = await showService.getShowDetail(showId);
      set({
        currentShow: data.show,
        currentShowPerformances: data.performances,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
      Taro.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  /** 设置分类筛选 */
  setCategory: (category: ShowCategory | 'all') => {
    set({ selectedCategory: category });
    get().applyFilters();
  },

  /** 设置日期筛选 */
  setDate: (date: string) => {
    set({ selectedDate: date });
  },

  /** 设置搜索关键词 */
  setSearchKeyword: (keyword: string) => {
    set({ searchKeyword: keyword });
    get().applyFilters();
  },

  /** 应用筛选条件 */
  applyFilters: () => {
    const { allShows, selectedCategory, searchKeyword } = get();
    let filtered = [...allShows];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(kw) ||
        s.tags.some(t => t.toLowerCase().includes(kw)) ||
        s.description.toLowerCase().includes(kw)
      );
    }

    set({ filteredShows: filtered });
  },
}));
