import en from '@/translations/en.json';
import my from '@/translations/my.json';
import zh from '@/translations/zh.json';

export const resources = {
  en: {
    translation: en,
  },
  my: {
    translation: my,
  },
  zh: {
    translation: zh,
  },
};

export type Language = keyof typeof resources;
