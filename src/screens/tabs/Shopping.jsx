import { useState } from 'react';
import { Check, X, Tag, ClipboardList, Package } from 'lucide-react';
import { useAppState, useAppDispatch } from '../../app/AppContext.jsx';
import { useT } from '../../lib/useT.js';
import { SHOP_CATEGORIES } from '../../lib/constants.js';
import { catLabel, formatIQD } from '../../lib/formatting.js';
import { uid } from '../../lib/utils.js';
import { setListView } from '../../lib/localStorage.js';
import { quickAddShoppingItem, toggleShoppingItem, deleteShoppingItem } from '../../lib/firebase.js';
import { SectionLabel, EmptyState, noAutofillProps, ViewToggle } from '../../components/ui.jsx';

function ShopRow({ item, t, color, onOpen }){
  const meta = [item.brand, item.size].filter(Boolean).join(' · ');
  let priceLine = null;
  if(item.supermarket && item.price){
    priceLine = (
      <div className="text-xs text-teal font-bold mt-0.5 flex items-center gap-1 whitespace-nowrap overflow-hidden text-ellipsis">
        <Tag size={11} strokeWidth={2.25} className="shrink-0" /> {formatIQD(item.price)} · {item.supermarket}{meta ? ` (${meta})` : ''}
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

function ShopCardGrid({ item, color, onOpen }){
  const meta = [item.brand, item.size].filter(Boolean).join(' · ');
  const hasPrice = item.supermarket && item.price;

  return (
    <div className="bg-card rounded-[22px] overflow-hidden shadow-[var(--shadow-app)] border border-line relative">
      <button
        onClick={() => toggleShoppingItem(item.householdCode, item.id, !item.checked)}
        className="absolute top-1.5 start-1.5 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center text-card transition-colors"
        style={{ borderColor: color || 'var(--color-mint)', background: item.checked ? (color || 'var(--color-mint)') : 'var(--color-card)' }}
      >
        {item.checked && <Check size={12} strokeWidth={3} />}
      </button>
      <button
        onClick={() => deleteShoppingItem(item.householdCode, item.id)}
        className="absolute top-1.5 end-1.5 z-10 w-6 h-6 rounded-full bg-card border border-line flex items-center justify-center text-fog"
      >
        <X size={12} strokeWidth={2.25} />
      </button>
      <div onClick={onOpen} className="w-full aspect-square bg-track flex items-center justify-center overflow-hidden cursor-pointer text-fog">
        {item.photo ? <img src={item.photo} alt="" className="w-full h-full object-cover" /> : <Package size={28} strokeWidth={1.5} />}
      </div>
      <div onClick={onOpen} className="p-2.5 cursor-pointer">
        <div className={`font-semibold text-[13.5px] whitespace-nowrap overflow-hidden text-ellipsis ${item.checked ? 'text-fog line-through' : ''}`}>{item.name}</div>
        {hasPrice && (
          <div className="text-[11px] text-teal font-bold mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
            {formatIQD(item.price)} · {item.supermarket}{meta ? ` (${meta})` : ''}
          </div>
        )}
      </div>
    </div>
  );
}

export function ShoppingHeader(){
  const state = useAppState();
  const t = useT();
  return (
    <div className="flex items-center justify-between pb-4">
      <div>
        <div className="text-[13px] text-fog font-medium">{state.code}</div>
        <h1 className="font-display rtl:font-arabic text-[28px] font-bold m-0 text-kale">{t('shopping_list_title')}</h1>
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
  const { listView } = state;

  function openItem(item){
    dispatch({ type: 'SET_EDITING_SHOP_ITEM', item });
    dispatch({ type: 'SET_SCREEN', screen: 'shopadd' });
  }

  function changeView(view){
    setListView(view);
    dispatch({ type: 'SET_LIST_VIEW', view });
  }

  function renderItems(items, color){
    if(listView === 'grid'){
      return (
        <div className="grid grid-cols-2 gap-2.5">
          {items.map(item => <ShopCardGrid key={item.id} item={withCode(item)} color={color} onOpen={() => openItem(item)} />)}
        </div>
      );
    }
    return items.map(item => <ShopRow key={item.id} item={withCode(item)} t={t} color={color} onOpen={() => openItem(item)} />);
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
              {renderItems(items, cat.color)}
            </div>
          );
        })}
        {done.length > 0 && (
          <div>
            <SectionLabel>{t('checked_off')}</SectionLabel>
            {renderItems(done)}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex gap-2 mb-2 pt-3">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if(e.key === 'Enter') addQuick(); }}
          placeholder={t('add_item_placeholder')}
          className="flex-1 px-[15px] py-[13px] rounded-[13px] border-[1.5px] border-line text-[15px] text-kale bg-card"
          name="fb-quick-add" {...noAutofillProps}
        />
      </div>
      <div className="flex justify-end mb-[18px]">
        <ViewToggle value={listView} onChange={changeView} floating />
      </div>
      {sections}
    </>
  );
}
