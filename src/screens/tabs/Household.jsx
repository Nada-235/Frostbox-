import { useState } from 'react';
import { Check, Database, ChevronRight, Trash2 } from 'lucide-react';
import { useAppState, useAppDispatch } from '../../app/AppContext.jsx';
import { useT } from '../../lib/useT.js';
import { shareHouseholdCode } from '../../lib/share.js';
import { useHouseholdSession } from '../../app/useHouseholdSession.js';
import {
  setLang, setTheme as persistTheme, setMode as persistMode,
  setCustomColor as persistCustomColor, setFontEn as persistFontEn, setFontAr as persistFontAr,
  getMe,\n} from '../../lib/localStorage.js';
import { THEMES, CUSTOM_THEME_ID, FONTS } from '../../lib/themes.js';
import { SectionLabel, Switch, SegButton } from '../../components/ui.jsx';
import { ColorWheelPicker } from '../../components/ColorWheelPicker.jsx';\nimport { removeHouseholdMember } from '../../lib/firebase.js';

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
        <h1 className="font-display rtl:font-arabic text-[28px] font-bold m-0 text-kale">{t('household_title')}</h1>
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
  const notifOn = notifPermission === 'granted';\n  const me = getMe();\n  const isAdmin = me?.role === 'admin' && !!me?.adminToken;\n\n  async function handleRemoveMember(memberName){\n    if(!isAdmin || memberName === state.myName) return;\n    const message = state.lang === 'ar'\n      ? `هل تريد إزالة ${memberName} من الثلاجة؟`\n      : `Remove ${memberName} from this fridge?`;\n    if(!confirm(message)) return;\n    const removed = await removeHouseholdMember(state.code, memberName, me.adminToken);\n    if(!removed){\n      alert(state.lang === 'ar' ? 'تعذر إزالة هذا العضو.' : 'Could not remove this member.');\n    }\n  }

  function changeLang(lang){
    setLang(lang);
    dispatch({ type: 'SET_LANG', lang });
  }

  function changeTheme(themeId){
    persistTheme(themeId);
    dispatch({ type: 'SET_THEME', theme: themeId });
  }

  function changeCustomColor(hex){
    persistCustomColor(hex);
    dispatch({ type: 'SET_CUSTOM_COLOR', color: hex });
  }

  function changeMode(mode){
    persistMode(mode);
    dispatch({ type: 'SET_MODE', mode });
  }

  function changeFontEn(id){
    persistFontEn(id);
    dispatch({ type: 'SET_FONT_EN', id });
  }

  function changeFontAr(id){
    persistFontAr(id);
    dispatch({ type: 'SET_FONT_AR', id });
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
        className="rounded-[28px] px-5 py-[26px] text-center text-card mb-5 mt-3 shadow-[var(--shadow-fab)]"
        style={{ background: 'var(--gradient-brand)' }}
      >
        <div className="text-xs text-white/75 uppercase tracking-[0.08em] rtl:tracking-normal rtl:normal-case font-bold mb-2.5">{t('your_code_label')}</div>
        <div className="force-mono text-[34px] font-semibold tracking-[4px] mb-4">{state.code}</div>
        <div className="text-[13px] text-white/80 leading-relaxed mb-[18px]">{t('share_desc')}</div>
        <button
          onClick={() => shareHouseholdCode(state.code, state.lang)}
          className="bg-card text-mint-deep border-none px-[22px] py-3 rounded-full font-bold text-sm cursor-pointer"
        >
          {t('share_code_btn')}
        </button>
      </div>

      <SectionLabel>{t('catalog_label')}</SectionLabel>
      <button
        onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'catalog' })}
        className="w-full flex items-center gap-3 bg-card border border-line rounded-2xl px-3.5 py-3.5 mb-5 cursor-pointer text-start"
      >
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-track text-mint-deep">
          <Database size={16} strokeWidth={2.25} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14.5px] font-semibold">{t('catalog_label')}</div>
          <div className="text-[12.5px] text-fog leading-snug mt-0.5">{t('catalog_desc')}</div>
        </div>
        <ChevronRight size={17} strokeWidth={2.25} className="text-fog shrink-0 rtl:rotate-180" />
      </button>

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

      <SectionLabel>{t('theme_label')}</SectionLabel>
      <div className="flex gap-3 mb-3 px-0.5 overflow-x-auto no-scrollbar">
        {THEMES.map(theme => (
          <button
            key={theme.id}
            type="button"
            onClick={() => changeTheme(theme.id)}
            aria-label={theme.name}
            title={theme.name}
            className="flex flex-col items-center gap-1.5 bg-transparent border-none cursor-pointer shrink-0"
          >
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90"
              style={{
                background: theme.swatch,
                boxShadow: state.theme === theme.id
                  ? `0 0 0 2px var(--color-card), 0 0 0 4px ${theme.swatch}`
                  : '0 1px 3px rgba(0,0,0,0.2)',
              }}
            >
              {state.theme === theme.id && <Check size={16} strokeWidth={3} className="text-card" />}
            </span>
            <span className="text-[11px] font-medium text-fog">{theme.name}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => changeTheme(CUSTOM_THEME_ID)}
          aria-label={t('theme_custom_name')}
          title={t('theme_custom_name')}
          className="flex flex-col items-center gap-1.5 bg-transparent border-none cursor-pointer shrink-0"
        >
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90"
            style={{
              background: state.theme === CUSTOM_THEME_ID
                ? state.customColor
                : 'conic-gradient(from 90deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
              boxShadow: state.theme === CUSTOM_THEME_ID
                ? `0 0 0 2px var(--color-card), 0 0 0 4px ${state.customColor}`
                : '0 1px 3px rgba(0,0,0,0.2)',
            }}
          >
            {state.theme === CUSTOM_THEME_ID && <Check size={16} strokeWidth={3} className="text-card" />}
          </span>
          <span className="text-[11px] font-medium text-fog">{t('theme_custom_name')}</span>
        </button>
      </div>

      {state.theme === CUSTOM_THEME_ID && (
        <div className="bg-card border border-line rounded-2xl px-3.5 py-5 mb-5 flex justify-center">
          <ColorWheelPicker value={state.customColor} onChange={changeCustomColor} />
        </div>
      )}

      <SectionLabel>{t('mode_label')}</SectionLabel>
      <div className="flex bg-frost rounded-xl p-[3px] mb-5">
        <SegButton active={state.mode === 'light'} onClick={() => changeMode('light')}>{t('mode_light')}</SegButton>
        <SegButton active={state.mode === 'dark'} onClick={() => changeMode('dark')}>{t('mode_dark')}</SegButton>
      </div>

      <SectionLabel>{t('language_label')}</SectionLabel>
      <div className="flex bg-frost rounded-xl p-[3px] mb-3.5">
        <SegButton active={state.lang === 'en'} onClick={() => changeLang('en')}>English</SegButton>
        <SegButton active={state.lang === 'ar'} onClick={() => changeLang('ar')}>العربية</SegButton>
      </div>

      <SectionLabel>{t('font_label')}</SectionLabel>
      <div className="text-[11px] font-bold text-fog uppercase tracking-[0.05em] mb-1.5">{t('font_english')}</div>
      <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar pb-0.5">
        {FONTS.en.map(f => (
          <button
            key={f.id}
            type="button"
            onClick={() => changeFontEn(f.id)}
            style={{ fontFamily: `'${f.display}', sans-serif` }}
            className={`shrink-0 px-3.5 py-2.5 rounded-xl border text-[13.5px] font-semibold cursor-pointer bg-card ${
              state.fontEn === f.id ? 'border-mint text-mint-deep' : 'border-line text-kale'
            }`}
          >
            {f.name}
          </button>
        ))}
      </div>
      <div className="text-[11px] font-bold text-fog uppercase tracking-[0.05em] mb-1.5">{t('font_arabic')}</div>
      <div className="flex gap-2 mb-3.5 overflow-x-auto no-scrollbar pb-0.5">
        {FONTS.ar.map(f => (
          <button
            key={f.id}
            type="button"
            onClick={() => changeFontAr(f.id)}
            style={{ fontFamily: `'${f.family}', sans-serif` }}
            className={`shrink-0 px-3.5 py-2.5 rounded-xl border text-[13.5px] font-semibold cursor-pointer bg-card ${
              state.fontAr === f.id ? 'border-mint text-mint-deep' : 'border-line text-kale'
            }`}
          >
            {f.name}
          </button>
        ))}
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
        className="w-full bg-card text-berry border-[1.5px] border-[#EFC9C9] rounded-full py-[15px] text-[15.5px] font-bold cursor-pointer"
      >
        {t('leave_household_btn')}
      </button>
    </>
  );
}
