import { create } from 'zustand';
import { LiquorItem, HostessItem, PurchaseItem, StatementData, RoomType, SessionPart, StatementSlot } from '../types';
import { calculateHostessCount } from '../utils/timeCalculation';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function createDefaultHostess(index: number): HostessItem {
  return {
    id: generateId(),
    name: `아가씨${index + 1}`,
    startTime: '',
    endTime: '',
    count: 0,
    amount: 0,
  };
}

function createDefaultStatementData(): StatementData {
  return {
    roomNumber: '',
    managerName: '',
    waiterName: '',
    partySize: '',
    roomType: 'normal',
    sessionPart: '1부',
    liquors: [],
    hostesses: [],
    wtAmount: 0,
    purchases: [],
  };
}

interface StatementStore extends StatementData {
  // Multi-slot management
  slots: StatementSlot[];
  activeSlotId: string;
  slotData: Record<string, StatementData>;
  createSlot: () => void;
  deleteSlot: (id: string) => void;
  switchSlot: (id: string) => void;
  renameSlot: (id: string, label: string) => void;

  // Actions - Basic Info
  setRoomNumber: (v: string) => void;
  setManagerName: (v: string) => void;
  setWaiterName: (v: string) => void;
  setPartySize: (v: string) => void;
  setRoomType: (v: RoomType) => void;
  setSessionPart: (v: SessionPart) => void;

  // Actions - Liquor
  addLiquor: (name?: string, price?: number) => void;
  removeLiquor: (id: string) => void;
  updateLiquor: (id: string, field: Partial<LiquorItem>) => void;

  // TC Computed
  getTcTotalCount: () => number;
  getTotalLiquorBottles: () => number;
  getBasicTcCount: () => number;
  getExtensionTcCount: () => number;

  // Actions - Hostess
  addHostess: () => void;
  removeHostess: (id: string) => void;
  updateHostess: (id: string, field: Partial<HostessItem>) => void;
  recalcHostess: (id: string) => void;

  // Actions - WT
  setWtAmount: (v: number) => void;

  // Actions - Purchase (사입)
  addPurchase: () => void;
  removePurchase: (id: string) => void;
  updatePurchase: (id: string, field: Partial<PurchaseItem>) => void;

  // Computed
  getLiquorTotal: () => number;
  getHostessTotal: () => number;
  getPurchaseTotal: () => number;
  getGrandTotal: () => number;

  // Reset
  resetAll: () => void;
  getStatementData: () => StatementData;
}

const defaultSlotId = generateId();

