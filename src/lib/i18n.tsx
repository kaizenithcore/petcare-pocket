import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from './translations/en.json';
import es from './translations/es.json';

export type Language = 'en' | 'es';

const translations: Record<Language, typeof en> = { en, es };

type NestedKeyOf<T, Prefix extends string = ''> = T extends object
  ? { [K in keyof T & string]: NestedKeyOf<T[K], Prefix extends '' ? K : `${Prefix}.${K}`> }[keyof T & string]
  : Prefix;

type TranslationKey = NestedKeyOf<typeof en>;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((acc, part) => acc?.[part], obj) ?? path;
}

function detectBrowserLanguage(): Language {
  const browserLang = navigator.language.split('-')[0];
  return browserLang === 'es' ? 'es' : 'en';
}

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('petcare-language');
    if (stored === 'en' || stored === 'es') return stored;
    return detectBrowserLanguage();
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('petcare-language', lang);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let value = getNestedValue(translations[language], key);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, String(v));
      });
    }
    return value;
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useTranslation must be used within I18nProvider');
  return context;
};
