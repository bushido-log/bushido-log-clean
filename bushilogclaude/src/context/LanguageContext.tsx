import React, { createContext, useContext, useState } from 'react';

type Lang = 'en' | 'ja';

type LanguageContextType = {
  lang: Lang;
  toggleLang: () => void;
  t: (en: string, ja: string) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  toggleLang: () => {},
  t: (en) => en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const toggleLang = () => setLang(l => l === 'en' ? 'ja' : 'en');
  const t = (en: string, ja: string) => lang === 'ja' ? ja : en;
  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
