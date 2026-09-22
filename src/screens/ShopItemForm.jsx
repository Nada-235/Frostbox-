import { useMemo, useRef, useState } from 'react';
import { X, Check, Trash2, Plus, Camera, TrendingDown, Store } from 'lucide-react';
import { useAppState, useAppDispatch } from '../app/AppContext.jsx';
import { useT } from '../lib/useT.js';
import { SHOP_CATEGORIES } from '../lib/constants.js';
import { catLabel, backArrow } from '../lib/formatting.js';
import { uid, catalogIdFromName, mergePrices } from '../lib/utils.js';
import { saveShoppingItem, deleteShoppingItem, upsertCatalogItem } from '../lib/firebase.js';
import { CatChip, IconButton } from '../components/ui.jsx';

function blankItem(){
  return { id: null, name: '', category: 'other', prices: [], photo: null, brand: '', size: '' };
}

export function ShopItemForm(){
  const state = useAppState();
  const dispatch = useAppDispatch();
  const t = useT();
  const lang = state.lang;
  const original = state.editingShopItem || blankItem();
  const isEdit = !!original.id;
  const fileInputRef = useRef(null);

  const [name, setName] = useState(original.name);
  const [category, setCategory] = useState(original.category || 'other');
  const [prices, setPrices] = useState(original.prices ? original.prices.slice() : []);
  const [photo, setPhoto] = useState(original.photo || null);
  const [brand, setBrand] = useState(original.brand || '');
  const [size, setSize] = useState(original.size || '');
  const [place, setPlace] = useState('');
  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);

  const catalog = state.data.catalog || [];
  const matchedCatalogEntry = useMemo(() => {
    const trimmed = name.trim();
    if(!trimmed) return null;
    const id = catalogIdFromName(trimmed);
    return catalog.find(c => c.id === id) || null;
  }, [name, catalog]);

  const comparePrices = useMemo(() => {
    const list = (matchedCatalogEntry?.prices || []).filter(p => !isNaN(parseFloat(p.price)));
    return list.slice().sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  }, [matchedCatalogEntry]);

  const avgMarketPrice = useMemo(() => {
    if(!comparePrices.length) return null;
    const sum = comparePrices.reduce((s, p) => s + parseFloat(p.price), 0);
    return (sum / comparePrices.length).toFixed(2);
  }, [comparePrices]);

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

  function addPrice(){
    const p = place.trim();
    const amount = price.trim();
    if(!p || !amount) return;
    setPrices(prev => [...prev, { id: uid(), place: p, price: amount }]);
    setPlace('');
    setPrice('');
  }

  function removePrice(id){
    setPrices(prev => prev.filter(p => p.id !== id));
  }

  async function handleSave(){
    const trimmedName = name.trim();
    if(!trimmedName){ alert(t('name_required_alert')); return; }
    const trimmedBrand = brand.trim();
    const trimmedSize = size.trim();
    const newItem = {
      id: original.id || uid(),
      name: trimmedName,
      category,
      prices,
      photo,
      brand: trimmedBrand,
      size: trimmedSize,
      checked: original.id ? !!original.checked : false,
    };
    setSaving(true);
    try{
      await saveShoppingItem(state.code, newItem);
      await upsertCatalogItem(state.code, {
        name: trimmedName,
        photo: photo || matchedCatalogEntry?.photo || null,
        brand: trimmedBrand || matchedCatalogEntry?.brand || '',
        size: trimmedSize || matchedCatalogEntry?.size || '',
        prices: mergePrices(matchedCatalogEntry?.prices, prices),
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

  const sortedPrices = prices.slice().sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  const bestId = sortedPrices[0]?.id;
  const cheapestCompareId = comparePrices[0]?.id;

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
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t('name_placeholder_shop')} className={inputCls} />
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

      <div className="flex gap-2.5">
        <div className="flex-1 min-w-0">
          <Field label={t('label_brand')}>
            <input type="text" value={brand} onChange={e => setBrand(e.target.value)} placeholder={t('brand_placeholder')} className={inputCls} />
          </Field>
        </div>
        <div className="flex-1 min-w-0">
          <Field label={t('label_size')}>
            <input type="text" value={size} onChange={e => setSize(e.target.value)} placeholder={t('size_placeholder')} className={inputCls} />
          </Field>
        </div>
      </div>

      {comparePrices.length > 0 && (
        <div className="bg-card border border-line rounded-2xl px-3.5 py-3.5 mb-4">
          <div className="flex items-center gap-1.5 mb-0.5 text-[12.5px] font-bold text-fog uppercase tracking-[0.05em] rtl:tracking-normal rtl:normal-case">
            <TrendingDown size={14} strokeWidth={2.25} /> {t('compare_title')}
          </div>
          <p className="text-[12px] text-fog mb-2.5">{t('compare_subtitle')}</p>
          {matchedCatalogEntry?.brand && (
            <div className="text-[13px] font-semibold mb-2">{t('compare_known_brand', matchedCatalogEntry.brand)}</div>
          )}
          {comparePrices.map(p => (
            <div key={p.id || p.place} className="flex items-center gap-2.5 py-1.5 border-b border-line last:border-b-0">
              <Store size={13} strokeWidth={2.25} className="text-fog shrink-0" />
              <span className="flex-1 min-w-0 text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">{p.place}</span>
              {(p.id || p.place) === cheapestCompareId && (
                <span className="text-[10.5px] font-bold bg-[#E9F1DC] text-[#3F6B2A] py-[3px] px-2 rounded-lg shrink-0 uppercase rtl:normal-case tracking-[0.04em] rtl:tracking-normal">
                  {t('compare_cheapest')}
                </span>
              )}
              <span className="force-mono font-semibold text-sm shrink-0">{String(p.price)}</span>
            </div>
          ))}
          {avgMarketPrice && (
            <div className="text-[12.5px] text-fog font-semibold mt-2.5">{t('compare_avg', avgMarketPrice)}</div>
          )}
        </div>
      )}

      <Field label={t('label_prices')}>
        {!prices.length ? (
          <p className="text-[13px] text-fog mb-2.5">{t('no_prices_yet')}</p>
        ) : (
          <div>
            {sortedPrices.map(p => (
              <div key={p.id} className="flex items-center gap-2.5 bg-card border border-line rounded-[13px] px-3.5 py-[11px] mb-2">
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span className="text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{p.place}</span>
                  {p.id === bestId && (
                    <span className="text-[10.5px] font-bold bg-[#E9F1DC] text-[#3F6B2A] py-[3px] px-2 rounded-lg shrink-0 uppercase rtl:normal-case tracking-[0.04em] rtl:tracking-normal">
                      {t('best_price_badge')}
                    </span>
                  )}
                </div>
                <div className="force-mono font-semibold text-sm shrink-0">{String(p.price)}</div>
                <button onClick={() => removePrice(p.id)} className="bg-transparent border-none text-fog cursor-pointer p-0.5 shrink-0 flex items-center justify-center">
                  <X size={14} strokeWidth={2.25} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-1.5 mb-[18px]">
          <input
            type="text" value={place} onChange={e => setPlace(e.target.value)}
            placeholder={t('place_placeholder')}
            className="flex-[1.3] min-w-0 px-[13px] py-3 rounded-xl border-[1.5px] border-line text-[14.5px] text-kale bg-card"
          />
          <input
            type="text" value={price} onChange={e => setPrice(e.target.value)} inputMode="decimal"
            placeholder={t('price_placeholder')}
            className="flex-1 min-w-0 px-[13px] py-3 rounded-xl border-[1.5px] border-line text-[14.5px] text-kale bg-card"
          />
          <button onClick={addPrice} className="btn-brand w-11 shrink-0 rounded-xl border-none cursor-pointer flex items-center justify-center">
            <Plus size={20} strokeWidth={2.25} />
          </button>
        </div>
      </Field>

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
