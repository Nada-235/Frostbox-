import { state } from '../state.js';
import { t } from '../i18n.js';
import { requestRender } from '../render-bus.js';
import { FOOD_CATEGORIES } from '../constants.js';
import { catLabel, backArrow } from '../formatting.js';
import { escapeHtml, todayStr, defaultReminderAt, uid } from '../utils.js';
import { saveFridgeItem, deleteFridgeItem, quickAddShoppingItem } from '../firebase-service.js';
import { showToast } from '../toast.js';

export function render(){
  const item = state.editingItem || {
    id: null, name: '', dateAdded: todayStr(), goodUntil: todayStr(), photo: null, note: '',
    reminderEnabled: false, reminderAt: '', category: 'other', location: 'fridge'
  };
  const isEdit = !!item.id;
  return `
<div>
    <div class="back-row">
      <button class="back-btn" id="back-btn">${backArrow()}</button>
      <h2 style="font-size:19px;">${isEdit ? t('edit_item') : t('add_item')}</h2>
    </div>

      <div class="screen">
    <div class="photo-picker" id="photo-picker">
      ${item.photo ? `<img src="${item.photo}">` : `<span class="ic">📷</span><span>${t('add_photo')}</span>`}
    </div>
    <input type="file" accept="image/*" capture="environment" id="photo-input" style="display:none;">
    <div class="field"><label>${t('label_name')}</label><input type="text" id="f-name" value="${escapeHtml(item.name)}" placeholder="${t('name_placeholder_food')}"></div>
    <div class="field">
      <label>${t('label_category')}</label>
      <div class="chip-row" id="cat-chips" data-scroll-key="food-cat-picker">
        ${FOOD_CATEGORIES.map(c => `<button class="cat-chip ${((item.category || 'other') === c.id) ? 'selected' : ''}" data-cat="${c.id}">${c.icon} ${catLabel(c)}</button>`).join('')}
      </div>
    </div>
    <div class="field">
      <label>${t('label_storage')}</label>
      <div class="seg-control" id="loc-seg">
        <button class="seg-btn ${((item.location || 'fridge') === 'fridge') ? 'active' : ''}" data-loc="fridge">🧊 ${t('filter_fridge')}</button>
        <button class="seg-btn ${((item.location || 'fridge') === 'freezer') ? 'active' : ''}" data-loc="freezer">❄️ ${t('filter_freezer')}</button>
      </div>
    </div>
    <div class="field"><label>${t('label_date_added')}</label><input type="date" id="f-added" value="${item.dateAdded}"></div>
    <div class="field"><label>${t('label_good_until')}</label><input type="date" id="f-until" value="${item.goodUntil}"></div>
    <div class="toggle-row">
      <div class="lbl">${t('label_remind')}</div>
      <button class="switch ${item.reminderEnabled ? 'on' : ''}" id="rem-toggle"></button>
    </div>
    <div class="field" id="rem-field" style="display:${item.reminderEnabled ? 'block' : 'none'};">
      <label>${t('label_reminder_time')}</label>
      <input type="datetime-local" id="f-reminder" value="${item.reminderAt || defaultReminderAt(item.goodUntil)}">
    </div>
    <div class="field"><label>${t('label_note')}</label><textarea id="f-note" placeholder="${t('note_placeholder')}">${escapeHtml(item.note)}</textarea></div>
      </div>`;

    
    <div class="btn-row">
      <button class="btn btn-ghost" id="cancel-btn">${t('btn_cancel')}</button>
      <button class="btn btn-primary" id="save-btn">${isEdit ? t('btn_save_changes') : t('btn_add_to_fridge')}</button>
    </div>
    ${isEdit ? `
    <div class="btn-row">
      <button class="btn btn-ghost" id="toshop-btn">${t('btn_add_to_shopping')}</button>
      <button class="btn btn-danger" id="delete-btn">${t('btn_delete')}</button>
    </div>` : ''}
  </div>`;
}

export function bind(){
  const item = state.editingItem;
  let photoData = item && item.photo ? item.photo : null;
  let selectedCategory = (item && item.category) || 'other';
  let selectedLocation = (item && item.location) || 'fridge';

  const goBack = () => { state.editingItem = null; state.screen = 'main'; requestRender(); };
  document.getElementById('back-btn').onclick = goBack;
  document.getElementById('cancel-btn').onclick = goBack;

  document.getElementById('photo-picker').onclick = () => document.getElementById('photo-input').click();
  document.getElementById('photo-input').onchange = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 360;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        photoData = canvas.toDataURL('image/jpeg', 0.6);
        document.getElementById('photo-picker').innerHTML = `<img src="${photoData}">`;
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  document.querySelectorAll('#cat-chips .cat-chip').forEach(chip => {
    chip.onclick = () => {
      selectedCategory = chip.dataset.cat;
      document.querySelectorAll('#cat-chips .cat-chip').forEach(c => c.classList.toggle('selected', c === chip));
    };
  });
  document.querySelectorAll('#loc-seg .seg-btn').forEach(btn => {
    btn.onclick = () => {
      selectedLocation = btn.dataset.loc;
      document.querySelectorAll('#loc-seg .seg-btn').forEach(b => b.classList.toggle('active', b === btn));
    };
  });

  const untilInput = document.getElementById('f-until');
  const remToggleBtn = document.getElementById('rem-toggle');
  const remField = document.getElementById('rem-field');
  let reminderOn = !!(item && item.reminderEnabled);
  remToggleBtn.onclick = () => {
    reminderOn = !reminderOn;
    remToggleBtn.classList.toggle('on', reminderOn);
    remField.style.display = reminderOn ? 'block' : 'none';
    if(reminderOn && !document.getElementById('f-reminder').value){
      document.getElementById('f-reminder').value = defaultReminderAt(untilInput.value);
    }
  };
  untilInput.onchange = () => {
    if(reminderOn) document.getElementById('f-reminder').value = defaultReminderAt(untilInput.value);
  };

  document.getElementById('save-btn').onclick = async () => {
    const name = document.getElementById('f-name').value.trim();
    if(!name){ alert(t('name_required_alert')); return; }
    const goodUntil = document.getElementById('f-until').value || todayStr();
    const newItem = {
      id: item && item.id ? item.id : uid(),
      name,
      dateAdded: document.getElementById('f-added').value || todayStr(),
      goodUntil,
      photo: photoData,
      note: document.getElementById('f-note').value.trim(),
      reminderEnabled: reminderOn,
      reminderAt: reminderOn ? document.getElementById('f-reminder').value : '',
      reminderFired: false,
      category: selectedCategory,
      location: selectedLocation
    };
    if(reminderOn && window.Notification && Notification.permission === 'default'){
      try{ await Notification.requestPermission(); }catch(e){}
    }
    await saveFridgeItem(state.code, newItem);
    state.editingItem = null;
    state.tab = 'fridge';
    state.screen = 'main';
    requestRender();
  };

  if(item && item.id){
    document.getElementById('delete-btn').onclick = async () => {
      if(!confirm(t('confirm_delete_item', item.name))) return;
      await deleteFridgeItem(state.code, item.id);
      state.editingItem = null;
      state.tab = 'fridge';
      state.screen = 'main';
      requestRender();
    };
    document.getElementById('toshop-btn').onclick = async () => {
      await quickAddShoppingItem(state.code, uid(), item.name);
      state.editingItem = null;
      state.tab = 'shopping';
      state.screen = 'main';
      requestRender();
      showToast(t('toast_added_shop', item.name));
    };
  }
}
