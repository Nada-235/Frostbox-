import { useEffect } from 'react';

/**
 * Keep the app matched to the usable iOS visual viewport. Safari can report a
 * visualViewport offset while its browser chrome expands/collapses; moving the
 * whole app by that offset creates a visible gap at the bottom, so only the
 * viewport height is applied to the shell.
 */
export function useViewportHeight(){
  useEffect(() => {
    const vv = window.visualViewport;
    let focusTimer;

    function setViewport(){
      const height = vv ? vv.height : window.innerHeight;
      const layoutHeight = window.innerHeight;
      document.documentElement.style.setProperty('--app-height', `${Math.round(height)}px`);
      document.documentElement.classList.toggle('keyboard-open', height < layoutHeight * 0.78);
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
    const target = vv || window;
    target.addEventListener('resize', setViewport);
    window.addEventListener('resize', setViewport);
    window.addEventListener('orientationchange', setViewport);
    document.addEventListener('focusin', keepFocusedFieldVisible);

    return () => {
      clearTimeout(focusTimer);
      target.removeEventListener('resize', setViewport);
      window.removeEventListener('resize', setViewport);
      window.removeEventListener('orientationchange', setViewport);
      document.removeEventListener('focusin', keepFocusedFieldVisible);
      document.documentElement.classList.remove('keyboard-open');
    };
  }, []);
}
