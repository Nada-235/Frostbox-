import { state } from '../state.js';
import { t } from '../i18n.js';
import { requestRender } from '../render-bus.js';
import * as fridgeView from './fridge.js';
import * as shoppingView from './shopping.js';
import * as householdView from './household.js';

function activeTabView(){
  if(state.tab === 'fridge') return fridgeView;
  if(state.tab === 'shopping') return shoppingView;
  return householdView;
}

export function render(){
  const view = activeTabView();
  const showFab = state.tab === 'fridge' || state.tab === 'shopping';

  return `
  <div class="app-flex">
    <div class="app-header">${view.renderHeader()}</div>
    <div class="app-scroll" data-scroll-key="scroll-${state.tab}">${view.renderBody()}</div>
    <div class="tabbar">
      <button class="tab-btn ${state.tab==='fridge'?'active':''}" data-tab="fridge"><span class="ic">🧊</span>${t('tab_fridge')}</button>
      <button class="tab-btn ${state.tab==='shopping'?'active':''}" data-tab="shopping"><span class="ic">📝</span>${t('tab_shopping')}</button>
      <button class="tab-btn ${state.tab==='household'?'active':''}" data-tab="household"><span class="ic">👨‍👩‍👧</span>${t('tab_household')}</button>
    </div>
  </div>
  ${showFab ? `<button class="fab" id="fab-add">+</button>` : ''}
  <div class="toast" id="toast"></div>`;
}

export function bind(){
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => { state.tab = btn.dataset.tab; requestRender(); };
  });

  const fab = document.getElementById('fab-add');
  if(fab){
    fab.onclick = () => {
      if(state.tab === 'fridge'){ state.editingItem = null; state.screen = 'add'; }
      else { state.editingShopItem = null; state.screen = 'shopadd'; }
      requestRender();
    };
  }

  activeTabView().bind();
}
