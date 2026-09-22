import { useState } from 'react';
import { useAppState, useAppDispatch } from '../../app/AppContext.jsx';
import { useT } from '../../lib/useT.js';
import { setLang } from '../../lib/localStorage.js';
import { shareHouseholdCode } from '../../lib/share.js';
import { useHouseholdSession } from '../../app/useHouseholdSession.js';
import { SectionLabel, Switch, SegButton } from '../../components/ui.jsx';

const AVATAR_COLORS = ['#7C5CFC', '#FF5470', '#06D6A0', '#F59E0B', '#EC4899', '#3B82F6'];
function colorForName(name){
  let hash = 0;
  for(let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function HouseholdHeader(){
  const t = useT();
  return (
    <div className="flex items-center justify-between pb-4">
      <div>
        <div className="text-[13px] text-fog font-medium">{t('sharing_label')}</div>
        <h1 className="font-display rtl:font-arabic text-2xl m-0">{t('household_title')}</h1>
      </div>
    </div>
  );
}

export function HouseholdBody(){
  const state = useAppState();
  const dispatch = useAppDispatch();
  const t = useT();
  const { leaveHousehold } = useHouseholdSession();
  const members = (state.data.members && state.data.members.length) ? state.data.members : [state.myName];
  const [notifPermission, setNotifPermission] = useState(
    typeof window !== 'undefined' && window.Notification ? Notification.permission : 'unsupported'
  );
  const notifOn = notifPermission === 'granted';

  function changeLang(lang){
    setLang(lang);
    dispatch({ type: 'SET_LANG', lang });
  }

  async function toggleNotifications(){
    if(!window.Notification){ alert(t('notif_unsupported')); return; }
    if(Notification.permission !== 'granted'){
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
    } else {
      alert(t('notif_already_enabled'));
    }
  }

  function handleLeave(){
    if(!confirm(t('confirm_leave'))) return;
    leaveHousehold(state.lang);
  }

  return (
    <>
      <div
        className="rounded-[20px] px-5 py-[26px] text-center text-card mb-5 shadow-[var(--shadow-app)]"
        style={{ background: 'var(--gradient-brand)' }}
      >
        <div className="text-xs text-white/75 uppercase tracking-[0.08em] rtl:tracking-normal rtl:normal-case font-bold mb-2.5">{t('your_code_label')}</div>
        <div className="force-mono text-[34px] font-semibold tracking-[4px] mb-4">{state.code}</div>
        <div className="text-[13px] text-white/80 leading-relaxed mb-[18px]">{t('share_desc')}</div>
        <button
          onClick={() => shareHouseholdCode(state.code, state.lang)}
          className="bg-card text-mint-deep border-none px-[22px] py-3 rounded-[13px] font-bold text-sm cursor-pointer"
        >
          {t('share_code_btn')}
        </button>
      </div>

      <SectionLabel>{t('members_label')}</SectionLabel>
      {members.map((m, i) => (
        <div key={i} className="flex items-center gap-3 bg-card border border-line rounded-2xl px-3.5 py-3 mb-2.5">
          <div
            className="w-[34px] h-[34px] rounded-full text-card flex items-center justify-center font-bold text-[13px] shrink-0"
            style={{ background: colorForName(m) }}
          >
            {m.slice(0, 1).toUpperCase()}
          </div>
          <div>{m}</div>
        </div>
      ))}

      <SectionLabel>{t('language_label')}</SectionLabel>
      <div className="flex bg-frost rounded-xl p-[3px] mb-3.5">
        <SegButton active={state.lang === 'en'} onClick={() => changeLang('en')}>English</SegButton>
        <SegButton active={state.lang === 'ar'} onClick={() => changeLang('ar')}>العربية</SegButton>
      </div>

      <SectionLabel>{t('notifications_label')}</SectionLabel>
      <div className="flex items-center justify-between bg-card border border-line rounded-2xl px-3.5 py-[13px] mb-3">
        <div className="text-[14.5px] font-semibold">{t('enable_alerts')}</div>
        <Switch on={notifOn} onToggle={toggleNotifications} />
      </div>
      <p className="text-[12.5px] text-fog leading-relaxed -mt-1 mx-0.5 mb-5">{t('alerts_note')}</p>

      <SectionLabel>{t('tab_fridge')}</SectionLabel>
      <button
        onClick={handleLeave}
        className="w-full bg-card text-berry border-[1.5px] border-[#EFC9C9] rounded-[14px] py-[15px] text-[15.5px] font-bold cursor-pointer"
      >
        {t('leave_household_btn')}
      </button>
    </>
  );
}
