import { useEffect } from 'react';

/**
 * Tracks iOS/Android's visual viewport while the software keyboard is open.
 * iOS can move the visual viewport as well as resize it, so expose both its
 * height and top offset and keep the focused field visible after the resize.
 */
export function useViewportHeight(){
  useEffect(() => {
    const vv = window.visualViewport;
    let focusTimer;

    function setViewport(){
      const height = vv ? vv.height : window.innerHeight;
      const top = vv ? vv.offsetTop : 0;
      document.documentElement.style.setProperty('--app-height', `${height}px`);
      document.documentElement.style.setProperty('--app-top', `${top}px`);
      document.documentElement.classList.toggle('keyboard-open', height < window.innerHeight * 0.78);
    }

    function keepFocusedFieldVisible(event){
      const el = event.target;
      if(!el?.matches?.('input, textarea, select')) return;
      clearTimeout(focusTimer);
      focusTimer = setTimeout(() => {
        el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
      }, 280);
    }

    setViewport();
    const target = vv || window;
    target.addEventListener('resize', setViewport);
    target.addEventListener('scroll', setViewport);
    window.addEventListener('orientationchange', setViewport);
    document.addEventListener('focusin', keepFocusedFieldVisible);

    return () => {
      clearTimeout(focusTimer);
      target.removeEventListener('resize', setViewport);
      target.removeEventListener('scroll', setViewport);
      window.removeEventListener('orientationchange', setViewport);
      document.removeEventListener('focusin', keepFocusedFieldVisible);
      document.documentElement.classList.remove('keyboard-open');
      document.documentElement.style.removeProperty('--app-top');
    };
  }, []);
}
