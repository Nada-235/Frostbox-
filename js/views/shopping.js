import { state } from '../state.js';
import { t } from '../i18n.js';
import { requestRender } from '../render-bus.js';
import { SHOP_CATEGORIES } from '../constants.js';
import { catLabel } from '../formatting.js';
import { escapeHtml, uid } from '../utils.js';
import { quickAddShoppingItem, toggleShoppingItem, deleteShoppingItem } from '../firebase-service.js';

function shopRowHtml(item){
  const prices = item.prices || [];
  let priceLine = '';
  if(prices.length){
    const sorted = prices.slice().sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    const best = sorted[0];
    const more = prices.length > 1 ? ` +${prices.length - 1} ${t('more_suffix')}` : '';
    priceLine = `<div class="shop-price-line">🏷️ ${escapeHtml(String(best.price))} · ${escapeHtml(best.place)}${more}</div>`;
  }
  return `
  <div class="shop-row" data-id="${item.id}">
    <button class="shop-check ${item.checked ? 'done' : ''}" data-check="${item.id}">${item.checked ? '✓' : ''}</button>
    <div class="shop-main" data-open="${item.id}">
      <div class="shop-name ${item.checked ? 'done' : ''}">${escapeHtml(item.name)}</div>
      ${priceLine}
    </div>
    <button class="shop-del" data-del="${item.id}">✕</button>
  </div>`;
}

export function renderHeader(){
  return `<div class="topbar"><div><div class="greet">${state.code}</div><h1>${t('shopping_list_title')}</h1></div></div>`;
}

export function renderBody(){
  const list = state.data.shopping || [];
  const pending = list.filter(i => !i.checked);
  const done = list.filter(i => i.checked);

  let sections = '';
  if(!list.length){
    sections = `<div class="empty-state"><div class="emoji">📝</div><p>${t('empty_shopping')}</p></div>`;
  } else {
    SHOP_CATEGORIES.forEach(cat => {
      const items = pending.filter(i => (i.category || 'other') === cat.id);
      if(items.length){
        sections += `<div class="section-label"><span>${cat.icon}</span>${catLabel(cat)}</div>${items.map(shopRowHtml).join('')}`;
      }
    });
    if(done.length){
      sections += `<div class="section-label">${t('checked_off')}</div>${done.map(shopRowHtml).join('')}`;
    }
  }

  return `
  <div class="add-row">
    <input type="text" id="shop-input" placeholder="${t('add_item_placeholder')}">
    <button id="shop-add">+</button>
  </div>
  ${sections}`;
}

export function bind(){
  const input = document.getElementById('shop-input');
  const addBtn = document.getElementById('shop-add');
  const doAdd = async () => {
    const value = input.value.trim();
    if(!value) return;
    await quickAddShoppingItem(state.code, uid(), value);
    requestRender();
  };
  addBtn.onclick = doAdd;
  input.onkeydown = e => { if(e.key === 'Enter') doAdd(); };

  document.querySelectorAll('[data-check]').forEach(btn => {
    btn.onclick = async () => {
      const item = state.data.shopping.find(i => i.id === btn.dataset.check);
      if(item) await toggleShoppingItem(state.code, item.id, !item.checked);
    };
  });
  document.querySelectorAll('[data-del]').forEach(btn => {
    btn.onclick = async () => { await deleteShoppingItem(state.code, btn.dataset.del); };
  });
  document.querySelectorAll('[data-open]').forEach(el => {
    el.onclick = () => {
      state.editingShopItem = state.data.shopping.find(i => i.id === el.dataset.open);
      state.screen = 'shopadd';
      requestRender();
    };
  });
}
