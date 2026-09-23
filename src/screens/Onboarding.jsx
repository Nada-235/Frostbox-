import { useState } from 'react';
import { useAppState } from '../app/AppContext.jsx';
import { useT, useHeadingFont } from '../lib/useT.js';
import { useHouseholdSession } from '../app/useHouseholdSession.js';
import { Logo, LangSwitchButton } from '../components/Shell.jsx';
import { noAutofillProps } from '../components/ui.jsx';
import { getCurrentUser, signInWithGoogle, signInAsGuest } from '../lib/firebase.js';

export function Onboarding(){
  const state = useAppState();
  const t = useT();
  const headingFont = useHeadingFont();
  const { startNewHousehold, joinHousehold, resumeMyHousehold } = useHouseholdSession();
  const [flow, setFlow] = useState(null);
  const [code, setCode] = useState('');
  const [authReady, setAuthReady] = useState(!!getCurrentUser());
  const [authBusy, setAuthBusy] = useState(false);
  const [name, setName] = useState('');
  const [memberType, setMemberType] = useState('');
  const [busy, setBusy] = useState(false);

  async function authenticate(kind){
    setAuthBusy(true);
    try{
      const user = kind === 'google' ? await signInWithGoogle() : await signInAsGuest();
      if(!user) return;
      if(kind === 'google'){
        const restored = await resumeMyHousehold();
        if(restored) return;
      }
      setAuthReady(true);
    } catch(error){
      console.error('Sign in failed', error);
      alert(state.lang === 'ar' ? 'تعذر تسجيل الدخول.' : 'Could not sign in.');
    } finally { setAuthBusy(false); }
  }

  async function finish(){
    const cleanName = name.trim();
    const cleanType = memberType.trim();
    const cleanCode = code.trim().toUpperCase();
    if(!cleanName){ alert(state.lang === 'ar' ? 'أدخل اسمك أولاً' : 'Enter your name first'); return; }
    if(!cleanType){ alert(state.lang === 'ar' ? 'أدخل صفتك أو علاقتك أولاً' : 'Enter your relationship first'); return; }
    if(flow === 'join' && !cleanCode){ alert(t('enter_code_first')); return; }
    setBusy(true);
    try{
      if(flow === 'start') await startNewHousehold(cleanName, cleanType);
      else {
        const ok = await joinHousehold(cleanCode, cleanName, cleanType);
        if(!ok) alert(t('code_not_found'));
      }
    } finally { setBusy(false); }
  }

  const resetFlow = () => { setFlow(null); setAuthReady(!!getCurrentUser()); setCode(''); setName(''); setMemberType(''); };

  return (
    <div className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden animate-fade-in-up flex flex-col justify-center items-center px-3 py-8 text-center bg-frost">
      <LangSwitchButton />
      <div className="w-[74px] h-[74px] rounded-[22px] flex items-center justify-center mb-5 shadow-[var(--shadow-app)] shrink-0" style={{ background: 'var(--gradient-brand)' }}><Logo /></div>
      <h1 className={`${headingFont} text-[30px] text-kale mb-2`}>Frostbox</h1>
      <p className="text-fog text-[15px] leading-relaxed max-w-[290px] mb-9">{t('tagline')}</p>

      {!flow && <>
        <button onClick={() => setFlow('start')} className="btn-brand w-full max-w-[300px] py-4 px-5 rounded-2xl border-none text-base font-semibold cursor-pointer mb-3">{t('start_fridge')}</button>
        <button onClick={() => setFlow('join')} className="w-full max-w-[300px] py-4 px-5 rounded-2xl border border-line text-base font-semibold cursor-pointer bg-card text-kale">{t('join_fridge_btn')}</button>
      </>}

      {flow && !authReady && <>
        {flow === 'join' && <input type="text" value={code} onChange={e=>setCode(e.target.value)} placeholder={t('enter_code_placeholder')} maxLength={6} dir="ltr" className="force-mono w-full max-w-[300px] px-3.5 py-[13px] rounded-[13px] border-[1.5px] border-line text-[15.5px] text-kale bg-card mb-3 text-center tracking-[2px] uppercase font-semibold" name="fb-join-code" {...noAutofillProps} />}
        <div className="text-sm font-semibold text-kale mb-3">{state.lang === 'ar' ? 'كيف تريد المتابعة؟' : 'How would you like to continue?'}</div>
        <button onClick={()=>authenticate('google')} disabled={authBusy} className="w-full max-w-[300px] py-4 px-5 rounded-2xl border border-line text-base font-semibold cursor-pointer mb-3 bg-card text-kale disabled:opacity-60">{state.lang === 'ar' ? 'المتابعة باستخدام Google' : 'Continue with Google'}</button>
        <button onClick={()=>authenticate('guest')} disabled={authBusy} className="w-full max-w-[300px] py-4 px-5 rounded-2xl border border-line text-base font-semibold cursor-pointer mb-3 bg-card text-kale disabled:opacity-60">{state.lang === 'ar' ? 'المتابعة كضيف' : 'Continue as Guest'}</button>
        <button onClick={resetFlow} className="text-sm text-fog bg-transparent border-none cursor-pointer">{state.lang === 'ar' ? 'رجوع' : 'Back'}</button>
      </>}

      {flow && authReady && <>
        {flow === 'join' && <input type="text" value={code} onChange={e=>setCode(e.target.value)} placeholder={t('enter_code_placeholder')} maxLength={6} dir="ltr" className="force-mono w-full max-w-[300px] px-3.5 py-[13px] rounded-[13px] border-[1.5px] border-line text-[15.5px] text-kale bg-card mb-2.5 text-center tracking-[2px] uppercase font-semibold" name="fb-join-code" {...noAutofillProps} />}
        <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder={state.lang === 'ar' ? 'اسمك' : 'Your name'} maxLength={40} className="w-full max-w-[300px] px-3.5 py-[13px] rounded-[13px] border-[1.5px] border-line text-[15.5px] text-kale bg-card mb-2.5" name="fb-member-name" {...noAutofillProps} />
        <input type="text" value={memberType} onChange={e=>setMemberType(e.target.value)} placeholder={state.lang === 'ar' ? 'الصفة أو العلاقة، مثال: زوجة' : 'Relationship, e.g. Wife'} maxLength={40} className="w-full max-w-[300px] px-3.5 py-[13px] rounded-[13px] border-[1.5px] border-line text-[15.5px] text-kale bg-card mb-3" name="fb-member-type" {...noAutofillProps} />
        <button onClick={finish} disabled={busy} className="btn-brand w-full max-w-[300px] py-4 px-5 rounded-2xl border-none text-base font-semibold cursor-pointer disabled:opacity-60">{busy ? '…' : (flow === 'start' ? t('start_fridge') : t('join_fridge_confirm'))}</button>
      </>}
    </div>
  );
}
