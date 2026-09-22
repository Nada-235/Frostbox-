import { EN_MONTHS, AR_MONTHS } from './constants.js';
import { t } from './i18n.js';

export function chipFor(days, lang){
  if(days < 0) return { cls:'expired', txt: t(lang, 'chip_expired', Math.abs(days)) };
  if(days === 0) return { cls:'soon', txt: t(lang, 'chip_today') };
  return { cls: days <= 2 ? 'soon' : 'fresh', txt: t(lang, 'chip_left', days) };
}

export function fmtDate(dateStr, lang){
  const dt = new Date(dateStr + 'T00:00:00');
  const months = lang === 'ar' ? AR_MONTHS : EN_MONTHS;
  return lang === 'ar'
    ? `${dt.getDate()} ${months[dt.getMonth()]}`
    : `${months[dt.getMonth()]} ${dt.getDate()}`;
}

export function backArrow(lang){
  return lang === 'ar' ? '→' : '←';
}

export function catLabel(cat, lang){
  return lang === 'ar' ? cat.ar : cat.en;
}
