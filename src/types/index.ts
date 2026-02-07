export interface LiquorItem {
  id: string;
  name: string;
  bottles: number;
  pricePerBottle: number;
}

export interface HostessItem {
  id: string;
  name: string;
  startTime: string; // "HH:mm" format
  endTime: string;   // "HH:mm" format
  count: number;     // auto-calculated
  amount: number;    // 수동 금액 설정
}

export interface PurchaseItem {
  id: string;
  name: string;
  amount: number;
}

export type RoomType = 'normal' | '2bottle' | 'big3bottle' | 'mid2bottle';

export type SessionPart = '1부' | '2부';

export interface StatementData {
  roomNumber: string;
  managerName: string;
  waiterName: string;
  partySize: string;
  roomType: RoomType;
  sessionPart: SessionPart;
  liquors: LiquorItem[];
  hostesses: HostessItem[];
  wtAmount: number;
  purchases: PurchaseItem[];
}

export interface StatementSlot {
  id: string;
  label: string;
}

export interface SavedStatement extends StatementData {
  id: string;
  date: string;
  timestamp: number;
}

export interface LiquorPreset {
  name: string;
  defaultPrice: number;
}

export interface TimeSummary {
  totalMinutes: number;
  count: number;
  hours: number;
  minutes: number;
}
