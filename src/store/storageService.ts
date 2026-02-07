import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedStatement, StatementData } from '../types';

const STORAGE_KEY = 'waiter_statements';

export async function saveStatement(data: StatementData): Promise<string> {
  const id = Date.now().toString();
  const saved: SavedStatement = {
    ...data,
    id,
    date: new Date().toLocaleDateString('ko-KR'),
    timestamp: Date.now(),
  };

  const existing = await getStatements();
  existing.unshift(saved);

  // 최대 50개까지 저장
  const trimmed = existing.slice(0, 50);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  return id;
}

export async function getStatements(): Promise<SavedStatement[]> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  if (!json) return [];
  return JSON.parse(json);
}

export async function deleteStatement(id: string): Promise<void> {
  const existing = await getStatements();
  const filtered = existing.filter((s) => s.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export async function clearAllStatements(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
