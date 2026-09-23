import { useMemo, useRef, useState } from 'react';
import { X, Check, Trash2, Camera, TrendingDown, Store, Search } from 'lucide-react';
import { useAppState, useAppDispatch } from '../app/AppContext.jsx';
import { useT } from '../lib/useT.js';
import { SHOP_CATEGORIES } from '../lib/constants.js';
import { catLabel, backArrow, formatIQD } from '../lib/formatting.js';
import { uid, catalogIdFromName, catalogRecords, mergeRecords } from '../lib/utils.js';
import { saveShoppingItem, deleteShoppingItem, upsertCatalogItem } from '../lib/firebase.js';
import { CatChip, IconButton, noAutofillProps } from '../components/ui.jsx';

function blankItem(){
  return { id: null, name: '', category: 'other', photo: null, brand: '', size: '', supermarket: '', price: '' };
}

export function ShopItemForm(){
  const state = useAppState();
  const dispatch = useAppDispatch();
  const t = useT();
  const lang = state.lang;
  const original = state.editingShopItem || blankItem();
  const isEdit = !!original.id;
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false);

  const [name, setName] = useState(original.name);
  const [category, setCategory] = useState(original.category || 'other');
  const [photo, setPhoto] = useState(original.photo || null);
  const [brand, setBrand] = useState(original.brand || '');
  const [size, setSize] = useState(original.size || '');
  const [supermarket, setSupermarket] = useState(original.supermarket || '');
  const [price, setPrice] = useState(original.price ? String(original.price) : '');
  const [saving, setSaving] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);

  const catalog = state.data.catalog || [];
  const matchedCatalogEntry = useMemo(() => {
    const trimmed = name.trim();
    if(!trimmed) return null;
    const id = catalogIdFromName(trimmed);
    return catalog.find(c => c.id === id) || null;
  }, [name, catalog]);

  const records = useMemo(() => {
    return catalogRecords(matchedCatalogEntry)
      .filter(r => !isNaN(parseFloat(r.price)))
      .slice()
      .sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  }, [matchedCatalogEntry]);
  const cheapestRecordId = records[0]?.id;

  const suggestions = useMemo(() => {
    const q = name.trim().toLowerCase();
    if(!q) return [];
    return catalog
      .filter(c => c.name.toLowerCase() !== q && c.name.toLowerCase().includes(q))
      .sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(q) ? 0 : 1;
        const bStarts = b.name.toLowerCase().startsWith(q) ? 0 : 1;
        return aStarts !== bStarts ? aStarts - bStarts : a.name.localeCompare(b.name);
      })
      .slice(0, 5);
  }, [name, catalog]);
  const showSuggestions = nameFocused && suggestions.length > 0;

  function selectSuggestion(entry){
    setName(entry.name);
    setNameFocused(false);
  }

  function selectRecord(record){
    setBrand(record.brand || '');
    setSize(record.size || '');
    setSupermarket(record.supermarket || '');
    setPrice(record.price !== undefined && record.price !== null ? String(record.price) : '');
  }

  function goBack(){
    dispatch({ type: 'SET_EDITING_SHOP_ITEM', item: null });
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

  async function handleSave(){
    const trimmedName = name.trim();
    if(!trimmedName){ alert(t('name_required_alert')); return; }
    const trimmedBrand = brand.trim();
    const trimmedSize = size.trim();
    const trimmedSupermarket = supermarket.trim();
    const trimmedPrice = price.trim();
    const newItem = {
      id: original.id || uid(),
      name: trimmedName,
      category,
      photo,
      brand: trimmedBrand,
      size: trimmedSize,
      supermarket: trimmedSupermarket,
      price: trimmedPrice,
      checked: original.id ? !!original.checked : false,
    };
    setSaving(true);
    try{
      await saveShoppingItem(state.code, newItem);
      const hasRecord = trimmedSupermarket && trimmedPrice;
      await upsertCatalogItem(state.code, {
        name: trimmedName,
        photo: photo || matchedCatalogEntry?.photo || null,
        records: hasRecord
          ? mergeRecords(catalogRecords(matchedCatalogEntry), [{
              id: uid(), brand: trimmedBrand, size: trimmedSize, supermarket: trimmedSupermarket, price: trimmedPrice,
            }])
          : catalogRecords(matchedCatalogEntry),
      });
      dispatch({ type: 'SET_EDITING_SHOP_ITEM', item: null });
      dispatch({ type: 'SET_TAB', tab: 'shopping' });
      dispatch({ type: 'SET_SCREEN', screen: 'main' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(){
    if(!confirm(t('confirm_delete_shop', original.name))) return;
    await deleteShoppingItem(state.code, original.id);
    dispatch({ type: 'SET_EDITING_SHOP_ITEM', item: null });
    dispatch({ type: 'SET_TAB', tab: 'shopping' });
    dispatch({ type: 'SET_SCREEN', screen: 'main' });
  }

  const BackIcon = backArrow(lang);

  return (
    <>
      <div
        className="shrink-0 flex items-center gap-2.5 px-3 pb-[18px] sticky top-0 z-[100]"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}
      >
        <button onClick={goBack} className="icon-btn-float w-9 h-9 rounded-full border-none flex items-center justify-center cursor-pointer text-kale shrink-0">
          <BackIcon size={18} strokeWidth={2.25} />
        </button>
        <h2 className={`text-[19px] font-bold m-0 text-kale ${lang === 'ar' ? 'font-arabic' : 'font-display'}`}>{isEdit ? t('edit_item') : t('add_item')}</h2>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden animate-fade-in-up px-3 pt-3 pb-10">
      <button
        type="button"
        onClick={() => setPhotoPickerOpen(true)}
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
      <input ref={fileInputRef} type="file" accept="image/*" onChange={onPhotoChange} className="hidden" />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={onPhotoChange} className="hidden" />
      {photoPickerOpen && (
        <div className="fixed inset-0 z-[250] bg-black/30 flex items-end justify-center p-3" onClick={() => setPhotoPickerOpen(false)}>
          <div className="w-full max-w-[420px] bg-card rounded-[24px] p-3 shadow-[var(--shadow-app)]" onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => { setPhotoPickerOpen(false); cameraInputRef.current?.click(); }} className="w-full py-3.5 rounded-2xl bg-frost text-kale font-semibold mb-2">Take photo</button>
            <button type="button" onClick={() => { setPhotoPickerOpen(false); fileInputRef.current?.click(); }} className="w-full py-3.5 rounded-2xl bg-frost text-kale font-semibold mb-2">Choose from gallery</button>
            <button type="button" onClick={() => setPhotoPickerOpen(false)} className="w-full py-3.5 rounded-2xl bg-transparent text-fog font-semibold">Cancel</button>
          </div>
        </div>
      )}

      <Field label={t('label_name')}>
        <div className="relative">
          <input
            type="text" value={name} onChange={e => setName(e.target.value)}
            onFocus={() => setNameFocused(true)} onBlur={() => setNameFocused(false)}
            placeholder={t('name_placeholder_shop')} className={inputCls}
            name="fb-shop-item-name" {...noAutofillProps}
          />
          {showSuggestions && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-card border border-line rounded-2xl shadow-[var(--shadow-app)] z-20 overflow-hidden">
              {suggestions.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => selectSuggestion(s)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-start bg-transparent border-0 border-b border-line last:border-b-0 cursor-pointer active:bg-frost"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-track flex items-center justify-center">
                    {s.photo ? <img src={s.photo} alt="" className="w-full h-full object-cover" /> : <Search size={13} strokeWidth={2} className="text-fog" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">{s.name}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </Field>

      <Field label={t('label_category')}>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1.5">
          {SHOP_CATEGORIES.map(c => (
            <CatChip key={c.id} selected={category === c.id} color={c.color} icon={c.icon} onClick={() => setCategory(c.id)}>
              {catLabel(c, lang)}
            </CatChip>
          ))}
        </div>
      </Field>

      {records.length > 0 && (
        <div className="bg-card border border-line rounded-2xl px-3.5 py-3.5 mb-4">
          <div className="flex items-center gap-1.5 mb-0.5 text-[12.5px] font-bold text-fog uppercase tracking-[0.05em] rtl:tracking-normal rtl:normal-case">
            <TrendingDown size={14} strokeWidth={2.25} /> {t('compare_title')}
          </div>
          <p className="text-[12px] text-fog mb-2.5">{t('compare_subtitle')}</p>
          {records.map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => selectRecord(r)}
              className="w-full flex items-center gap-2.5 py-2 border-b border-line last:border-b-0 text-start bg-transparent border-t-0 border-x-0 cursor-pointer active:bg-frost"
            >
              <Store size={13} strokeWidth={2.25} className="text-fog shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">{r.supermarket}</div>
                {(r.brand || r.size) && (
                  <div className="text-xs text-fog whitespace-nowrap overflow-hidden text-ellipsis">{[r.brand, r.size].filter(Boolean).join(' · ')}</div>
                )}
              </div>
              {r.id === cheapestRecordId && (
                <span className="text-[10.5px] font-bold bg-[#E9F1DC] text-[#3F6B2A] py-[3px] px-2 rounded-lg shrink-0 uppercase rtl:normal-case tracking-[0.04em] rtl:tracking-normal">
                  {t('compare_cheapest')}
                </span>
              )}
              <span className="force-mono font-semibold text-sm shrink-0">{formatIQD(r.price)}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2.5">
        <div className="flex-1 min-w-0">
          <Field label={t('label_brand')}>
            <input type="text" value={brand} onChange={e => setBrand(e.target.value)} placeholder={t('brand_placeholder')} className={inputCls} name="fb-shop-item-brand" {...noAutofillProps} />
          </Field>
        </div>
        <div className="flex-1 min-w-0">
          <Field label={t('label_size')}>
            <input type="text" value={size} onChange={e => setSize(e.target.value)} placeholder={t('size_placeholder')} className={inputCls} name="fb-shop-item-size" {...noAutofillProps} />
          </Field>
        </div>
      </div>

      <div className="flex gap-2.5">
        <div className="flex-1 min-w-0">
          <Field label={t('label_supermarket')}>
            <input type="text" value={supermarket} onChange={e => setSupermarket(e.target.value)} placeholder={t('supermarket_placeholder')} className={inputCls} name="fb-shop-item-supermarket" {...noAutofillProps} />
          </Field>
        </div>
        <div className="flex-1 min-w-0">
          <Field label={t('label_price_iqd')}>
            <input type="text" value={price} onChange={e => setPrice(e.target.value)} inputMode="decimal" placeholder={t('price_placeholder')} className={inputCls} name="fb-shop-item-price" {...noAutofillProps} />
          </Field>
        </div>
      </div>

      <div className="flex gap-2.5">
        <IconButton onClick={goBack} icon={X} label={t('btn_cancel')} variant="ghost" />
        {isEdit && <IconButton onClick={handleDelete} icon={Trash2} label={t('btn_delete')} variant="danger" />}
        <IconButton onClick={handleSave} disabled={saving} icon={Check} label={t('btn_save_item')} variant="primary" grow />
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
