export const COUNTRIES = [
  { value: 'INDIA', label: 'India' },
  { value: 'AMERICA', label: 'America' },
] as const;

export type Country = typeof COUNTRIES[number]['value'];
