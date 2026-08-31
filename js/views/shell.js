import { state } from '../state.js';
import { setLang } from '../local-storage.js';
import { requestRender } from '../render-bus.js';

export function logoSvg(){
  return `<svg width="34" height="34" viewBox="0 0 24 24" fill="none">
    <path d="M12 2 L12 22 M7 6 L17 6 M6 12 L18 12 M7 18 L17 18 M9 4 L12 6 L15 4 M9 20 L12 18 L15 20" stroke="#4FB6A8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

export function langSwitchButtonHtml(id){
  return `<button class="code-pill lang-switch" id="${id}">${state.lang === 'en' ? 'AR' : 'EN'}</button>`;
}

export function bindLangSwitchButton(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.onclick = () => {
    state.lang = state.lang === 'en' ? 'ar' : 'en';
    setLang(state.lang);
    requestRender();
  };
}
