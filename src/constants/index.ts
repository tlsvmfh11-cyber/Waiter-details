import { LiquorPreset } from '../types';

export const LIQUOR_PRESETS: LiquorPreset[] = [
  { name: '골든블루 12년', defaultPrice: 70000 },
  { name: '윈저 아이스 12년', defaultPrice: 70000 },
];

export const MAX_HOSTESSES = 5;

export const COLORS = {
  bg: '#0f0f1a',
  card: '#1a1a2e',
  cardBorder: '#2a2a4a',
  primary: '#4a9eff',
  primaryDark: '#3a7edf',
  accent: '#ff6b8a',
  text: '#ffffff',
  textSecondary: '#8888aa',
  textMuted: '#555577',
  inputBg: '#12122a',
  inputBorder: '#333355',
  success: '#4ade80',
  warning: '#fbbf24',
  danger: '#ef4444',
  divider: '#222244',
  stepper: '#2a2a5a',
  stepperActive: '#4a9eff',
  totalBg: '#1e1e3a',
  copyBtn: '#25D366',
} as const;
