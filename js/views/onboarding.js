import { state } from '../state.js';
import { t } from '../i18n.js';
import { requestRender } from '../render-bus.js';
import { startNewHousehold, joinHousehold } from '../household-session.js';
import { logoSvg, langSwitchButtonHtml, bindLangSwitchButton } from './shell.js';

export function render(){
  return `
  <div class="onboard">
    ${langSwitchButtonHtml('lang-toggle')}
    <div class="brand-mark">${logoSvg()}</div>
    <h1>Frostbox</h1>
    <p class="tag">${t('tagline')}</p>
    <button class="ob-btn ob-primary" id="btn-start">${t('start_fridge')}</button>
    <button class="ob-btn ob-secondary" id="btn-join-toggle">${t('join_fridge_btn')}</button>
    <div class="join-box ${state.joinBoxOpen ? 'show' : ''}" id="join-box">
      <input type="text" id="join-code" placeholder="${t('enter_code_placeholder')}" maxlength="6">
      <button class="ob-btn ob-primary" id="btn-join">${t('join_fridge_confirm')}</button>
    </div>
  </div>`;
}

export function bind(){
  bindLangSwitchButton('lang-toggle');

  document.getElementById('btn-start').onclick = async () => {
    await startNewHousehold();
    state.screen = 'main';
    requestRender();
  };

  document.getElementById('btn-join-toggle').onclick = () => {
    state.joinBoxOpen = !state.joinBoxOpen;
    requestRender();
  };

  if(state.joinBoxOpen){
    document.getElementById('btn-join').onclick = async () => {
      const code = document.getElementById('join-code').value.trim().toUpperCase();
      if(!code){ alert(t('enter_code_first')); return; }
      const ok = await joinHousehold(code);
      if(!ok){ alert(t('code_not_found')); return; }
      state.screen = 'main';
      requestRender();
    };
  }
}
