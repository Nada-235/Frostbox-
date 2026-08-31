import { state } from './state.js';
import { t } from './i18n.js';
import { EN_MONTHS, AR_MONTHS } from './constants.js';

export function chipFor(days){
  if(days < 0) return { cls:'expired', txt: t('chip_expired', Math.abs(days)) };
  if(days === 0) return { cls:'soon', txt: t('chip_today') };
  return { cls: days <= 2 ? 'soon' : 'fresh', txt: t('chip_left', days) };
}

export function fmtDate(dateStr){
  const dt = new Date(dateStr + 'T00:00:00');
  const months = state.lang === 'ar' ? AR_MONTHS : EN_MONTHS;
  return state.lang === 'ar'
    ? `${dt.getDate()} ${months[dt.getMonth()]}`
    : `${months[dt.getMonth()]} ${dt.getDate()}`;
}

export function backArrow(){
  return state.lang === 'ar' ? '→' : '←';
}

export function catLabel(cat){
  return state.lang === 'ar' ? cat.ar : cat.en;
}
