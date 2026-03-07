import { createContext, useContext, useState, type ReactNode } from 'react'
import en from './en.json'
import esAR from './es-AR.json'

export type Language = 'en' | 'es-AR'

const LANGUAGES: Record<Language, { label: string; flag: string }> = {
  'en':    { label: 'English',  flag: '🇬🇧' },
  'es-AR': { label: 'Español',  flag: '🇦🇷' },
}

const translations: Record<Language, typeof en> = { en, 'es-AR': esAR }

// dot-path accessor with optional {{n}} interpolation
function resolve(obj: Record<string, unknown>, path: string, vars?: Record<string, string | number>): string {
  const parts = path.split('.')
  let cur: unknown = obj
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return path
    cur = (cur as Record<string, unknown>)[p]
  }
  if (typeof cur !== 'string') return path
  if (vars) return cur.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? k))
  return cur
}

interface I18nContextValue {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: string, vars?: Record<string, string | number>) => string
  languages: typeof LANGUAGES
}

const I18nContext = createContext<I18nContextValue>({
  lang: 'es-AR',
  setLang: () => {},
  t: (key) => key,
  languages: LANGUAGES,
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('es-AR')
  const t = (key: string, vars?: Record<string, string | number>) =>
    resolve(translations[lang] as Record<string, unknown>, key, vars)
  return (
    <I18nContext.Provider value={{ lang, setLang, t, languages: LANGUAGES }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => useContext(I18nContext)
