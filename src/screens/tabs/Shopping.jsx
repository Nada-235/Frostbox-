import { useState } from 'react';
import { Check, X, Tag, ClipboardList } from 'lucide-react';
import { useAppState, useAppDispatch } from '../../app/AppContext.jsx';
import { useT } from '../../lib/useT.js';
import { SHOP_CATEGORIES } from '../../lib/constants.js';
import { catLabel } from '../../lib/formatting.js';
import { uid } from '../../lib/utils.js';
import { quickAddShoppingItem, toggleShoppingItem, deleteShoppingItem } from '../../lib/firebase.js';
import { SectionLabel, EmptyState } from '../../components/ui.jsx';

function ShopRow({ item, t, color, onOpen }){
  const prices = item.prices || [];
  let priceLine = null;
  if(prices.length){
    const sorted = prices.slice().sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    const best = sorted[0];
    const more = prices.length > 1 ? ` +${prices.length - 1} ${t('more_suffix')}` : '';
    priceLine = (
      <div className="text-xs text-teal font-bold mt-0.5 flex items-center gap-1 whitespace-nowrap overflow-hidden text-ellipsis">
        <Tag size={11} strokeWidth={2.25} className="shrink-0" /> {String(best.price)} · {best.place}{more}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-card border border-line rounded-2xl px-3.5 py-3.5 mb-2.5">
      <button
        onClick={() => toggleShoppingItem(item.householdCode, item.id, !item.checked)}
        className="w-[23px] h-[23px] rounded-full border-2 shrink-0 cursor-pointer flex items-center justify-center text-card transition-colors"
        style={{ borderColor: color || 'var(--color-mint)', background: item.checked ? (color || 'var(--color-mint)') : 'transparent' }}
      >
        {item.checked && <Check size={13} strokeWidth={3} />}
      </button>
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onOpen}>
        <div className={`text-[15px] font-medium whitespace-nowrap overflow-hidden text-ellipsis ${item.checked ? 'text-fog line-through' : ''}`}>{item.name}</div>
        {priceLine}
      </div>
      <button
        onClick={() => deleteShoppingItem(item.householdCode, item.id)}
        className="bg-transparent border-none text-fog cursor-pointer p-1 shrink-0 flex items-center justify-center"
      >
        <X size={16} strokeWidth={2.25} />
      </button>
    </div>
  );
}

export function ShoppingHeader(){
  const state = useAppState();
  const t = useT();
  return (
    <div className="flex items-center justify-between pb-4">
      <div>
        <div className="text-[13px] text-card/80 font-medium">{state.code}</div>
        <h1 className="font-display rtl:font-arabic text-2xl m-0 text-card">{t('shopping_list_title')}</h1>
      </div>
    </div>
  );
}

export function ShoppingBody(){
  const state = useAppState();
  const dispatch = useAppDispatch();
  const t = useT();
  const [value, setValue] = useState('');
  const list = state.data.shopping || [];
  const pending = list.filter(i => !i.checked);
  const done = list.filter(i => i.checked);
  const withCode = item => ({ ...item, householdCode: state.code });

  function openItem(item){
    dispatch({ type: 'SET_EDITING_SHOP_ITEM', item });
    dispatch({ type: 'SET_SCREEN', screen: 'shopadd' });
  }

  async function addQuick(){
    const name = value.trim();
    if(!name) return;
    setValue('');
    await quickAddShoppingItem(state.code, uid(), name);
  }

  let sections;
  if(!list.length){
    sections = <EmptyState icon={ClipboardList}>{t('empty_shopping')}</EmptyState>;
  } else {
    sections = (
      <>
        {SHOP_CATEGORIES.map(cat => {
          const items = pending.filter(i => (i.category || 'other') === cat.id);
          if(!items.length) return null;
          return (
            <div key={cat.id}>
              <SectionLabel icon={cat.icon} color={cat.color}>{catLabel(cat, state.lang)}</SectionLabel>
              {items.map(item => <ShopRow key={item.id} item={withCode(item)} t={t} color={cat.color} onOpen={() => openItem(item)} />)}
            </div>
          );
        })}
        {done.length > 0 && (
          <div>
            <SectionLabel>{t('checked_off')}</SectionLabel>
            {done.map(item => <ShopRow key={item.id} item={withCode(item)} t={t} onOpen={() => openItem(item)} />)}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex gap-2 mb-[18px] pt-3">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if(e.key === 'Enter') addQuick(); }}
          placeholder={t('add_item_placeholder')}
          className="flex-1 px-[15px] py-[13px] rounded-[13px] border-[1.5px] border-line text-[15px] text-kale bg-card"
        />
      </div>
      {sections}
    </>
  );
}
