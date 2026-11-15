import type { RouteSpecies, ApiSpecies } from '../lib/api';

export type Species = RouteSpecies;

export interface Bi {
  ar: string;
  en: string;
}

export const SPECIES: Record<
  Species,
  {
    slug: Species;
    apiSpecies: ApiSpecies;
    name: Bi;
    eyebrow: Bi;
    latin: string;
    theme: string;
    intro: Bi;
    signature: Bi;
    silhouette: string;
    pouches: string;
    mark: 'green' | 'red';
  }
> = {
  cats: {
    slug: 'cats',
    apiSpecies: 'cat',
    name: { ar: 'قطط', en: 'Cats' },
    eyebrow: { ar: 'فصيلة القطط', en: 'FELINE' },
    latin: 'FELINE',
    theme: 'cat',
    intro: {
      ar: 'تغذية متوازنة ومختارة للقطط — أكل جاف، معلب، مكافآت، ورمل طبيعي.',
      en: 'Balanced everyday nutrition and care for cats — dry food, wet food, treats, and litter.',
    },
    signature: { ar: 'عالم القطط', en: 'The Feline World' },
    silhouette: '/brand/cat-emblem.png',
    pouches: '/brand/pouch-cats.png',
    mark: 'red',
  },
  dogs: {
    slug: 'dogs',
    apiSpecies: 'dog',
    name: { ar: 'كلاب', en: 'Dogs' },
    eyebrow: { ar: 'فصيلة الكلاب', en: 'CANINE' },
    latin: 'CANINE',
    theme: 'dog',
    intro: {
      ar: 'طاقة وبناء عضلي للكلاب — أكل جاف، معلب، مكافآت، وألعاب طبيعية.',
      en: 'Strength and daily energy for dogs — dry food, wet food, treats, and chew toys.',
    },
    signature: { ar: 'عالم الكلاب', en: 'The Canine World' },
    silhouette: '/brand/dog-emblem.png',
    pouches: '/brand/pouch-dogs.png',
    mark: 'green',
  },
};
