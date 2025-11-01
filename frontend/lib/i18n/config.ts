export const locales = ['fr', 'en', 'mg', 'de', 'zh-CN', 'es', 'it', 'ru'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'fr';

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  mg: 'Malagasy',
  de: 'Deutsch',
  'zh-CN': '简体中文',
  es: 'Español',
  it: 'Italiano',
  ru: 'Русский',
};

export const localeFlags: Record<Locale, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
  mg: '🇲🇬',
  de: '🇩🇪',
  'zh-CN': '🇨🇳',
  es: '🇪🇸',
  it: '🇮🇹',
  ru: '🇷🇺',
};

// ISO 3166-1 alpha-2 country codes for flag-icons
export const localeFlagCodes: Record<Locale, string> = {
  fr: 'fr',
  en: 'gb',
  mg: 'mg',
  de: 'de',
  'zh-CN': 'cn',
  es: 'es',
  it: 'it',
  ru: 'ru',
};
