import { Refrigerator, ClipboardList, Users, Plus } from 'lucide-react';
import { useAppState, useAppDispatch } from '../app/AppContext.jsx';
import { useT } from '../lib/useT.js';
import { FridgeHeader, FridgeBody } from './tabs/Fridge.jsx';
import { ShoppingHeader, ShoppingBody } from './tabs/Shopping.jsx';
import { HouseholdHeader, HouseholdBody } from './tabs/Household.jsx';

const TABS = {
  fridge: { Header: FridgeHeader, Body: FridgeBody },
  shopping: { Header: ShoppingHeader, Body: ShoppingBody },
  household: { Header: HouseholdHeader, Body: HouseholdBody },
};

function TabButton({ icon: Icon, label, active, onClick }){
  return (
    <button
      onClick={onClick}
      className={`bg-transparent border-none flex flex-col items-center gap-1 text-[11px] font-semibold cursor-pointer w-20 ${active ? 'text-mint-deep' : 'text-fog'}`}
    >
      <span className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${active ? 'bg-track' : ''}`}>
        <Icon size={19} strokeWidth={active ? 2.25 : 2} />
      </span>
      {label}
    </button>
  );
}

export function Main(){
  const state = useAppState();
  const dispatch = useAppDispatch();
  const t = useT();
  const { Header, Body } = TABS[state.tab];
  const showFab = state.tab === 'fridge' || state.tab === 'shopping';

  function openAdd(){
    if(state.tab === 'fridge'){
      dispatch({ type: 'SET_EDITING_ITEM', item: null });
      dispatch({ type: 'SET_SCREEN', screen: 'add' });
    } else {
      dispatch({ type: 'SET_EDITING_SHOP_ITEM', item: null });
      dispatch({ type: 'SET_SCREEN', screen: 'shopadd' });
    }
  }

  return (
    <>
      <div className="flex flex-col flex-1 min-h-0">
        <div
          className="flex-1 min-h-0 overflow-y-auto px-3 pb-6"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="-mx-3 px-3 pt-2.5 mb-3 glass-brand"><Header /></div>
          <Body />
        </div>
        <div
          className="shrink-0 h-[82px] glass-tint border-t border-line flex items-start justify-around pt-2.5 sticky bottom-0 z-[99]"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <TabButton icon={Refrigerator} label={t('tab_fridge')} active={state.tab === 'fridge'} onClick={() => dispatch({ type: 'SET_TAB', tab: 'fridge' })} />
          <TabButton icon={ClipboardList} label={t('tab_shopping')} active={state.tab === 'shopping'} onClick={() => dispatch({ type: 'SET_TAB', tab: 'shopping' })} />
          <TabButton icon={Users} label={t('tab_household')} active={state.tab === 'household'} onClick={() => dispatch({ type: 'SET_TAB', tab: 'household' })} />
        </div>
      </div>
      {showFab && (
        <button
          onClick={openAdd}
          className="glass-brand fixed end-5 bottom-24 w-[58px] h-[58px] rounded-full border border-white/25 flex items-center justify-center shadow-[var(--shadow-fab)] cursor-pointer z-30 active:scale-[0.94] text-card overflow-hidden"
        >
          <span
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.35), transparent 55%)' }}
          />
          <Plus size={26} strokeWidth={2.25} className="relative" />
        </button>
      )}
    </>
  );
}
