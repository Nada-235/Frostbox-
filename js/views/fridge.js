import { state } from '../state.js';
import { t } from '../i18n.js';
import { requestRender } from '../render-bus.js';
import { FOOD_CATEGORIES, catById } from '../constants.js';
import { catLabel, chipFor, fmtDate } from '../formatting.js';
import { daysUntil, escapeHtml } from '../utils.js';
import { shareHouseholdCode } from '../share.js';

function itemCardHtml(item){
  const chip = chipFor(daysUntil(item.goodUntil));
  const category = catById(FOOD_CATEGORIES, item.category || 'other');
  const thumb = item.photo ? `<img src="${item.photo}">` : category.icon;
  const isFreezer = (item.location || 'fridge') === 'freezer';
  return `
  <div class="item-card" data-id="${item.id}">
    <div class="thumb">${thumb}${isFreezer ? '<span class="freezer-badge">❄️</span>' : ''}</div>
    <div class="item-info">
      <div class="name">${escapeHtml(item.name)}</div>
      <div class="note">${escapeHtml(item.note) || fmtDate(item.goodUntil)}</div>
    </div>
    <div class="chip ${chip.cls}">${chip.txt}</div>
  </div>`;
}

function categorySectionHtml(category, items){
  return `<div class="section-label"><span>${category.icon}</span>${catLabel(category)}</div>${items.map(itemCardHtml).join('')}`;
}

function reminderBannerHtml(){
  if(!state.dueReminders || !state.dueReminders.length) return '';
  const item = state.dueReminders[0];
  const extra = state.dueReminders.length > 1 ? t('banner_more', state.dueReminders.length - 1) : '';
  return `<div class="banner"><span style="font-size:20px;">⏰</span><div class="txt"><b>${t('banner_title')}</b>${t('reminder_notification_body', escapeHtml(item.name))}${extra}</div></div>`;
}

function filtersHtml(){
  return `
  <div class="container-chip">
  <div class="seg-control">
    <button class="seg-btn ${state.locationFilter === 'all' ? 'active' : ''}" data-loc="all">${t('filter_all')}</button>
    <button class="seg-btn ${state.locationFilter === 'fridge' ? 'active' : ''}" data-loc="fridge">🧊 ${t('filter_fridge')}</button>
    <button class="seg-btn ${state.locationFilter === 'freezer' ? 'active' : ''}" data-loc="freezer">❄️ ${t('filter_freezer')}</button>
  </div>
  <div class="chip-row" data-scroll-key="fridge-cat-filter">
    <button class="cat-chip ${state.categoryFilter === 'all' ? 'selected' : ''}" data-catf="all">${t('filter_all')}</button>
    ${FOOD_CATEGORIES.map(c => `<button class="cat-chip ${state.categoryFilter === c.id ? 'selected' : ''}" data-catf="${c.id}">${c.icon} ${catLabel(c)}</button>`).join('')}
  </div>
  </div>`;
}

export function renderHeader(){
  return `
  <div class="topbar">
    <div><div class="greet"><span class="sync-dot"></span>${state.synced ? t('synced') : t('connecting')}</div><h1>${t('your_fridge')}</h1></div>
    <button class="code-pill" id="code-pill">${state.code}</button>
  </div>`;
}

export function renderBody(){
  let items = (state.data.items || []).slice();
  const totalCount = items.length;
  if(state.locationFilter !== 'all') items = items.filter(i => (i.location || 'fridge') === state.locationFilter);
  if(state.categoryFilter !== 'all') items = items.filter(i => (i.category || 'other') === state.categoryFilter);

  let sections;
  if(!totalCount){
    sections = `<div class="empty-state"><div class="emoji">🧊</div><p>${t('empty_fridge')}</p></div>`;
  } else if(!items.length){
    sections = `<div class="empty-state"><div class="emoji">🔍</div><p>${t('empty_filtered')}</p></div>`;
  } else {
    sections = '';
    FOOD_CATEGORIES.forEach(category => {
      const inCategory = items
        .filter(i => (i.category || 'other') === category.id)
        .sort((a, b) => daysUntil(a.goodUntil) - daysUntil(b.goodUntil)); // soonest-to-expire first, within the category
      if(inCategory.length) sections += categorySectionHtml(category, inCategory);
    });
  }

  return `${reminderBannerHtml()}${filtersHtml()}${sections}`;
}

export function bind(){
  document.getElementById('code-pill').onclick = shareHouseholdCode;

  document.querySelectorAll('[data-loc]').forEach(btn => {
    btn.onclick = () => { state.locationFilter = btn.dataset.loc; requestRender(); };
  });
  document.querySelectorAll('[data-catf]').forEach(btn => {
    btn.onclick = () => { state.categoryFilter = btn.dataset.catf; requestRender(); };
  });
  document.querySelectorAll('.item-card').forEach(card => {
    card.onclick = () => {
      state.editingItem = state.data.items.find(i => i.id === card.dataset.id);
      state.screen = 'add';
      requestRender();
    };
  });
}
