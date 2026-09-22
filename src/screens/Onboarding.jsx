import { useState } from 'react';
import { useAppState, useAppDispatch } from '../app/AppContext.jsx';
import { useT, useHeadingFont } from '../lib/useT.js';
import { useHouseholdSession } from '../app/useHouseholdSession.js';
import { Logo, LangSwitchButton } from '../components/Shell.jsx';

export function Onboarding(){
  const state = useAppState();
  const dispatch = useAppDispatch();
  const t = useT();
  const headingFont = useHeadingFont();
  const { startNewHousehold, joinHousehold } = useHouseholdSession();
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);

  async function handleStart(){
    await startNewHousehold();
  }

  async function handleJoin(){
    const value = code.trim().toUpperCase();
    if(!value){ alert(t('enter_code_first')); return; }
    setJoining(true);
    const ok = await joinHousehold(value);
    setJoining(false);
    if(!ok){ alert(t('code_not_found')); return; }
  }

  return (
    <div
      className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden animate-fade-in-up flex flex-col justify-center items-center px-3 py-8 text-center"
      style={{
        background: `radial-gradient(circle at 20% 10%, rgba(124,92,252,0.22), transparent 40%),
          radial-gradient(circle at 85% 85%, rgba(255,84,112,0.16), transparent 45%),
          var(--color-frost)`,
      }}
    >
      <LangSwitchButton />
      <div
        className="w-[74px] h-[74px] rounded-[22px] flex items-center justify-center mb-5 shadow-[var(--shadow-app)] shrink-0"
        style={{ background: 'var(--gradient-brand)' }}
      >
        <Logo />
      </div>
      <h1 className={`${headingFont} text-[30px] text-kale mb-2`}>Frostbox</h1>
      <p className="text-fog text-[15px] leading-relaxed max-w-[290px] mb-9">{t('tagline')}</p>

      <button
        onClick={handleStart}
        className="btn-brand w-full max-w-[300px] py-4 px-5 rounded-2xl border-none text-base font-semibold cursor-pointer mb-3 shrink-0 active:scale-[0.97] transition-transform shadow-[0_8px_20px_rgba(124,92,252,0.35)]"
      >
        {t('start_fridge')}
      </button>
      <button
        onClick={() => dispatch({ type: 'SET_JOIN_BOX_OPEN', open: !state.joinBoxOpen })}
        className="w-full max-w-[300px] py-4 px-5 rounded-2xl border border-line text-base font-semibold cursor-pointer mb-3 shrink-0 active:scale-[0.97] transition-transform bg-card text-kale"
      >
        {t('join_fridge_btn')}
      </button>

      {state.joinBoxOpen && (
        <div className="mt-2.5 w-full max-w-[300px]">
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder={t('enter_code_placeholder')}
            maxLength={6}
            dir="ltr"
            className="force-mono w-full px-3.5 py-[13px] rounded-[13px] border-[1.5px] border-line text-[15.5px] text-kale bg-card mb-2.5 text-center tracking-[2px] uppercase font-semibold"
          />
          <button
            onClick={handleJoin}
            disabled={joining}
            className="btn-brand w-full py-4 px-5 rounded-2xl border-none text-base font-semibold cursor-pointer active:scale-[0.97] transition-transform disabled:opacity-60 shadow-[0_8px_20px_rgba(124,92,252,0.35)]"
          >
            {t('join_fridge_confirm')}
          </button>
        </div>
      )}
    </div>
  );
}
