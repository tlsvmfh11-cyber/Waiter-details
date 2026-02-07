import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_STORAGE_KEY = 'waiter_auth';
const USERS_STORAGE_KEY = 'waiter_users';

// 관리자 계정 (고정)
const ADMIN_ID = 'admin';
const ADMIN_PW = 'admin1234';

export interface UserAccount {
  id: string;
  password: string;
  name: string;
  createdAt: number;
}

interface AuthStore {
  isLoggedIn: boolean;
  currentUser: string | null;
  isAdmin: boolean;
  users: UserAccount[];
  isLoading: boolean;

  // Actions
  initialize: () => Promise<void>;
  login: (id: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;

  // Admin actions
  addUser: (id: string, password: string, name: string) => Promise<{ success: boolean; message: string }>;
  removeUser: (id: string) => Promise<void>;
  changeUserPassword: (id: string, newPassword: string) => Promise<void>;
  loadUsers: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  isLoggedIn: false,
  currentUser: null,
  isAdmin: false,
  users: [],
  isLoading: true,

  initialize: async () => {
    try {
      const [authJson, usersJson] = await Promise.all([
        AsyncStorage.getItem(AUTH_STORAGE_KEY),
        AsyncStorage.getItem(USERS_STORAGE_KEY),
      ]);

      const users: UserAccount[] = usersJson ? JSON.parse(usersJson) : [];

      if (authJson) {
        const auth = JSON.parse(authJson);
        set({
          isLoggedIn: true,
          currentUser: auth.currentUser,
          isAdmin: auth.currentUser === ADMIN_ID,
          users,
          isLoading: false,
        });
      } else {
        set({ users, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  login: async (id, password) => {
    // 관리자 체크
    if (id === ADMIN_ID && password === ADMIN_PW) {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ currentUser: ADMIN_ID }));
      set({ isLoggedIn: true, currentUser: ADMIN_ID, isAdmin: true });
      return { success: true, message: '' };
    }

    // 일반 유저 체크
    const { users } = get();
    const user = users.find(u => u.id === id);
    if (!user) {
      return { success: false, message: '존재하지 않는 아이디입니다.' };
    }
    if (user.password !== password) {
      return { success: false, message: '비밀번호가 틀렸습니다.' };
    }

    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ currentUser: id }));
    set({ isLoggedIn: true, currentUser: id, isAdmin: false });
    return { success: true, message: '' };
  },

  logout: () => {
    set({ isLoggedIn: false, currentUser: null, isAdmin: false });
    AsyncStorage.removeItem(AUTH_STORAGE_KEY).catch(() => {});
  },

  addUser: async (id, password, name) => {
    const { users } = get();
    if (id === ADMIN_ID) {
      return { success: false, message: '사용할 수 없는 아이디입니다.' };
    }
    if (users.find(u => u.id === id)) {
      return { success: false, message: '이미 존재하는 아이디입니다.' };
    }
    const newUser: UserAccount = { id, password, name, createdAt: Date.now() };
    const updated = [...users, newUser];
    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
    set({ users: updated });
    return { success: true, message: '' };
  },

  removeUser: async (id) => {
    const { users } = get();
    const updated = users.filter(u => u.id !== id);
    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
    set({ users: updated });
  },

  changeUserPassword: async (id, newPassword) => {
    const { users } = get();
    const updated = users.map(u => u.id === id ? { ...u, password: newPassword } : u);
    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
    set({ users: updated });
  },

  loadUsers: async () => {
    try {
      const json = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const users: UserAccount[] = json ? JSON.parse(json) : [];
      set({ users });
    } catch {
      // ignore
    }
  },
}));
