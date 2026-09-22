import { useT, useHeadingFont } from '../lib/useT.js';
import { Logo, LangSwitchButton } from '../components/Shell.jsx';

export function Setup(){
  const t = useT();
  const headingFont = useHeadingFont();

  return (
    <div
      className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden animate-fade-in-up flex flex-col justify-center items-center px-3 py-8 text-center"
      style={{
        background: `radial-gradient(circle at 20% 10%, rgba(106,153,78,0.22), transparent 40%),
          radial-gradient(circle at 85% 85%, rgba(188,71,73,0.14), transparent 45%),
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
      <p className="text-fog text-[15px] leading-relaxed max-w-[290px] mb-9">{t('setup_tagline')}</p>

      <div className="bg-card rounded-[18px] p-5 text-start max-w-[340px] border border-line mt-2 shrink-0">
        <h3 className={`${headingFont} text-[15px] mb-2.5`}>{t('setup_quick')}</h3>
        <ol className="m-0 ps-[18px] text-[13.5px] leading-[1.8] text-kale">
          <li>{t('setup_step1')}</li>
          <li>{t('setup_step2')}</li>
          <li>{t('setup_step3')}</li>
          <li>{t('setup_step4')}</li>
          <li>{t('setup_step5')}</li>
        </ol>
      </div>
    </div>
  );
}
