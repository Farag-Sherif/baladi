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

  const applyDomLang = (next: Lang) => {
    const nextDir = next === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = next;
    document.documentElement.dir = nextDir;
    try { localStorage.setItem('baladi-lang', next); } catch { /* ignore */ }
  };

  useEffect(() => {
    applyDomLang(lang);
  }, [lang, dir]);

  const value = useMemo<LangCtx>(() => ({
    lang,
    dir,
    setLang: (next: Lang) => {
      applyDomLang(next);
      setLang(next);
    },
    toggle: () =>
      setLang((l) => {
        const next = l === 'ar' ? 'en' : 'ar';
        applyDomLang(next);
        return next;
      }),
    t: (ar: string, en: string) => (lang === 'ar' ? ar : en),
  }), [lang, dir]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>');
  return ctx;
}
