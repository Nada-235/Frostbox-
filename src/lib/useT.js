import { useAppState } from '../app/AppContext.jsx';
import { t } from './i18n.js';

/** Returns a t(key, ...args) bound to the current language. */
export function useT(){
  const { lang } = useAppState();
  return (key, ...args) => t(lang, key, ...args);
}

/**
 * Headings set an explicit Tailwind font-family utility, so they can't rely
 * on the ambient `[dir="rtl"] { font-family: var(--font-arabic) }` base
 * rule (a utility on the element itself always wins over an inherited
 * ancestor rule). Use this to pick the right one explicitly instead.
 */
export function useHeadingFont(){
  const { lang } = useAppState();
  return lang === 'ar' ? 'font-arabic' : 'font-display';
}
