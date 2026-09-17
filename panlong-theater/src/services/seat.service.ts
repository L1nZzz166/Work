import { mockApi } from '../utils/mock';
import { getLayoutById, getSeatSnapshot } from '../mock/seats';
import { SeatLayout } from '../types/seat';

export const seatService = {
  /** 获取某场次的座位布局（含已售信息） */
  async getSeatLayout(layoutId: string): Promise<SeatLayout> {
    await mockApi(null);
    return getSeatSnapshot(layoutId);
  },

  /** 获取座位原始布局（无已售信息） */
  async getRawLayout(layoutId: string): Promise<SeatLayout> {
    await mockApi(null);
    return getLayoutById(layoutId);
  },
};
