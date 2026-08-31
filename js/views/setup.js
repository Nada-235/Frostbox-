import { t } from '../i18n.js';
import { logoSvg, langSwitchButtonHtml, bindLangSwitchButton } from './shell.js';

export function render(){
  return `
  <div class="onboard">
    ${langSwitchButtonHtml('lang-toggle')}
    <div class="brand-mark">${logoSvg()}</div>
    <h1>Frostbox</h1>
    <p class="tag">${t('setup_tagline')}</p>
    <div class="setup-card">
      <h3>${t('setup_quick')}</h3>
      <ol>
        <li>${t('setup_step1')}</li>
        <li>${t('setup_step2')}</li>
        <li>${t('setup_step3')}</li>
        <li>${t('setup_step4')}</li>
        <li>${t('setup_step5')}</li>
      </ol>
    </div>
  </div>`;
}

export function bind(){
  bindLangSwitchButton('lang-toggle');
}
