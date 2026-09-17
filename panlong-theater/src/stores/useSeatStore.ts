import { create } from 'zustand';
import { SeatLayout, Seat, SeatStatus } from '../types/seat';
import { seatService } from '../services/seat.service';
import { SEAT_LIMITS } from '../utils/constants';
import Taro from '@tarojs/taro';

interface SeatState {
  seatLayout: SeatLayout | null;
  seats: Seat[][];
  selectedSeats: Seat[];
  maxSelect: number;
  totalPrice: number;
  isLayoutLoading: boolean;

  fetchSeatLayout: (performanceId: string) => Promise<void>;
  toggleSeat: (seatId: string) => void;
  clearSelection: () => void;
  getSelectedSeatIds: () => string;
}

export const useSeatStore = create<SeatState>((set, get) => ({
  seatLayout: null,
  seats: [],
  selectedSeats: [],
  maxSelect: SEAT_LIMITS.MAX_SELECT,
  totalPrice: 0,
  isLayoutLoading: false,

  /** 加载座位布局 */
  fetchSeatLayout: async (layoutId: string) => {
    set({ isLayoutLoading: true });
    try {
      const layout = await seatService.getSeatLayout(layoutId);
      set({
        seatLayout: layout,
        seats: layout.seats,
        selectedSeats: [],
        totalPrice: 0,
        isLayoutLoading: false,
      });
    } catch {
      set({ isLayoutLoading: false });
      Taro.showToast({ title: '加载座位信息失败', icon: 'none' });
    }
  },

  /** 切换座位选中状态 */
  toggleSeat: (seatId: string) => {
    const { seats, selectedSeats, maxSelect } = get();

    // 在座位矩阵中查找，返回深拷贝以便不可变更新
    let targetSeat: Seat | null = null;
    let targetRow = -1;
    let targetCol = -1;

    for (let r = 0; r < seats.length; r++) {
      for (let c = 0; c < seats[r].seats.length; c++) {
        if (seats[r].seats[c].id === seatId) {
          targetSeat = seats[r].seats[c];
          targetRow = r;
          targetCol = c;
          break;
        }
      }
      if (targetSeat) break;
    }

    if (!targetSeat) return;

    // 不可点击状态
    if (targetSeat.status === SeatStatus.SOLD ||
        targetSeat.status === SeatStatus.LOCKED ||
        targetSeat.status === SeatStatus.AISLE ||
        targetSeat.status === SeatStatus.DISABLED) {
      Taro.vibrateShort({ type: 'light' });
      return;
    }

    const newSeats = seats.map(row => ({
      ...row,
      seats: row.seats.map(s => ({ ...s })),
    }));
    let newSelected: Seat[] = selectedSeats.map(s => ({ ...s }));

    if (targetSeat.status === SeatStatus.SELECTED) {
      // 取消选中
      newSeats[targetRow].seats[targetCol].status = SeatStatus.AVAILABLE;
      newSelected = newSelected.filter(s => s.id !== seatId);
    } else {
      // 选中
      if (newSelected.length >= maxSelect) {
        Taro.showToast({ title: `最多选择${maxSelect}个座位`, icon: 'none' });
        return;
      }
      newSeats[targetRow].seats[targetCol].status = SeatStatus.SELECTED;
      newSelected.push({ ...targetSeat, status: SeatStatus.SELECTED });
    }

    const totalPrice = newSelected.reduce((sum, s) => sum + s.price, 0);

    set({
      seats: newSeats,
      selectedSeats: newSelected,
      totalPrice,
    });

    Taro.vibrateShort({ type: 'light' });
  },

  /** 清空选择 */
  clearSelection: () => {
    const { seats } = get();
    const newSeats = seats.map(row => ({
      ...row,
      seats: row.seats.map(s => ({
        ...s,
        status: s.status === SeatStatus.SELECTED ? SeatStatus.AVAILABLE : s.status,
      })),
    }));
    set({ seats: newSeats, selectedSeats: [], totalPrice: 0 });
  },

  /** 获取已选座位 ID 字符串（逗号分隔） */
  getSelectedSeatIds: () => {
    return get().selectedSeats.map(s => s.id).join(',');
  },
}));
