import { Plus, X, Tag, Database } from 'lucide-react';
import { useAppState, useAppDispatch } from '../app/AppContext.jsx';
import { useT } from '../lib/useT.js';
import { backArrow, formatIQD } from '../lib/formatting.js';
import { catalogRecords } from '../lib/utils.js';
import { setListView } from '../lib/localStorage.js';
import { deleteCatalogItem } from '../lib/firebase.js';
import { EmptyState, ViewToggle } from '../components/ui.jsx';

function CatalogRow({ item, t, onOpen, onDelete }){
  const records = catalogRecords(item).filter(r => !isNaN(parseFloat(r.price)));
  let priceLine = null;
  if(records.length){
    const sorted = records.slice().sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    const best = sorted[0];
    const meta = [best.brand, best.size].filter(Boolean).join(' · ');
    const more = records.length > 1 ? ` +${records.length - 1} ${t('more_suffix')}` : '';
    priceLine = (
      <div className="text-xs text-teal font-bold mt-0.5 flex items-center gap-1 whitespace-nowrap overflow-hidden text-ellipsis">
        <Tag size={11} strokeWidth={2.25} className="shrink-0" /> {formatIQD(best.price)} · {best.supermarket}{meta ? ` (${meta})` : ''}{more}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-card border border-line rounded-2xl px-3.5 py-3.5 mb-2.5">
      <button
        onClick={onOpen}
        className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-track flex items-center justify-center cursor-pointer border-none p-0"
      >
        {item.photo ? (
          <img src={item.photo} alt="" className="w-full h-full object-cover" />
        ) : (
          <Database size={17} strokeWidth={1.75} className="text-fog" />
        )}
      </button>
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onOpen}>
        <div className="text-[15px] font-medium whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</div>
        {priceLine}
      </div>
      <button
        onClick={onDelete}
        className="bg-transparent border-none text-fog cursor-pointer p-1 shrink-0 flex items-center justify-center"
      >
        <X size={16} strokeWidth={2.25} />
      </button>
    </div>
  );
}

function CatalogCardGrid({ item, t, onOpen, onDelete }){
  const records = catalogRecords(item).filter(r => !isNaN(parseFloat(r.price)));
  const best = records.length ? records.slice().sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[0] : null;

  return (
    <div className="bg-card rounded-[22px] overflow-hidden shadow-[var(--shadow-app)] border border-line relative">
      <button
        onClick={onDelete}
        className="absolute top-1.5 end-1.5 z-10 w-6 h-6 rounded-full bg-card border border-line flex items-center justify-center text-fog"
      >
        <X size={12} strokeWidth={2.25} />
      </button>
      <div onClick={onOpen} className="w-full aspect-square bg-track flex items-center justify-center overflow-hidden cursor-pointer text-fog">
        {item.photo ? <img src={item.photo} alt="" className="w-full h-full object-cover" /> : <Database size={26} strokeWidth={1.5} />}
      </div>
      <div onClick={onOpen} className="p-2.5 cursor-pointer">
        <div className="font-semibold text-[13.5px] whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</div>
        {best && (
          <div className="text-[11px] text-teal font-bold mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
            {formatIQD(best.price)} · {best.supermarket}
          </div>
        )}
      </div>
    </div>
  );
}

export function CatalogList(){
  const state = useAppState();
  const dispatch = useAppDispatch();
  const t = useT();
  const lang = state.lang;
  const list = (state.data.catalog || []).slice().sort((a, b) => a.name.localeCompare(b.name));

  function goBack(){
    dispatch({ type: 'SET_SCREEN', screen: 'main' });
  }

  function openItem(item){
    dispatch({ type: 'SET_EDITING_CATALOG_ITEM', item });
    dispatch({ type: 'SET_SCREEN', screen: 'catalogadd' });
  }

  function openAdd(){
    dispatch({ type: 'SET_EDITING_CATALOG_ITEM', item: null });
    dispatch({ type: 'SET_SCREEN', screen: 'catalogadd' });
  }

  async function handleDelete(item){
    if(!confirm(t('confirm_delete_catalog', item.name))) return;
    await deleteCatalogItem(state.code, item.id);
  }

  function changeView(view){
    setListView(view);
    dispatch({ type: 'SET_LIST_VIEW', view });
  }

  const BackIcon = backArrow(lang);
  const { listView } = state;

  return (
    <>
      <div
        className="shrink-0 flex items-center gap-2.5 px-3 pb-[18px] sticky top-0 z-[100]"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}
      >
        <button onClick={goBack} className="icon-btn-float w-9 h-9 rounded-full border-none flex items-center justify-center cursor-pointer text-kale shrink-0">
          <BackIcon size={18} strokeWidth={2.25} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className={`text-[19px] font-bold m-0 text-kale ${lang === 'ar' ? 'font-arabic' : 'font-display'}`}>{t('catalog_title')}</h2>
          {list.length > 0 && <div className="text-[12px] text-fog mt-0.5">{t('entries_count', list.length)}</div>}
        </div>
        <button
          onClick={openAdd}
          className="icon-btn-float w-9 h-9 rounded-full border-none text-kale flex items-center justify-center cursor-pointer shrink-0"
        >
          <Plus size={18} strokeWidth={2.25} />
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden animate-fade-in-up px-3 pt-3 pb-10">
        {!list.length ? (
          <EmptyState icon={Database}>{t('empty_catalog')}</EmptyState>
        ) : (
          <>
            <div className="flex justify-end mb-2.5">
              <ViewToggle value={listView} onChange={changeView} />
            </div>
            {listView === 'grid' ? (
              <div className="grid grid-cols-2 gap-2.5">
                {list.map(item => (
                  <CatalogCardGrid key={item.id} item={item} t={t} onOpen={() => openItem(item)} onDelete={() => handleDelete(item)} />
                ))}
              </div>
            ) : (
              list.map(item => (
                <CatalogRow key={item.id} item={item} t={t} onOpen={() => openItem(item)} onDelete={() => handleDelete(item)} />
              ))
            )}
          </>
        )}
      </div>
    </>
  );
}
