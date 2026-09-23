import { useState } from 'react';
import { useAppState, useAppDispatch } from '../app/AppContext.jsx';
import { useT, useHeadingFont } from '../lib/useT.js';
import { useHouseholdSession } from '../app/useHouseholdSession.js';
import { Logo, LangSwitchButton } from '../components/Shell.jsx';
import { noAutofillProps } from '../components/ui.jsx';\nimport { getCurrentUser, signInWithGoogle } from '../lib/firebase.js';

export function Onboarding(){
  const state = useAppState();
  const dispatch = useAppDispatch();
  const t = useT();
  const headingFont = useHeadingFont();
  const { startNewHousehold, joinHousehold } = useHouseholdSession();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [memberType, setMemberType] = useState('');
  const [joining, setJoining] = useState(false);\n  const [authBusy, setAuthBusy] = useState(false);\n  const user = getCurrentUser();

  async function handleStart(){
    await startNewHousehold();
  }

  async function handleJoin(){
    const value = code.trim().toUpperCase();
    const memberName = name.trim();
    const type = memberType.trim();

    if(!value){ alert(t('enter_code_first')); return; }
    if(!memberName){
      alert(state.lang === 'ar' ? 'أدخل اسمك أولاً' : 'Enter your name first');
      return;
    }
    if(!type){
      alert(state.lang === 'ar' ? 'أدخل صفتك أو علاقتك أولاً' : 'Enter your type or relationship first');
      return;
    }

    setJoining(true);
    const ok = await joinHousehold(value, memberName, type);
    setJoining(false);
    if(!ok){ alert(t('code_not_found')); return; }
  }

  return (
    <div
      className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden animate-fade-in-up flex flex-col justify-center items-center px-3 py-8 text-center bg-frost"
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
        className="btn-brand w-full max-w-[300px] py-4 px-5 rounded-2xl border-none text-base font-semibold cursor-pointer mb-3 shrink-0 active:scale-[0.97] transition-transform shadow-[0_4px_12px_rgba(56,102,65,0.2)] disabled:opacity-60"
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
            name="fb-join-code" {...noAutofillProps}
          />
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={state.lang === 'ar' ? 'اسمك' : 'Your name'}
            maxLength={40}
            className="w-full px-3.5 py-[13px] rounded-[13px] border-[1.5px] border-line text-[15.5px] text-kale bg-card mb-2.5"
            name="fb-member-name" {...noAutofillProps}
          />
          <input
            type="text"
            value={memberType}
            onChange={e => setMemberType(e.target.value)}
            placeholder={state.lang === 'ar' ? 'الصفة أو العلاقة، مثال: زوجة' : 'Type / relationship, e.g. Wife'}
            maxLength={40}
            className="w-full px-3.5 py-[13px] rounded-[13px] border-[1.5px] border-line text-[15.5px] text-kale bg-card mb-2.5"
            name="fb-member-type" {...noAutofillProps}
          />
          <button
            onClick={handleJoin}
            disabled={joining}
            className="btn-brand w-full py-4 px-5 rounded-2xl border-none text-base font-semibold cursor-pointer active:scale-[0.97] transition-transform disabled:opacity-60 shadow-[0_4px_12px_rgba(56,102,65,0.2)]"
          >
            {t('join_fridge_confirm')}
          </button>
        </div>
      )}
    </div>
  );
}
