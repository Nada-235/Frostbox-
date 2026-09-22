import { createContext, useContext, useReducer } from 'react';

/**
 * Central app state, ported 1:1 from the original single shared `state`
 * object. A reducer replaces direct mutation + requestRender(); everything
 * else (shape of the data, screen/tab names) is unchanged.
 */
const initialState = {
  code: null,
  myName: null,
  lang: 'en',
  theme: 'sage',
  data: { items: [], shopping: [], members: [], catalog: [] },
  tab: 'fridge',           // 'fridge' | 'shopping' | 'household'
  screen: 'loading',       // 'loading' | 'setup' | 'onboard' | 'main' | 'add' | 'shopadd'
  joinBoxOpen: false,
  editingItem: null,       // fridge item currently being added/edited, or null
  editingShopItem: null,   // shopping item currently being added/edited, or null
  locationFilter: 'all',   // 'all' | 'fridge' | 'freezer'
  categoryFilter: 'all',
  synced: false,
  dueReminders: [],
};

function signedOutState(lang, theme){
  return {
    ...initialState,
    lang,
    theme,
    screen: 'onboard',
  };
}

function reducer(state, action){
  switch(action.type){
    case 'SET_LANG': return { ...state, lang: action.lang };
    case 'SET_THEME': return { ...state, theme: action.theme };
    case 'SET_SCREEN': return { ...state, screen: action.screen };
    case 'SET_TAB': return { ...state, tab: action.tab };
    case 'SET_JOIN_BOX_OPEN': return { ...state, joinBoxOpen: action.open };
    case 'SET_EDITING_ITEM': return { ...state, editingItem: action.item };
    case 'SET_EDITING_SHOP_ITEM': return { ...state, editingShopItem: action.item };
    case 'SET_LOCATION_FILTER': return { ...state, locationFilter: action.value };
    case 'SET_CATEGORY_FILTER': return { ...state, categoryFilter: action.value };
    case 'ENTER_HOUSEHOLD':
      return { ...state, code: action.code, myName: action.myName, screen: 'main' };
    case 'SET_MEMBERS':
      return { ...state, data: { ...state.data, members: action.members } };
    case 'SET_ITEMS':
      return { ...state, data: { ...state.data, items: action.items }, synced: true };
    case 'SET_SHOPPING':
      return { ...state, data: { ...state.data, shopping: action.shopping } };
    case 'SET_CATALOG':
      return { ...state, data: { ...state.data, catalog: action.catalog } };
    case 'SET_DUE_REMINDERS':
      return { ...state, dueReminders: action.list };
    case 'MARK_REMINDERS_FIRED': {
      const ids = new Set(action.ids);
      if(!ids.size) return state;
      return {
        ...state,
        data: {
          ...state.data,
          items: state.data.items.map(i => ids.has(i.id) ? { ...i, reminderFired: true } : i),
        },
      };
    }
    case 'RESET': return signedOutState(action.lang, state.theme);
    default: return state;
  }
}

const AppStateContext = createContext(null);
const AppDispatchContext = createContext(null);

export function AppProvider({ children }){
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

export function useAppState(){
  const ctx = useContext(AppStateContext);
  if(!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}

export function useAppDispatch(){
  const ctx = useContext(AppDispatchContext);
  if(!ctx) throw new Error('useAppDispatch must be used within AppProvider');
  return ctx;
}
