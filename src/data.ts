export const COUNTRIES = [
  { value: 'INDIA', label: 'India', icon: '🇮🇳' },
  { value: 'AMERICA', label: 'America', icon: '🇺🇸' },
] as const;

export type Country = typeof COUNTRIES[number]['value'];
