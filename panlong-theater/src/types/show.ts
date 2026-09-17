// ---------- 枚举 ----------

export enum ShowCategory {
  OPERA = 'opera',
  DRAMA = 'drama',
  DANCE = 'dance',
  CONCERT = 'concert',
  CHINESE_OPERA = 'chinese_opera',
  MUSICAL = 'musical',
  CHILDREN = 'children',
  CROSSOVER = 'crossover',
}

export enum ShowStatus {
  ON_SALE = 'on_sale',
  COMING_SOON = 'coming_soon',
  SOLD_OUT = 'sold_out',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

// ---------- 核心实体 ----------

export interface Cast {
  id: string;
  name: string;
  role: string;
  avatar: string;
  description?: string;
}

export interface Show {
  id: string;
  title: string;
  subtitle?: string;
  category: ShowCategory;
  status: ShowStatus;
  posterUrl: string;
  bannerUrls: string[];
  description: string;
  fullDescription: string;
  duration: number;
  castList: Cast[];
  rating: number;
  ratingCount: number;
  tags: string[];
  notice: string;
  language?: string;
  isHot: boolean;
  isNew: boolean;
  minPrice: number;
  maxPrice: number;
  trailerUrl?: string;
  baseSaleTime: string;
}

export interface Performance {
  id: string;
  showId: string;
  date: string;
  time: string;
  endTime: string;
  venue: string;
  status: ShowStatus;
  seatLayoutId: string;
  availableSeats: number;
  totalSeats: number;
  note?: string;
}
