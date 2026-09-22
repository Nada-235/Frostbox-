/**
 * Wraps everything this device remembers on its own (as opposed to the
 * shared household data, which lives in Firestore). Kept in one place so
 * the storage keys only exist here.
 */
const ME_KEY = 'frostbox_me';
const LANG_KEY = 'frostbox_lang';

export function getMe(){
  try{ return JSON.parse(localStorage.getItem(ME_KEY) || 'null'); }
  catch(e){ return null; }
}
export function setMe(obj){ localStorage.setItem(ME_KEY, JSON.stringify(obj)); }
export function clearMe(){ localStorage.removeItem(ME_KEY); }

export function getLang(){ return localStorage.getItem(LANG_KEY) || 'en'; }
export function setLang(lang){ localStorage.setItem(LANG_KEY, lang); }
