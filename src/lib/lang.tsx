import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Lang = 'ar' | 'en';

interface LangCtx {
  lang: Lang;
  dir: 'rtl' | 'ltr';
  setLang: (l: Lang) => void;
  toggle: () => void;
  /** t('نص عربي', 'english text') */
  t: (ar: string, en: string) => string;
}

const Ctx = createContext<LangCtx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('baladi-lang') : null;
    return saved === 'en' ? 'en' : 'ar';
  });

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    try { localStorage.setItem('baladi-lang', lang); } catch { /* ignore */ }
  }, [lang, dir]);

  const value = useMemo<LangCtx>(() => ({
    lang,
    dir,
    setLang,
    toggle: () => setLang((l) => (l === 'ar' ? 'en' : 'ar')),
    t: (ar: string, en: string) => (lang === 'ar' ? ar : en),
  }), [lang, dir]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>');
  return ctx;
}
