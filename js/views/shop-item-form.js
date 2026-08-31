import { state } from '../state.js';
import { t } from '../i18n.js';
import { requestRender } from '../render-bus.js';
import { SHOP_CATEGORIES } from '../constants.js';
import { catLabel, backArrow } from '../formatting.js';
import { escapeHtml, uid } from '../utils.js';
import { saveShoppingItem, deleteShoppingItem } from '../firebase-service.js';

export function render(){
  const item = state.editingShopItem || { id: null, name: '', category: 'other', prices: [] };
  const isEdit = !!item.id;
  return `
  <div class="screen">
    <div class="back-row">
      <button class="back-btn" id="back-btn">${backArrow()}</button>
      <h2 style="font-size:19px;">${isEdit ? t('edit_item') : t('add_item')}</h2>
    </div>
    <div class="field"><label>${t('label_name')}</label><input type="text" id="s-name" value="${escapeHtml(item.name)}" placeholder="${t('name_placeholder_shop')}"></div>
    <div class="field">
      <label>${t('label_category')}</label>
      <div class="chip-row" id="scat-chips" data-scroll-key="shop-cat-picker">
        ${SHOP_CATEGORIES.map(c => `<button class="cat-chip ${((item.category || 'other') === c.id) ? 'selected' : ''}" data-cat="${c.id}">${c.icon} ${catLabel(c)}</button>`).join('')}
      </div>
    </div>
    <div class="field">
      <label>${t('label_prices')}</label>
      <div id="prices-list"></div>
      <div class="price-add-row">
        <input type="text" class="pi-place" id="p-place" placeholder="${t('place_placeholder')}">
        <input type="text" class="pi-price" id="p-price" inputmode="decimal" placeholder="${t('price_placeholder')}">
        <button id="p-add">+</button>
      </div>
    </div>
    <div class="btn-row">
      <button class="btn btn-ghost" id="cancel-btn">${t('btn_cancel')}</button>
      <button class="btn btn-primary" id="save-btn">${t('btn_save_item')}</button>
    </div>
    ${isEdit ? `<div class="btn-row"><button class="btn btn-danger" style="flex:1;" id="delete-btn">${t('btn_delete')}</button></div>` : ''}
  </div>`;
}

export function bind(){
  const item = state.editingShopItem;
  let selectedCategory = (item && item.category) || 'other';
  let prices = (item && item.prices) ? item.prices.slice() : [];

  const goBack = () => { state.editingShopItem = null; state.screen = 'main'; requestRender(); };
  document.getElementById('back-btn').onclick = goBack;
  document.getElementById('cancel-btn').onclick = goBack;

  document.querySelectorAll('#scat-chips .cat-chip').forEach(chip => {
    chip.onclick = () => {
      selectedCategory = chip.dataset.cat;
      document.querySelectorAll('#scat-chips .cat-chip').forEach(c => c.classList.toggle('selected', c === chip));
    };
  });

  function renderPricesList(){
    const container = document.getElementById('prices-list');
    if(!prices.length){ container.innerHTML = `<p class="no-prices">${t('no_prices_yet')}</p>`; return; }
    const sorted = prices.slice().sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    const bestId = sorted[0].id;
    container.innerHTML = sorted.map(p => `
      <div class="price-row">
        <div class="price-info">
          <span class="price-place">${escapeHtml(p.place)}</span>
          ${p.id === bestId ? `<span class="best-badge">${t('best_price_badge')}</span>` : ''}
        </div>
        <div class="price-amt">${escapeHtml(String(p.price))}</div>
        <button class="price-del" data-pdel="${p.id}">✕</button>
      </div>`).join('');
    container.querySelectorAll('[data-pdel]').forEach(btn => {
      btn.onclick = () => { prices = prices.filter(p => p.id !== btn.dataset.pdel); renderPricesList(); };
    });
  }
  renderPricesList();

  document.getElementById('p-add').onclick = () => {
    const place = document.getElementById('p-place').value.trim();
    const price = document.getElementById('p-price').value.trim();
    if(!place || !price) return;
    prices.push({ id: uid(), place, price });
    document.getElementById('p-place').value = '';
    document.getElementById('p-price').value = '';
    renderPricesList();
  };

  document.getElementById('save-btn').onclick = async () => {
    const name = document.getElementById('s-name').value.trim();
    if(!name){ alert(t('name_required_alert')); return; }
    const newItem = {
      id: item && item.id ? item.id : uid(),
      name,
      category: selectedCategory,
      prices,
      checked: item ? !!item.checked : false
    };
    await saveShoppingItem(state.code, newItem);
    state.editingShopItem = null;
    state.tab = 'shopping';
    state.screen = 'main';
    requestRender();
  };

  if(item && item.id){
    document.getElementById('delete-btn').onclick = async () => {
      if(!confirm(t('confirm_delete_shop', item.name))) return;
      await deleteShoppingItem(state.code, item.id);
      state.editingShopItem = null;
      state.tab = 'shopping';
      state.screen = 'main';
      requestRender();
    };
  }
}
