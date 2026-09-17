// ---------- 枚举 ----------

export enum SeatStatus {
  AVAILABLE = 'available',
  SOLD = 'sold',
  LOCKED = 'locked',
  SELECTED = 'selected',
  AISLE = 'aisle',
  DISABLED = 'disabled',
}

export enum SeatZone {
  VIP = 'vip',
  A = 'a',
  B = 'b',
  C = 'c',
  BALCONY = 'balcony',
}

// ---------- 核心实体 ----------

export interface SeatLayout {
  id: string;
  name: string;
  rows: number;
  cols: number;
  zones: SeatZoneConfig[];
  seats: SeatRow[];
}

export interface SeatZoneConfig {
  zone: SeatZone;
  name: string;
  color: string;
  price: number;
  rowStart: number;
  rowEnd: number;
  colStart: number;
  colEnd: number;
}

export interface SeatRow {
  rowIndex: number;
  rowLabel: string;
  seats: Seat[];
}

export interface Seat {
  id: string;
  rowIndex: number;
  colIndex: number;
  rowLabel: string;
  colLabel: string;
  seatNumber: string;
  zone: SeatZone;
  price: number;
  status: SeatStatus;
  isCoupleSeat?: boolean;
  coupleSeatId?: string;
}

export interface SeatSelection {
  performanceId: string;
  selectedSeats: Seat[];
  maxSelect: number;
  expiresAt: number;
}
