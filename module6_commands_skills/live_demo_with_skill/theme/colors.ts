export const colors = {
  background: '#0B0F14',
  surface: '#141A22',
  surfaceElevated: '#1B232D',
  border: '#222C38',

  textPrimary: '#F5F7FA',
  textSecondary: '#9AA4B2',
  textInverse: '#0B0F14',

  accent: '#5EE6A8',
  accentPressed: '#3FCB8C',
  accentMuted: '#1F3A2E',

  danger: '#FF6B6B',
  warning: '#FFB454',

  skeleton: '#1F2731',
  skeletonHighlight: '#2A3340',

  overlay: 'rgba(0,0,0,0.4)',
} as const;

export type ColorToken = keyof typeof colors;