export const useStatementStore = create<StatementStore>((set, get) => ({
  // Multi-slot initial state
  slots: [{ id: defaultSlotId, label: '내역서 1' }],
  activeSlotId: defaultSlotId,
  slotData: {},

  // Current statement data
  ...createDefaultStatementData(),

  // Multi-slot management
  createSlot: () => {
    const state = get();
    if (state.slots.length >= 10) return;

    const newId = generateId();
    const newLabel = `내역서 ${state.slots.length + 1}`;
    const currentData = state.getStatementData();

    set({
      slots: [...state.slots, { id: newId, label: newLabel }],
      slotData: { ...state.slotData, [state.activeSlotId]: currentData },
      activeSlotId: newId,
      ...createDefaultStatementData(),
    });
  },

  deleteSlot: (id) => {
    const state = get();
    if (state.slots.length <= 1) return;

    const newSlots = state.slots.filter(s => s.id !== id);
    const newSlotData = { ...state.slotData };
    delete newSlotData[id];

    if (id === state.activeSlotId) {
      const newActiveId = newSlots[0].id;
      const loadData = newSlotData[newActiveId] || createDefaultStatementData();
      delete newSlotData[newActiveId];
      set({
        slots: newSlots,
        slotData: newSlotData,
        activeSlotId: newActiveId,
        ...loadData,
      });
    } else {
      set({
        slots: newSlots,
        slotData: newSlotData,
      });
    }
  },

  switchSlot: (id) => {
    const state = get();
    if (id === state.activeSlotId) return;

    const currentData = state.getStatementData();
    const newSlotData = { ...state.slotData, [state.activeSlotId]: currentData };

    const loadData = newSlotData[id] || createDefaultStatementData();
    delete newSlotData[id];

    set({
      activeSlotId: id,
      slotData: newSlotData,
      ...loadData,
    });
  },

  renameSlot: (id, label) =>
    set((state) => ({
      slots: state.slots.map(s => s.id === id ? { ...s, label } : s),
    })),

  // Basic info setters
  setRoomNumber: (v) => set({ roomNumber: v }),
  setManagerName: (v) => set({ managerName: v }),
  setWaiterName: (v) => set({ waiterName: v }),
  setPartySize: (v) => set({ partySize: v }),
  setRoomType: (v) => set({ roomType: v }),
  setSessionPart: (v) => set({ sessionPart: v }),

  // Liquor
  addLiquor: (name = '', price = 0) =>
    set((state) => ({
      liquors: [
        ...state.liquors,
        { id: generateId(), name, bottles: 1, pricePerBottle: price },
      ],
    })),

  removeLiquor: (id) =>
    set((state) => ({
      liquors: state.liquors.filter((l) => l.id !== id),
    })),

  updateLiquor: (id, field) =>
    set((state) => ({
      liquors: state.liquors.map((l) =>
        l.id === id ? { ...l, ...field } : l
      ),
    })),

  // TC Computed
  getTcTotalCount: () =>
    get().hostesses.reduce((sum, h) => sum + h.count, 0),

  getTotalLiquorBottles: () =>
    get().liquors.reduce((sum, l) => sum + l.bottles, 0),

  getBasicTcCount: () => {
    const s = get();
    const partyNum = parseInt(s.partySize, 10) || 0;
    const totalBottles = s.liquors.reduce((sum, l) => sum + l.bottles, 0);
    return totalBottles * partyNum;
  },

  getExtensionTcCount: () => {
    const s = get();
    const partyNum = parseInt(s.partySize, 10) || 0;
    const totalBottles = s.liquors.reduce((sum, l) => sum + l.bottles, 0);
    const basicTc = totalBottles * partyNum;
    const tcTotal = s.hostesses.reduce((sum, h) => sum + h.count, 0);
    return Math.max(0, tcTotal - basicTc);
  },

  // Hostess
  addHostess: () =>
    set((state) => ({
      hostesses: [
        ...state.hostesses,
        createDefaultHostess(state.hostesses.length),
      ],
    })),

  removeHostess: (id) =>
    set((state) => ({
      hostesses: state.hostesses.filter((h) => h.id !== id),
    })),

  updateHostess: (id, field) =>
    set((state) => {
      const hostesses = state.hostesses.map((h) => {
        if (h.id !== id) return h;
        const updated = { ...h, ...field };
        // 시간 필드가 변경될 때만 자동 계산 (수동 count 편집 시 덮어쓰지 않음)
        if (('startTime' in field || 'endTime' in field) && updated.startTime && updated.endTime) {
          const { count } = calculateHostessCount(updated.startTime, updated.endTime);
          updated.count = count;
        }
        return updated;
      });
      return { hostesses };
    }),

  recalcHostess: (id) =>
    set((state) => {
      const hostesses = state.hostesses.map((h) => {
        if (h.id !== id) return h;
        if (h.startTime && h.endTime) {
          const { count } = calculateHostessCount(h.startTime, h.endTime);
          return { ...h, count };
        }
        return h;
      });
      return { hostesses };
    }),

  // WT
  setWtAmount: (v) => set({ wtAmount: Math.max(0, v) }),

  // Purchase
  addPurchase: () =>
    set((state) => ({
      purchases: [
        ...state.purchases,
        { id: generateId(), name: `사입${state.purchases.length + 1}`, amount: 0 },
      ],
    })),

  removePurchase: (id) =>
    set((state) => ({
      purchases: state.purchases.filter((p) => p.id !== id),
    })),

  updatePurchase: (id, field) =>
    set((state) => ({
      purchases: state.purchases.map((p) =>
        p.id === id ? { ...p, ...field } : p
      ),
    })),

  // Computed
  getLiquorTotal: () =>
    get().liquors.reduce((sum, l) => sum + l.bottles * l.pricePerBottle, 0),

  // T/C 총금액 = 아가씨 금액 합산
  getHostessTotal: () =>
    get().hostesses.reduce((sum, h) => sum + h.amount, 0),

  getPurchaseTotal: () =>
    get().purchases.reduce((sum, p) => sum + p.amount, 0),

  // 아가씨 금액은 TC로 1번만 합산 (중복 없음)
  getGrandTotal: () => {
    const s = get();
    const liquorTotal = s.liquors.reduce((sum, l) => sum + l.bottles * l.pricePerBottle, 0);
    const tcTotal = s.hostesses.reduce((sum, h) => sum + h.amount, 0);
    const purchaseTotal = s.purchases.reduce((sum, p) => sum + p.amount, 0);
    return liquorTotal + tcTotal + s.wtAmount + purchaseTotal;
  },

  // 현재 슬롯만 초기화
  resetAll: () => set({
    ...createDefaultStatementData(),
  }),

  getStatementData: () => {
    const s = get();
    return {
      roomNumber: s.roomNumber,
      managerName: s.managerName,
      waiterName: s.waiterName,
      partySize: s.partySize,
      roomType: s.roomType,
      sessionPart: s.sessionPart,
      liquors: s.liquors,
      hostesses: s.hostesses,
      wtAmount: s.wtAmount,
      purchases: s.purchases,
    };
  },
}));
