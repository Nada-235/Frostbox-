import { useRef, useState } from 'react';
import { Camera, Refrigerator, Snowflake, X, Check, ShoppingCart, Trash2, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { useAppState, useAppDispatch } from '../app/AppContext.jsx';
import { useT } from '../lib/useT.js';
import { FOOD_CATEGORIES } from '../lib/constants.js';
import { catLabel, backArrow } from '../lib/formatting.js';
import { todayStr, defaultReminderAt, uid } from '../lib/utils.js';
import { saveFridgeItem, deleteFridgeItem, quickAddShoppingItem } from '../lib/firebase.js';
import { showToast } from '../lib/toast.js';
import { CatChip, SegButton, Switch, IconButton, noAutofillProps } from '../components/ui.jsx';

const UNITS = ['pcs', 'g', 'kg', 'ml', 'L', 'pack', 'bottle', 'custom'];

function blankItem(){
  return {
    id: null, name: '', dateAdded: todayStr(), goodUntil: '', photo: null, note: '',
    reminderEnabled: false, reminderAt: '', category: 'other', location: 'fridge',
    quantity: '', unit: 'pcs', customUnit: '', brand: '', store: '', price: '', openedAt: '',
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
  const [detailsOpen, setDetailsOpen] = useState(isEdit);

  const [name, setName] = useState(original.name || '');
  const [dateAdded, setDateAdded] = useState(original.dateAdded || todayStr());
  const [goodUntil, setGoodUntil] = useState(original.goodUntil || '');
  const [photo, setPhoto] = useState(original.photo || null);
  const [note, setNote] = useState(original.note || '');
  const [category, setCategory] = useState(original.category || 'other');
  const [location, setLocation] = useState(original.location || 'fridge');
  const [quantity, setQuantity] = useState(original.quantity || '');
  const [unit, setUnit] = useState(original.unit || 'pcs');
  const [customUnit, setCustomUnit] = useState(original.customUnit || '');
  const [brand, setBrand] = useState(original.brand || '');
  const [store, setStore] = useState(original.store || '');
  const [price, setPrice] = useState(original.price || '');
  const [openedAt, setOpenedAt] = useState(original.openedAt || '');
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
        const maxW = 720;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        setPhoto(canvas.toDataURL('image/jpeg', 0.68));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function onGoodUntilChange(value){
    setGoodUntil(value);
    if(reminderOn && value) setReminderAt(defaultReminderAt(value));
    if(!value) setReminderAt('');
  }

  function onReminderToggle(){
    const next = !reminderOn;
    setReminderOn(next);
    if(next && goodUntil && !reminderAt) setReminderAt(defaultReminderAt(goodUntil));
  }

  async function handleSave(){
    const trimmedName = name.trim();
    if(!trimmedName){ alert(t('name_required_alert')); return; }
    const newItem = {
      id: original.id || uid(), name: trimmedName, dateAdded: dateAdded || todayStr(),
      goodUntil: goodUntil || '', photo, note: note.trim(), reminderEnabled: reminderOn && !!goodUntil,
      reminderAt: reminderOn && goodUntil ? reminderAt : '', reminderFired: false, category, location,
      quantity: quantity.trim(), unit, customUnit: unit === 'custom' ? customUnit.trim() : '',
      brand: brand.trim(), store: store.trim(), price: price.trim(), openedAt,
    };
    if(newItem.reminderEnabled && window.Notification && Notification.permission === 'default'){
      try{ await Notification.requestPermission(); }catch(e){}
    }
    setSaving(true);
    try{
      await saveFridgeItem(state.code, newItem);
      dispatch({ type: 'SET_EDITING_ITEM', item: null });
      dispatch({ type: 'SET_TAB', tab: 'fridge' });
      dispatch({ type: 'SET_SCREEN', screen: 'main' });
    } finally { setSaving(false); }
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

  return <>
    <div className="shrink-0 flex items-center gap-2.5 px-3 pb-[18px] sticky top-0 z-[100]" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
      <button onClick={goBack} className="icon-btn-float w-10 h-10 rounded-full border-none flex items-center justify-center cursor-pointer text-kale shrink-0"><BackIcon size={18}/></button>
      <h2 className={`text-[19px] font-bold m-0 text-kale ${lang === 'ar' ? 'font-arabic' : 'font-display'}`}>{isEdit ? t('edit_item') : t('add_item')}</h2>
    </div>

    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden animate-fade-in-up px-3 pt-2 pb-10">
      <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full h-[190px] rounded-[28px] border border-line bg-card flex flex-col items-center justify-center text-fog text-[13px] font-semibold gap-2 overflow-hidden cursor-pointer mb-5 relative shadow-[var(--shadow-sm)]">
        {photo ? <img src={photo} alt="" className="w-full h-full object-cover absolute inset-0"/> : <><span className="w-12 h-12 rounded-full bg-track flex items-center justify-center"><Camera size={22}/></span><span>{t('add_photo')}</span></>}
      </button>
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={onPhotoChange} className="hidden"/>

      <Field label={t('label_name')}><input value={name} onChange={e=>setName(e.target.value)} placeholder={t('name_placeholder_food')} className={inputCls} name="fb-fridge-item-name" {...noAutofillProps}/></Field>

      <Field label={t('label_storage')}><div className="flex bg-frost rounded-2xl p-[4px]"><SegButton active={location==='fridge'} onClick={()=>setLocation('fridge')}><Refrigerator size={14} className="inline -mt-0.5 me-1"/>{t('filter_fridge')}</SegButton><SegButton active={location==='freezer'} onClick={()=>setLocation('freezer')}><Snowflake size={14} className="inline -mt-0.5 me-1"/>{t('filter_freezer')}</SegButton></div></Field>

      <div className="grid grid-cols-[1fr_1.25fr] gap-2.5">
        <Field label={t('label_quantity')}><input value={quantity} onChange={e=>setQuantity(e.target.value)} inputMode="decimal" placeholder="1" className={inputCls} {...noAutofillProps}/></Field>
        <Field label={t('label_unit')}><select value={unit} onChange={e=>setUnit(e.target.value)} className={inputCls}>{UNITS.map(u=><option key={u} value={u}>{u==='custom'?t('unit_custom'):u}</option>)}</select></Field>
      </div>
      {unit === 'custom' && <Field label={t('label_custom_unit')}><input value={customUnit} onChange={e=>setCustomUnit(e.target.value)} placeholder={t('custom_unit_placeholder')} className={inputCls} {...noAutofillProps}/></Field>}

      <Field label={t('label_category')}><div className="flex gap-2 overflow-x-auto no-scrollbar pb-1.5">{FOOD_CATEGORIES.map(c=><CatChip key={c.id} selected={category===c.id} color={c.color} icon={c.icon} onClick={()=>setCategory(c.id)}>{catLabel(c,lang)}</CatChip>)}</div></Field>

      <Field label={t('label_good_until')} hint={t('expiry_optional_hint')}><input type="date" value={goodUntil} onChange={e=>onGoodUntilChange(e.target.value)} className={inputCls}/></Field>

      <button type="button" onClick={()=>setDetailsOpen(v=>!v)} className="w-full flex items-center justify-between bg-card border border-line rounded-2xl px-4 py-3.5 mb-4 text-kale cursor-pointer shadow-[var(--shadow-sm)]">
        <span className="flex items-center gap-2 font-semibold text-sm"><Package size={17}/>{t('more_details')}</span>
        {detailsOpen ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
      </button>

      {detailsOpen && <div className="bg-card border border-line rounded-[24px] p-3.5 mb-4 shadow-[var(--shadow-sm)]">
        <Field label={t('label_date_added')}><input type="date" value={dateAdded} onChange={e=>setDateAdded(e.target.value)} className={inputCls}/></Field>
        <Field label={t('label_opened_date')}><input type="date" value={openedAt} onChange={e=>setOpenedAt(e.target.value)} className={inputCls}/></Field>
        <div className="grid grid-cols-2 gap-2.5">
          <Field label={t('label_brand')}><input value={brand} onChange={e=>setBrand(e.target.value)} placeholder={t('brand_placeholder')} className={inputCls} {...noAutofillProps}/></Field>
          <Field label={t('label_store')}><input value={store} onChange={e=>setStore(e.target.value)} placeholder={t('supermarket_placeholder')} className={inputCls} {...noAutofillProps}/></Field>
        </div>
        <Field label={t('label_price_iqd')}><input value={price} onChange={e=>setPrice(e.target.value)} inputMode="decimal" placeholder={t('price_placeholder')} className={inputCls} {...noAutofillProps}/></Field>

        <div className={`flex items-center justify-between bg-frost rounded-2xl px-3.5 py-[13px] ${goodUntil?'mb-3':'mb-1 opacity-60'}`}>
          <div><div className="text-[14.5px] font-semibold">{t('label_remind')}</div>{!goodUntil&&<div className="text-xs text-fog mt-0.5">{t('reminder_needs_expiry')}</div>}</div>
          <Switch on={reminderOn && !!goodUntil} onToggle={goodUntil ? onReminderToggle : ()=>{}}/>
        </div>
        {reminderOn && goodUntil && <Field label={t('label_reminder_time')}><input type="datetime-local" value={reminderAt || defaultReminderAt(goodUntil)} onChange={e=>setReminderAt(e.target.value)} className={inputCls}/></Field>}
        <Field label={t('label_note')}><textarea value={note} onChange={e=>setNote(e.target.value)} placeholder={t('note_placeholder')} className={`${inputCls} resize-y min-h-[84px]`} {...noAutofillProps}/></Field>
      </div>}
    </div>

    <div className="shrink-0 py-3.5 px-3 glass border-t border-line sticky bottom-0"><div className="flex gap-2.5">
      <IconButton onClick={goBack} icon={X} label={t('btn_cancel')} variant="ghost"/>
      {isEdit&&<IconButton onClick={handleAddToShopping} icon={ShoppingCart} label={t('btn_add_to_shopping')} variant="ghost"/>}
      {isEdit&&<IconButton onClick={handleDelete} icon={Trash2} label={t('btn_delete')} variant="danger"/>}
      <IconButton onClick={handleSave} disabled={saving} icon={Check} label={isEdit?t('btn_save_changes'):t('btn_add_to_fridge')} variant="primary" grow/>
    </div></div>
  </>;
}

const inputCls='w-full px-3.5 py-[13px] rounded-[16px] border border-line text-[15px] text-kale bg-card focus:outline-2 focus:outline-mint focus:border-mint';
function Field({label,hint,children}){return <div className="mb-4"><div className="flex items-end justify-between gap-2 mb-[7px]"><label className="block text-[12.5px] font-bold text-fog">{label}</label>{hint&&<span className="text-[11px] text-fog">{hint}</span>}</div>{children}</div>}
