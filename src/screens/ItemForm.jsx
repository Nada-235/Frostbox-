import { useRef, useState } from 'react';
import { Camera, Refrigerator, Snowflake, X, Check, ShoppingCart, Trash2 } from 'lucide-react';
import { useAppState, useAppDispatch } from '../app/AppContext.jsx';
import { useT } from '../lib/useT.js';
import { FOOD_CATEGORIES } from '../lib/constants.js';
import { catLabel, backArrow } from '../lib/formatting.js';
import { todayStr, defaultReminderAt, uid } from '../lib/utils.js';
import { saveFridgeItem, deleteFridgeItem, quickAddShoppingItem } from '../lib/firebase.js';
import { showToast } from '../lib/toast.js';
import { CatChip, SegButton, Switch, IconButton, noAutofillProps } from '../components/ui.jsx';

function blankItem(){
  return {
    id: null, name: '', dateAdded: todayStr(), goodUntil: todayStr(), photo: null, note: '',
    reminderEnabled: false, reminderAt: '', category: 'other', location: 'fridge',
  };
}

export function ItemForm(){
  const state = useAppState();
  const dispatch = useAppDispatch();
  const t = useT();
  const lang = state.lang;
  const original = state.editingItem || blankItem();
  const isEdit = !!original.id;
  const fileInputRef = useRef(null);

  const [name, setName] = useState(original.name);
  const [dateAdded, setDateAdded] = useState(original.dateAdded);
  const [goodUntil, setGoodUntil] = useState(original.goodUntil);
  const [photo, setPhoto] = useState(original.photo);
  const [note, setNote] = useState(original.note);
  const [category, setCategory] = useState(original.category || 'other');
  const [location, setLocation] = useState(original.location || 'fridge');
  const [reminderOn, setReminderOn] = useState(!!original.reminderEnabled);
  const [reminderAt, setReminderAt] = useState(original.reminderAt || '');
  const [saving, setSaving] = useState(false);

  function goBack(){
    dispatch({ type: 'SET_EDITING_ITEM', item: null });
    dispatch({ type: 'SET_SCREEN', screen: 'main' });
  }

  function onPhotoChange(e){
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const maxW = 360;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        setPhoto(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function onGoodUntilChange(value){
    setGoodUntil(value);
    if(reminderOn) setReminderAt(defaultReminderAt(value));
  }

  function onReminderToggle(){
    const next = !reminderOn;
    setReminderOn(next);
    if(next && !reminderAt) setReminderAt(defaultReminderAt(goodUntil));
  }

  async function handleSave(){
    const trimmedName = name.trim();
    if(!trimmedName){ alert(t('name_required_alert')); return; }
    const newItem = {
      id: original.id || uid(),
      name: trimmedName,
      dateAdded: dateAdded || todayStr(),
      goodUntil: goodUntil || todayStr(),
      photo,
      note: note.trim(),
      reminderEnabled: reminderOn,
      reminderAt: reminderOn ? reminderAt : '',
      reminderFired: false,
      category,
      location,
    };
    if(reminderOn && window.Notification && Notification.permission === 'default'){
      try{ await Notification.requestPermission(); }catch(e){ /* ignore */ }
    }
    setSaving(true);
    try{
      await saveFridgeItem(state.code, newItem);
      dispatch({ type: 'SET_EDITING_ITEM', item: null });
      dispatch({ type: 'SET_TAB', tab: 'fridge' });
      dispatch({ type: 'SET_SCREEN', screen: 'main' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(){
    if(!confirm(t('confirm_delete_item', original.name))) return;
    await deleteFridgeItem(state.code, original.id);
    dispatch({ type: 'SET_EDITING_ITEM', item: null });
    dispatch({ type: 'SET_TAB', tab: 'fridge' });
    dispatch({ type: 'SET_SCREEN', screen: 'main' });
  }

  async function handleAddToShopping(){
    await quickAddShoppingItem(state.code, uid(), original.name);
    dispatch({ type: 'SET_EDITING_ITEM', item: null });
    dispatch({ type: 'SET_TAB', tab: 'shopping' });
    dispatch({ type: 'SET_SCREEN', screen: 'main' });
    showToast(t('toast_added_shop', original.name));
  }

  const BackIcon = backArrow(lang);

  return (
    <>
      <div
        className="shrink-0 flex items-center gap-2.5 px-3 pb-[26px] sticky top-0 glass-brand z-[100]"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}
      >
        <button onClick={goBack} className="w-9 h-9 rounded-[11px] border border-line bg-card flex items-center justify-center cursor-pointer text-kale shrink-0">
          <BackIcon size={18} strokeWidth={2.25} />
        </button>
        <h2 className={`text-[19px] m-0 text-card ${lang === 'ar' ? 'font-arabic' : 'font-display'}`}>{isEdit ? t('edit_item') : t('add_item')}</h2>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden animate-fade-in-up px-3 pt-3 pb-10">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-[150px] rounded-2xl border-[1.5px] border-dashed border-line bg-card flex flex-col items-center justify-center text-fog text-[13px] font-semibold gap-1.5 overflow-hidden cursor-pointer mb-4 relative"
        >
          {photo ? (
            <img src={photo} alt="" className="w-full h-full object-cover absolute inset-0" />
          ) : (
            <>
              <Camera size={26} strokeWidth={1.75} />
              <span>{t('add_photo')}</span>
            </>
          )}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={onPhotoChange} className="hidden" />

        <Field label={t('label_name')}>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t('name_placeholder_food')} className={inputCls} name="fb-fridge-item-name" {...noAutofillProps} />
        </Field>

        <Field label={t('label_category')}>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1.5">
            {FOOD_CATEGORIES.map(c => (
              <CatChip key={c.id} selected={category === c.id} color={c.color} icon={c.icon} onClick={() => setCategory(c.id)}>
                {catLabel(c, lang)}
              </CatChip>
            ))}
          </div>
        </Field>

        <Field label={t('label_storage')}>
          <div className="flex bg-frost rounded-xl p-[3px]">
            <SegButton active={location === 'fridge'} onClick={() => setLocation('fridge')}>
              <Refrigerator size={14} strokeWidth={2.25} className="inline -mt-0.5 me-1" />{t('filter_fridge')}
            </SegButton>
            <SegButton active={location === 'freezer'} onClick={() => setLocation('freezer')}>
              <Snowflake size={14} strokeWidth={2.25} className="inline -mt-0.5 me-1" />{t('filter_freezer')}
            </SegButton>
          </div>
        </Field>

        <Field label={t('label_date_added')}>
          <input type="date" value={dateAdded} onChange={e => setDateAdded(e.target.value)} className={inputCls} />
        </Field>

        <Field label={t('label_good_until')}>
          <input type="date" value={goodUntil} onChange={e => onGoodUntilChange(e.target.value)} className={inputCls} />
        </Field>

        <div className="flex items-center justify-between bg-card border border-line rounded-2xl px-3.5 py-[13px] mb-3">
          <div className="text-[14.5px] font-semibold">{t('label_remind')}</div>
          <Switch on={reminderOn} onToggle={onReminderToggle} />
        </div>

        {reminderOn && (
          <Field label={t('label_reminder_time')}>
            <input
              type="datetime-local"
              value={reminderAt || defaultReminderAt(goodUntil)}
              onChange={e => setReminderAt(e.target.value)}
              className={inputCls}
            />
          </Field>
        )}

        <Field label={t('label_note')}>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder={t('note_placeholder')} className={`${inputCls} resize-y min-h-[70px] leading-tight`} name="fb-fridge-item-note" {...noAutofillProps} />
        </Field>
      </div>

      <div className="shrink-0 py-3.5 px-3 glass border-t border-line sticky bottom-0">
        <div className="flex gap-2.5">
          <IconButton onClick={goBack} icon={X} label={t('btn_cancel')} variant="ghost" />
          {isEdit && <IconButton onClick={handleAddToShopping} icon={ShoppingCart} label={t('btn_add_to_shopping')} variant="ghost" />}
          {isEdit && <IconButton onClick={handleDelete} icon={Trash2} label={t('btn_delete')} variant="danger" />}
          <IconButton onClick={handleSave} disabled={saving} icon={Check} label={isEdit ? t('btn_save_changes') : t('btn_add_to_fridge')} variant="primary" grow />
        </div>
      </div>
    </>
  );
}

const inputCls = 'w-full px-3.5 py-[13px] rounded-[13px] border-[1.5px] border-line text-[15.5px] text-kale bg-card focus:outline-2 focus:outline-mint focus:border-mint';

function Field({ label, children }){
  return (
    <div className="mb-4">
      <label className="block text-[12.5px] font-bold text-fog uppercase tracking-[0.05em] rtl:tracking-normal rtl:normal-case mb-[7px]">{label}</label>
      {children}
    </div>
  );
}
