export const colors = {
  white: '#FFFFFF',
  background: '#FFFFFF',
  softCyan: '#B2FFFF',
  accent: '#15A9D1',
  primaryText: '#1D2626',
  secondaryText: '#667373',
  divider: '#E3ECEC',
  cardBackground: '#F7FBFB',
  lightCard: '#F7FBFB',
  destructive: '#D95757',
  mutedText: '#8A9292',
  inputLine: '#575D5D',
  indigo: '#2E348C',
  indigoText: '#EDEFFF',
  indigoLine: '#7079B8',
  indigoLink: '#24308A',
} as const;

export type ColorToken = keyof typeof colors;
