import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const egp = (value: number, lang: 'ar' | 'en') =>
  lang === 'ar'
    ? `${new Intl.NumberFormat('ar-EG').format(value)} ج.م`
    : `EGP ${new Intl.NumberFormat('en-US').format(value)}`;
