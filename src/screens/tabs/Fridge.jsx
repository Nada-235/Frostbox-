import { useAppState, useAppDispatch } from '../../app/AppContext.jsx';
import { useT } from '../../lib/useT.js';
import { FOOD_CATEGORIES, catById } from '../../lib/constants.js';
import { catLabel, chipFor, fmtDate } from '../../lib/formatting.js';
import { daysUntil } from '../../lib/utils.js';
import { shareHouseholdCode } from '../../lib/share.js';
import { CatChip, SegButton, SectionLabel, EmptyState } from '../../components/ui.jsx';

const CHIP_STYLES = {
  fresh: 'bg-[#DBFAF0] text-[#04966F]',
  soon: 'bg-[#FFF1D6] text-[#B8730A]',
  expired: 'bg-[#FFE1E7] text-berry',
};

function ItemCard({ item, lang, onOpen }){
  const chip = chipFor(daysUntil(item.goodUntil), lang);
  const category = catById(FOOD_CATEGORIES, item.category || 'other');
  const isFreezer = (item.location || 'fridge') === 'freezer';

  return (
    <div
      onClick={onOpen}
      className="bg-card rounded-[18px] p-3 flex items-center gap-3 mb-2.5 shadow-[var(--shadow-app)] cursor-pointer border border-line"
    >
      <div
        className="w-[52px] h-[52px] rounded-2xl shrink-0 flex items-center justify-center text-2xl overflow-hidden relative"
        style={{ background: item.photo ? undefined : `${category.color}22` }}
      >
        {item.photo ? <img src={item.photo} alt="" className="w-full h-full object-cover" /> : category.icon}
        {isFreezer && (
          <span className="absolute -bottom-[3px] end-[-3px] w-[18px] h-[18px] rounded-full bg-card border border-line flex items-center justify-center text-[10px]">❄️</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[15px] mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</div>
        <div className="text-[12.5px] text-fog whitespace-nowrap overflow-hidden text-ellipsis">{item.note || fmtDate(item.goodUntil, lang)}</div>
      </div>
      <div className={`force-mono text-[11px] font-semibold py-1.5 px-2.5 rounded-[9px] tracking-[0.03em] rtl:tracking-normal shrink-0 whitespace-nowrap ${CHIP_STYLES[chip.cls]}`}>
        {chip.txt}
      </div>
    </div>
  );
}

export function FridgeHeader(){
  const state = useAppState();
  const t = useT();

  return (
    <div className="flex items-center justify-between pb-4">
      <div>
        <div className="text-[13px] text-fog font-medium flex items-center">
          <span className="w-2 h-2 rounded-full bg-teal inline-block me-1.5 shadow-[0_0_0_3px_rgba(6,214,160,0.25)]" />
          {state.synced ? t('synced') : t('connecting')}
        </div>
        <h1 className="font-display rtl:font-arabic text-2xl m-0">{t('your_fridge')}</h1>
      </div>
      <button
        onClick={() => shareHouseholdCode(state.code, state.lang)}
        className="btn-brand force-mono text-xs font-semibold tracking-wide px-3 py-1.5 rounded-full border-none cursor-pointer shadow-[0_4px_12px_rgba(124,92,252,0.35)]"
      >
        {state.code}
      </button>
    </div>
  );
}

export function FridgeBody(){
  const state = useAppState();
  const dispatch = useAppDispatch();
  const t = useT();
  const { lang, locationFilter, categoryFilter, dueReminders } = state;

  let items = state.data.items || [];
  const totalCount = items.length;
  if(locationFilter !== 'all') items = items.filter(i => (i.location || 'fridge') === locationFilter);
  if(categoryFilter !== 'all') items = items.filter(i => (i.category || 'other') === categoryFilter);

  function openItem(item){
    dispatch({ type: 'SET_EDITING_ITEM', item });
    dispatch({ type: 'SET_SCREEN', screen: 'add' });
  }

  const banner = dueReminders.length > 0 && (
    <div
      className="text-card rounded-2xl px-4 py-3.5 mb-4 flex items-center gap-2.5 shadow-[var(--shadow-banner)]"
      style={{ background: 'var(--gradient-banner)' }}
    >
      <span className="text-xl">⏰</span>
      <div className="text-[13.5px] leading-tight font-medium">
        <b className={`block ${lang === 'ar' ? 'font-arabic' : 'font-display'} text-[14.5px] mb-px`}>{t('banner_title')}</b>
        {t('reminder_notification_body', dueReminders[0].name)}
        {dueReminders.length > 1 ? t('banner_more', dueReminders.length - 1) : ''}
      </div>
    </div>
  );

  const filters = (
    <div className="w-full bg-track sticky z-[99] pb-3.5">
      <div className="flex bg-track rounded-xl p-[3px] mb-3.5 sticky top-0 z-40">
        <SegButton active={locationFilter === 'all'} onClick={() => dispatch({ type: 'SET_LOCATION_FILTER', value: 'all' })}>{t('filter_all')}</SegButton>
        <SegButton active={locationFilter === 'fridge'} onClick={() => dispatch({ type: 'SET_LOCATION_FILTER', value: 'fridge' })}>🧊 {t('filter_fridge')}</SegButton>
        <SegButton active={locationFilter === 'freezer'} onClick={() => dispatch({ type: 'SET_LOCATION_FILTER', value: 'freezer' })}>❄️ {t('filter_freezer')}</SegButton>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1.5 mb-4 glass border-b border-line pt-2">
        <CatChip selected={categoryFilter === 'all'} onClick={() => dispatch({ type: 'SET_CATEGORY_FILTER', value: 'all' })}>{t('filter_all')}</CatChip>
        {FOOD_CATEGORIES.map(c => (
          <CatChip key={c.id} selected={categoryFilter === c.id} color={c.color} onClick={() => dispatch({ type: 'SET_CATEGORY_FILTER', value: c.id })}>
            {c.icon} {catLabel(c, lang)}
          </CatChip>
        ))}
      </div>
    </div>
  );

  let sections;
  if(!totalCount){
    sections = <EmptyState emoji="🧊">{t('empty_fridge')}</EmptyState>;
  } else if(!items.length){
    sections = <EmptyState emoji="🔍">{t('empty_filtered')}</EmptyState>;
  } else {
    sections = FOOD_CATEGORIES.map(category => {
      const inCategory = items
        .filter(i => (i.category || 'other') === category.id)
        .sort((a, b) => daysUntil(a.goodUntil) - daysUntil(b.goodUntil)); // soonest-to-expire first, within the category
      if(!inCategory.length) return null;
      return (
        <div key={category.id}>
          <SectionLabel icon={category.icon} color={category.color}>{catLabel(category, lang)}</SectionLabel>
          {inCategory.map(item => (
            <ItemCard key={item.id} item={item} lang={lang} onOpen={() => openItem(item)} />
          ))}
        </div>
      );
    });
  }

  return (
    <>
      {banner}
      {filters}
      {sections}
    </>
  );
}
