import { SeatLayout, SeatRow, Seat, SeatStatus, SeatZone, SeatZoneConfig } from '../types/seat';
import { formatSeatNumber } from '../utils/format';
import { SEAT_LIMITS } from '../utils/constants';

// ========== 大剧场布局：蟠龙大剧场 (18行 x 26列) ==========
function generateLargeTheaterLayout(): SeatLayout {
  const zones: SeatZoneConfig[] = [
    { zone: SeatZone.VIP, name: '贵宾区', color: '#C9A96E', price: 88000, rowStart: 0, rowEnd: 3, colStart: 3, colEnd: 22 },
    { zone: SeatZone.A, name: 'A区', color: '#D4886B', price: 48000, rowStart: 4, rowEnd: 9, colStart: 0, colEnd: 25 },
    { zone: SeatZone.B, name: 'B区', color: '#7BA7BC', price: 28000, rowStart: 10, rowEnd: 14, colStart: 0, colEnd: 25 },
    { zone: SeatZone.C, name: 'C区', color: '#8FA880', price: 18000, rowStart: 15, rowEnd: 17, colStart: 0, colEnd: 25 },
  ];

  const rows: SeatRow[] = [];
  for (let r = 0; r < 18; r++) {
    const rowLabel = (r + 1).toString();
    const seats: Seat[] = [];

    for (let c = 0; c < 26; c++) {
      const colLabel = (c + 1).toString();
      const seatNumber = formatSeatNumber(rowLabel, colLabel);
      const zone = getZoneForPosition(zones, r, c);

      // 过道（中间走廊和两侧过道）
      const isAisle = c === 12 || c === 13 || c === 0 || c === 25;

      seats.push({
        id: `s_r${r}_c${c}`,
        rowIndex: r,
        colIndex: c,
        rowLabel,
        colLabel,
        seatNumber,
        zone: zone || SeatZone.B,
        price: zone ? getPriceForZone(zones, zone) : 28000,
        status: isAisle ? SeatStatus.AISLE : SeatStatus.AVAILABLE,
      });
    }

    rows.push({ rowIndex: r, rowLabel, seats });
  }

  return { id: 'layout_large', name: '蟠龙大剧场-标准布局', rows: 18, cols: 26, zones, seats: rows };
}

// ========== 小剧场布局：蟠龙小剧场 (10行 x 16列) ==========
function generateSmallTheaterLayout(): SeatLayout {
  const zones: SeatZoneConfig[] = [
    { zone: SeatZone.VIP, name: '贵宾区', color: '#C9A96E', price: 58000, rowStart: 0, rowEnd: 2, colStart: 2, colEnd: 13 },
    { zone: SeatZone.A, name: 'A区', color: '#D4886B', price: 38000, rowStart: 3, rowEnd: 6, colStart: 0, colEnd: 15 },
    { zone: SeatZone.B, name: 'B区', color: '#7BA7BC', price: 18000, rowStart: 7, rowEnd: 9, colStart: 0, colEnd: 15 },
  ];

  const rows: SeatRow[] = [];
  for (let r = 0; r < 10; r++) {
    const rowLabel = (r + 1).toString();
    const seats: Seat[] = [];

    for (let c = 0; c < 16; c++) {
      const colLabel = (c + 1).toString();
      const seatNumber = formatSeatNumber(rowLabel, colLabel);
      const zone = getZoneForPosition(zones, r, c);

      // 过道
      const isAisle = c === 7 || c === 8 || c === 0 || c === 15;

      seats.push({
        id: `s_r${r}_c${c}_small`,
        rowIndex: r,
        colIndex: c,
        rowLabel,
        colLabel,
        seatNumber,
        zone: zone || SeatZone.B,
        price: zone ? getPriceForZone(zones, zone) : 18000,
        status: isAisle ? SeatStatus.AISLE : SeatStatus.AVAILABLE,
      });
    }

    rows.push({ rowIndex: r, rowLabel, seats });
  }

  return { id: 'layout_small', name: '蟠龙小剧场-标准布局', rows: 10, cols: 16, zones, seats: rows };
}

// ========== 工具函数 ==========

function getZoneForPosition(zones: SeatZoneConfig[], row: number, col: number): SeatZone | null {
  for (const z of zones) {
    if (row >= z.rowStart && row <= z.rowEnd && col >= z.colStart && col <= z.colEnd) {
      return z.zone;
    }
  }
  return null;
}

function getPriceForZone(zones: SeatZoneConfig[], zone: SeatZone): number {
  const found = zones.find(z => z.zone === zone);
  return found ? found.price : 28000;
}

// ========== 导出布局和每场座位快照 ==========

export const LAYOUT_LARGE = generateLargeTheaterLayout();
export const LAYOUT_SMALL = generateSmallTheaterLayout();

export function getLayoutById(id: string): SeatLayout {
  if (id === 'layout_large') return JSON.parse(JSON.stringify(LAYOUT_LARGE));
  if (id === 'layout_small') return JSON.parse(JSON.stringify(LAYOUT_SMALL));
  return JSON.parse(JSON.stringify(LAYOUT_LARGE)); // default
}

// 为某场次生成座位快照（随机售出一些座位）
export function getSeatSnapshot(layoutId: string): SeatLayout {
  const layout = getLayoutById(layoutId);
  const soldRatio = 0.3 + Math.random() * 0.4; // 30%-70% 已售

  for (const row of layout.seats) {
    for (const seat of row.seats) {
      if (seat.status === SeatStatus.AISLE) continue;
      if (Math.random() < soldRatio) {
        seat.status = SeatStatus.SOLD;
      } else {
        seat.status = SeatStatus.AVAILABLE;
      }
    }
  }

  return layout;
}
