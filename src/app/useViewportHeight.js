import { useEffect } from 'react';

/**
 * iOS standalone PWAs already expose the correct full-screen size through
 * CSS dvh. Only override the app height when the software keyboard is open.
 * This avoids freezing a stale innerHeight and leaving a large strip below
 * the app after iOS changes its viewport/chrome.
 */
export function useViewportHeight(){
  useEffect(() => {
    const vv = window.visualViewport;
    let focusTimer;

    function setViewport(){
      const layoutHeight = window.innerHeight;
      const visualHeight = vv?.height || layoutHeight;
      const keyboardOpen = !!vv && visualHeight < layoutHeight * 0.78;

      document.documentElement.classList.toggle('keyboard-open', keyboardOpen);
      if(keyboardOpen){
        document.documentElement.style.setProperty('--app-height', `${Math.round(visualHeight)}px`);
      } else {
        document.documentElement.style.removeProperty('--app-height');
      }
    }

    function keepFocusedFieldVisible(event){
      const el = event.target;
      if(!el?.matches?.('input, textarea, select')) return;
      clearTimeout(focusTimer);
      focusTimer = setTimeout(() => {
        el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
      }, 280);
    }

    setViewport();
    vv?.addEventListener('resize', setViewport);
    window.addEventListener('resize', setViewport);
    window.addEventListener('orientationchange', setViewport);
    document.addEventListener('focusin', keepFocusedFieldVisible);
    document.addEventListener('focusout', setViewport);

    return () => {
      clearTimeout(focusTimer);
      vv?.removeEventListener('resize', setViewport);
      window.removeEventListener('resize', setViewport);
      window.removeEventListener('orientationchange', setViewport);
      document.removeEventListener('focusin', keepFocusedFieldVisible);
      document.removeEventListener('focusout', setViewport);
      document.documentElement.classList.remove('keyboard-open');
      document.documentElement.style.removeProperty('--app-height');
    };
  }, []);
}
