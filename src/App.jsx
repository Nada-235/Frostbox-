import { useEffect } from 'react';
import { AppProvider, useAppState, useAppDispatch } from './app/AppContext.jsx';
import { useHouseholdSession } from './app/useHouseholdSession.js';
import { useReminders } from './app/useReminders.js';
import { useViewportHeight } from './app/useViewportHeight.js';
import { getMe, getLang } from './lib/localStorage.js';
import { initFirebase } from './lib/firebase.js';
import { Setup } from './screens/Setup.jsx';
import { Onboarding } from './screens/Onboarding.jsx';
import { Main } from './screens/Main.jsx';
import { ItemForm } from './screens/ItemForm.jsx';
import { ShopItemForm } from './screens/ShopItemForm.jsx';
import { ToastHost } from './components/Toast.jsx';

const SCREENS = {
  setup: Setup,
  onboard: Onboarding,
  main: Main,
  add: ItemForm,
  shopadd: ShopItemForm,
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

  const isRtl = state.lang === 'ar';
  const Screen = SCREENS[state.screen];

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="relative w-full max-w-[460px] bg-frost overflow-hidden shadow-[var(--shadow-app)] flex flex-col"
      style={{
        height: 'var(--app-height, 100dvh)',
        paddingTop: 'max(16px, env(safe-area-inset-top))',
      }}
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
