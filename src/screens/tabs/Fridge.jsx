import { useState } from 'react';
import { Refrigerator, Snowflake, AlarmClock, SearchX, Search } from 'lucide-react';
import { useAppState, useAppDispatch } from '../../app/AppContext.jsx';
import { useT } from '../../lib/useT.js';
import { FOOD_CATEGORIES, catById } from '../../lib/constants.js';
import { catLabel, chipFor, fmtDate } from '../../lib/formatting.js';
import { daysUntil } from '../../lib/utils.js';
import { shareHouseholdCode } from '../../lib/share.js';
import { CatChip, SegButton, SectionLabel, EmptyState, ViewToggle } from '../../components/ui.jsx';
import { setListView } from '../../lib/localStorage.js';

const CHIP_STYLES = {
  fresh: 'bg-[#E9F1DC] text-[#3F6B2A]',
  soon: 'bg-[#FBEAD2] text-[#9C5A1F]',
  expired: 'bg-[#F6DCDC] text-berry',
};

function ItemCard({ item, lang, onOpen }){
  const chip = item.goodUntil ? chipFor(daysUntil(item.goodUntil), lang) : null;
  const category = catById(FOOD_CATEGORIES, item.category || 'other');
  const isFreezer = (item.location || 'fridge') === 'freezer';
  const CategoryIcon = category.icon;

  return (
    <div
      onClick={onOpen}
      className="bg-card rounded-[22px] p-3 flex items-center gap-3 mb-2.5 shadow-[var(--shadow-app)] cursor-pointer border border-line"
    >
      <div
        className="w-[52px] h-[52px] rounded-2xl shrink-0 flex items-center justify-center overflow-hidden relative"
        style={{ background: item.photo ? undefined : `${category.color}22`, color: item.photo ? undefined : category.color }}
      >
        {item.photo ? <img src={item.photo} alt="" className="w-full h-full object-cover" /> : <CategoryIcon size={22} strokeWidth={1.75} />}
        {isFreezer && (
          <span className="absolute -bottom-[3px] end-[-3px] w-[18px] h-[18px] rounded-full bg-card border border-line flex items-center justify-center text-mint-deep">
            <Snowflake size={11} strokeWidth={2.25} />
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[15px] mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</div>
        <div className="text-[12.5px] text-fog whitespace-nowrap overflow-hidden text-ellipsis">{item.note || [item.quantity && `${item.quantity} ${item.unit === 'custom' ? (item.customUnit || '') : (item.unit || '')}`, item.goodUntil && fmtDate(item.goodUntil, lang)].filter(Boolean).join(' · ')}</div>
      </div>
      {chip && <div className={`force-mono text-[11px] font-semibold py-1.5 px-2.5 rounded-[9px] tracking-[0.03em] rtl:tracking-normal shrink-0 whitespace-nowrap ${CHIP_STYLES[chip.cls]}`}>{chip.txt}</div>}
    </div>
  );
}

function ItemCardGrid({ item, lang, onOpen }){
  const chip = item.goodUntil ? chipFor(daysUntil(item.goodUntil), lang) : null;
  const category = catById(FOOD_CATEGORIES, item.category || 'other');
  const isFreezer = (item.location || 'fridge') === 'freezer';
  const CategoryIcon = category.icon;

  return (
    <div onClick={onOpen} className="bg-card rounded-[22px] overflow-hidden shadow-[var(--shadow-app)] cursor-pointer border border-line">
      <div
        className="w-full aspect-square relative flex items-center justify-center"
        style={{ background: item.photo ? undefined : `${category.color}1A`, color: item.photo ? undefined : category.color }}
      >
        {item.photo ? <img src={item.photo} alt="" className="w-full h-full object-cover" /> : <CategoryIcon size={30} strokeWidth={1.5} />}
        {isFreezer && (
          <span className="absolute top-1.5 end-1.5 w-6 h-6 rounded-full bg-card border border-line flex items-center justify-center text-mint-deep">
            <Snowflake size={12} strokeWidth={2.25} />
          </span>
        )}
        {chip && <span className={`absolute bottom-1.5 start-1.5 force-mono text-[10px] font-semibold py-1 px-2 rounded-lg tracking-[0.02em] rtl:tracking-normal ${CHIP_STYLES[chip.cls]}`}>
          {chip.txt}
        </span>}
      </div>
      <div className="p-2.5">
        <div className="font-semibold text-[13.5px] whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</div>
        <div className="text-[11.5px] text-fog whitespace-nowrap overflow-hidden text-ellipsis mt-0.5">{item.note || fmtDate(item.goodUntil, lang)}</div>
      </div>
    </div>
  );
}

export function FridgeHeader(){
  const state = useAppState();
  const t = useT();

  return (
    <div className="flex items-start justify-between pb-4">
      <div>
        <div className="text-[13px] text-fog font-medium flex items-center">
          <span className="w-2 h-2 rounded-full bg-mint inline-block me-1.5" />
          {state.synced ? t('synced') : t('connecting')}
        </div>
        <h1 className="font-display rtl:font-arabic text-[28px] font-bold m-0 text-kale">{t('your_fridge')}</h1>
      </div>
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={() => shareHouseholdCode(state.code, state.lang)}
          className="icon-btn-float force-mono text-mint-deep text-xs font-semibold tracking-wide px-3.5 py-2 rounded-full border-none cursor-pointer"
        >
          {state.code}
        </button>
      </div>
    </div>
  );
}

export function FridgeBody(){
  const state = useAppState();
  const dispatch = useAppDispatch();
  const t = useT();
  const { lang, locationFilter, categoryFilter, dueReminders, listView } = state;
  const [expiryFilter, setExpiryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  function changeView(view){
    setListView(view);
    dispatch({ type: 'SET_LIST_VIEW', view });
  }

  let items = state.data.items || [];
  const totalCount = items.length;
  const expiryCounts = items.reduce((counts, item) => {
    if(!item.goodUntil) return counts;
    const days = daysUntil(item.goodUntil);
    if(days < 0) counts.expired++;
    else if(days <= 3) counts.soon++;
    else counts.fresh++;
    return counts;
  }, { expired: 0, soon: 0, fresh: 0 });
  if(locationFilter !== 'all') items = items.filter(i => (i.location || 'fridge') === locationFilter);
  if(categoryFilter !== 'all') items = items.filter(i => (i.category || 'other') === categoryFilter);
  const q = searchQuery.trim().toLocaleLowerCase();
  if(q) items = items.filter(i => [i.name, i.brand, i.note, i.store].some(v => String(v || '').toLocaleLowerCase().includes(q)));
  if(expiryFilter !== 'all') items = items.filter(item => {
    if(!item.goodUntil) return false;
    const days = daysUntil(item.goodUntil);
    return expiryFilter === 'expired' ? days < 0 : expiryFilter === 'soon' ? days >= 0 && days <= 3 : days > 3;
  });

  function openItem(item){
    dispatch({ type: 'SET_EDITING_ITEM', item });
    dispatch({ type: 'SET_SCREEN', screen: 'add' });
  }

  const banner = dueReminders.length > 0 && (
    <div
      className="text-card rounded-2xl px-4 py-3.5 mb-4 flex items-center gap-2.5 shadow-[var(--shadow-banner)]"
      style={{ background: 'var(--gradient-banner)' }}
    >
      <AlarmClock size={20} strokeWidth={2} className="shrink-0" />
      <div className="text-[13.5px] leading-tight font-medium">
        <b className={`block ${lang === 'ar' ? 'font-arabic' : 'font-display'} text-[14.5px] mb-px`}>{t('banner_title')}</b>
        {t('reminder_notification_body', dueReminders[0].name)}
        {dueReminders.length > 1 ? t('banner_more', dueReminders.length - 1) : ''}
      </div>
    </div>
  );

  const filters = (
    <div className="-mx-3 px-3 pt-3.5 glass-tint sticky top-0 z-[99] pb-3.5 rounded-t-[26px] shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-2 mb-3.5">
        <div className="flex flex-1 rounded-xl p-[3px] bg-transparent">
          <SegButton active={locationFilter === 'all'} onClick={() => dispatch({ type: 'SET_LOCATION_FILTER', value: 'all' })}>{t('filter_all')}</SegButton>
          <SegButton active={locationFilter === 'fridge'} onClick={() => dispatch({ type: 'SET_LOCATION_FILTER', value: 'fridge' })}>
            <Refrigerator size={14} strokeWidth={2.25} className="inline -mt-0.5 me-1" />{t('filter_fridge')}
          </SegButton>
          <SegButton active={locationFilter === 'freezer'} onClick={() => dispatch({ type: 'SET_LOCATION_FILTER', value: 'freezer' })}>
            <Snowflake size={14} strokeWidth={2.25} className="inline -mt-0.5 me-1" />{t('filter_freezer')}
          </SegButton>
        </div>
      </div>
      <div className="relative mb-3">
        <Search size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-fog pointer-events-none" />
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t('search_fridge')}
          className="w-full min-w-0 ps-10 pe-3.5 py-3 rounded-2xl border border-line bg-card text-kale outline-none focus:border-mint" />
      </div>
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {[
          ['all', t('filter_all'), totalCount],
          ['expired', t('section_expired'), expiryCounts.expired],
          ['soon', t('section_soon'), expiryCounts.soon],
          ['fresh', t('section_fresh'), expiryCounts.fresh],
        ].map(([id, label, count]) => (
          <button key={id} type="button" onClick={() => setExpiryFilter(id)}
            className={`min-w-0 rounded-2xl px-1.5 py-2 border text-center ${expiryFilter === id ? 'bg-card border-mint text-mint-deep shadow-[var(--shadow-sm)]' : 'bg-transparent border-line text-fog'}`}>
            <span className="block force-mono text-[15px] font-bold">{count}</span>
            <span className="block text-[10.5px] font-semibold truncate">{label}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar bg-transparent">
          <div className="flex gap-2 pb-1.5">
            <CatChip selected={categoryFilter === 'all'} onClick={() => dispatch({ type: 'SET_CATEGORY_FILTER', value: 'all' })}>{t('filter_all')}</CatChip>
            {FOOD_CATEGORIES.map(c => (
              <CatChip key={c.id} selected={categoryFilter === c.id} color={c.color} icon={c.icon} onClick={() => dispatch({ type: 'SET_CATEGORY_FILTER', value: c.id })}>
                {catLabel(c, lang)}
              </CatChip>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end pt-1">
        <ViewToggle value={listView} onChange={changeView} floating />
      </div>
    </div>
  );

  const useFirst = items
    .filter(item => item.goodUntil && daysUntil(item.goodUntil) >= 0 && daysUntil(item.goodUntil) <= 3)
    .sort((a, b) => daysUntil(a.goodUntil) - daysUntil(b.goodUntil))
    .slice(0, 4);

  const useFirstSection = expiryFilter === 'all' && useFirst.length > 0 && (
    <div className="mb-1">
      <SectionLabel icon={AlarmClock} color="var(--color-citrus)">{t('use_first')}</SectionLabel>
      <div className={listView === 'grid' ? 'grid grid-cols-2 gap-2.5' : ''}>
        {useFirst.map(item => listView === 'grid'
          ? <ItemCardGrid key={`use-first-${item.id}`} item={item} lang={lang} onOpen={() => openItem(item)} />
          : <ItemCard key={`use-first-${item.id}`} item={item} lang={lang} onOpen={() => openItem(item)} />
        )}
      </div>
    </div>
  );

  let sections;
  if(!totalCount){
    sections = <EmptyState icon={Refrigerator}>{t('empty_fridge')}</EmptyState>;
  } else if(!items.length){
    sections = <EmptyState icon={SearchX}>{t('empty_filtered')}</EmptyState>;
  } else {
    sections = FOOD_CATEGORIES.map(category => {
      const inCategory = items
        .filter(i => (i.category || 'other') === category.id)
        .sort((a, b) => (a.goodUntil ? daysUntil(a.goodUntil) : Number.POSITIVE_INFINITY) - (b.goodUntil ? daysUntil(b.goodUntil) : Number.POSITIVE_INFINITY)); // dated items first; undated items remain valid and sort last
      if(!inCategory.length) return null;
      return (
        <div key={category.id}>
          <SectionLabel icon={category.icon} color={category.color}>{catLabel(category, lang)}</SectionLabel>
          <div className={listView === 'grid' ? 'grid grid-cols-2 gap-2.5' : ''}>
            {inCategory.map(item => (
              listView === 'grid'
                ? <ItemCardGrid key={item.id} item={item} lang={lang} onOpen={() => openItem(item)} />
                : <ItemCard key={item.id} item={item} lang={lang} onOpen={() => openItem(item)} />
            ))}
          </div>
        </div>
      );
    });
  }

  return (
    <>
      {banner}
      {filters}
      {useFirstSection}
      {sections}
    </>
  );
}
