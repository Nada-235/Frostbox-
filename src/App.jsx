import { useEffect } from 'react';
import { AppProvider, useAppState, useAppDispatch } from './app/AppContext.jsx';
import { useHouseholdSession } from './app/useHouseholdSession.js';
import { useReminders } from './app/useReminders.js';
import { useViewportHeight } from './app/useViewportHeight.js';
import { getMe, getLang, getTheme, getMode, getCustomColor, getFontEn, getFontAr, getListView } from './lib/localStorage.js';
import { initFirebase } from './lib/firebase.js';
import { FONTS } from './lib/themes.js';
import { Setup } from './screens/Setup.jsx';
import { Onboarding } from './screens/Onboarding.jsx';
import { Main } from './screens/Main.jsx';
import { ItemForm } from './screens/ItemForm.jsx';
import { ShopItemForm } from './screens/ShopItemForm.jsx';
import { CatalogList } from './screens/CatalogList.jsx';
import { CatalogItemForm } from './screens/CatalogItemForm.jsx';
import { ToastHost } from './components/Toast.jsx';

const SCREENS = {
  setup: Setup,
  onboard: Onboarding,
  main: Main,
  add: ItemForm,
  shopadd: ShopItemForm,
  catalog: CatalogList,
  catalogadd: CatalogItemForm,
};

function Shell(){
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { resumeHousehold } = useHouseholdSession();
  useReminders();
  useViewportHeight();

  useEffect(() => {
    const lang = getLang();
    dispatch({ type: 'SET_LANG', lang });
    dispatch({ type: 'SET_THEME', theme: getTheme() });
    dispatch({ type: 'SET_MODE', mode: getMode() });
    dispatch({ type: 'SET_CUSTOM_COLOR', color: getCustomColor() });
    dispatch({ type: 'SET_FONT_EN', id: getFontEn() });
    dispatch({ type: 'SET_FONT_AR', id: getFontAr() });
    dispatch({ type: 'SET_LIST_VIEW', view: getListView() });

    if(!initFirebase()){
      dispatch({ type: 'SET_SCREEN', screen: 'setup' });
      return;
    }

    const me = getMe();
    if(me && me.code){
      resumeHousehold(me.code, me.name || 'You');
    } else {
      dispatch({ type: 'SET_SCREEN', screen: 'onboard' });
    }
    // Runs once on mount, mirroring the original app.js init() sequence.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
  }, [state.theme]);

  useEffect(() => {
    document.documentElement.dataset.mode = state.mode;
  }, [state.mode]);

  useEffect(() => {
    if(state.theme === 'custom'){
      document.documentElement.style.setProperty('--user-accent', state.customColor);
    }
  }, [state.theme, state.customColor]);

  useEffect(() => {
    const f = FONTS.en.find(f => f.id === state.fontEn) || FONTS.en[0];
    document.documentElement.style.setProperty('--font-sans', `'${f.sans}', sans-serif`);
    document.documentElement.style.setProperty('--font-display', `'${f.display}', sans-serif`);
  }, [state.fontEn]);

  useEffect(() => {
    const f = FONTS.ar.find(f => f.id === state.fontAr) || FONTS.ar[0];
    document.documentElement.style.setProperty('--font-arabic', `'${f.family}', 'Inter', sans-serif`);
  }, [state.fontAr]);

  const isRtl = state.lang === 'ar';
  const Screen = SCREENS[state.screen];

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="relative w-full max-w-[460px] bg-frost overflow-hidden shadow-[var(--shadow-app)] flex flex-col"
      style={{ height: 'var(--app-height, 100dvh)' }}
    >
      {Screen && <Screen />}
      <ToastHost />
    </div>
  );
}

export function App(){
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
