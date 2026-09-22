/**
 * Wraps everything this device remembers on its own (as opposed to the
 * shared household data, which lives in Firestore). Kept in one place so
 * the storage keys only exist here.
 */
const ME_KEY = 'frostbox_me';
const LANG_KEY = 'frostbox_lang';
const THEME_KEY = 'frostbox_theme';
const MODE_KEY = 'frostbox_mode';
const CUSTOM_COLOR_KEY = 'frostbox_custom_color';
const FONT_EN_KEY = 'frostbox_font_en';
const FONT_AR_KEY = 'frostbox_font_ar';

export function getMe(){
  try{ return JSON.parse(localStorage.getItem(ME_KEY) || 'null'); }
  catch(e){ return null; }
}
export function setMe(obj){ localStorage.setItem(ME_KEY, JSON.stringify(obj)); }
export function clearMe(){ localStorage.removeItem(ME_KEY); }

export function getLang(){ return localStorage.getItem(LANG_KEY) || 'en'; }
export function setLang(lang){ localStorage.setItem(LANG_KEY, lang); }

export function getTheme(){ return localStorage.getItem(THEME_KEY) || 'sage'; }
export function setTheme(theme){ localStorage.setItem(THEME_KEY, theme); }

export function getMode(){ return localStorage.getItem(MODE_KEY) || 'light'; }
export function setMode(mode){ localStorage.setItem(MODE_KEY, mode); }

export function getCustomColor(){ return localStorage.getItem(CUSTOM_COLOR_KEY) || '#6A994E'; }
export function setCustomColor(hex){ localStorage.setItem(CUSTOM_COLOR_KEY, hex); }

export function getFontEn(){ return localStorage.getItem(FONT_EN_KEY) || 'default'; }
export function setFontEn(id){ localStorage.setItem(FONT_EN_KEY, id); }

export function getFontAr(){ return localStorage.getItem(FONT_AR_KEY) || 'tajawal'; }
export function setFontAr(id){ localStorage.setItem(FONT_AR_KEY, id); }
