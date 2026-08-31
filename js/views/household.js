import { state, resetState } from '../state.js';
import { t } from '../i18n.js';
import { requestRender } from '../render-bus.js';
import { setLang } from '../local-storage.js';
import { escapeHtml } from '../utils.js';
import { shareHouseholdCode } from '../share.js';
import { leaveHousehold } from '../household-session.js';

export function renderHeader(){
  return `<div class="topbar"><div><div class="greet">${t('sharing_label')}</div><h1>${t('household_title')}</h1></div></div>`;
}

export function renderBody(){
  const members = (state.data.members && state.data.members.length) ? state.data.members : [state.myName];
  return `
  <div class="hh-code-card">
    <div class="lbl">${t('your_code_label')}</div>
    <div class="code">${state.code}</div>
    <div class="desc">${t('share_desc')}</div>
    <button class="hh-share-btn" id="share-btn">${t('share_code_btn')}</button>
  </div>
  <div class="section-label">${t('members_label')}</div>
  ${members.map(m => `<div class="member-row"><div class="member-avatar">${escapeHtml(m).slice(0,1).toUpperCase()}</div><div>${escapeHtml(m)}</div></div>`).join('')}
  <div class="section-label">${t('language_label')}</div>
  <div class="seg-control">
    <button class="seg-btn ${state.lang === 'en' ? 'active' : ''}" id="lang-en">English</button>
    <button class="seg-btn ${state.lang === 'ar' ? 'active' : ''}" id="lang-ar">العربية</button>
  </div>
  <div class="section-label">${t('notifications_label')}</div>
  <div class="toggle-row">
    <div class="lbl">${t('enable_alerts')}</div>
    <button class="switch ${window.Notification && Notification.permission === 'granted' ? 'on' : ''}" id="notif-toggle"></button>
  </div>
  <p style="font-size:12.5px; color:var(--fog); line-height:1.6; margin:-4px 2px 20px 2px;">${t('alerts_note')}</p>
  <div class="section-label">${t('tab_fridge')}</div>
  <button class="btn btn-danger" style="width:100%;" id="leave-btn">${t('leave_household_btn')}</button>`;
}

export function bind(){
  document.getElementById('share-btn').onclick = shareHouseholdCode;

  document.getElementById('lang-en').onclick = () => { state.lang = 'en'; setLang('en'); requestRender(); };
  document.getElementById('lang-ar').onclick = () => { state.lang = 'ar'; setLang('ar'); requestRender(); };

  document.getElementById('notif-toggle').onclick = async () => {
    if(!window.Notification){ alert(t('notif_unsupported')); return; }
    if(Notification.permission !== 'granted'){
      const perm = await Notification.requestPermission();
      if(perm === 'granted') requestRender();
    } else {
      alert(t('notif_already_enabled'));
    }
  };

  document.getElementById('leave-btn').onclick = () => {
    if(!confirm(t('confirm_leave'))) return;
    leaveHousehold();
    resetState(state.lang);
    requestRender();
  };
}
