import { useAppState, useAppDispatch } from '../app/AppContext.jsx';
import { setLang } from '../lib/localStorage.js';

export function Logo(){
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2 L12 22 M7 6 L17 6 M6 12 L18 12 M7 18 L17 18 M9 4 L12 6 L15 4 M9 20 L12 18 L15 20"
        stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

export function LangSwitchButton({ className = '' }){
  const state = useAppState();
  const dispatch = useAppDispatch();

  function toggle(){
    const next = state.lang === 'en' ? 'ar' : 'en';
    setLang(next);
    dispatch({ type: 'SET_LANG', lang: next });
  }

  return (
    <button
      onClick={toggle}
      className={`btn-brand force-mono absolute top-4 end-4 z-10 rounded-full text-xs font-semibold tracking-wide px-3 py-1.5 border-none cursor-pointer shadow-[0_4px_12px_rgba(56,102,65,0.35)] ${className}`}
    >
      {state.lang === 'en' ? 'AR' : 'EN'}
    </button>
  );
}
