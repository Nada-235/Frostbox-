import { useEffect } from 'react';

/**
 * Keep the app locked to the usable viewport on mobile.
 * Use the visual viewport only while the keyboard is open; Safari's visual
 * viewport can otherwise shrink/shift as its browser chrome expands and
 * collapses, which makes a full-screen app appear shorter than the screen.
 */
export function useViewportHeight(){
  useEffect(() => {
    const vv = window.visualViewport;
    let focusTimer;

    function setViewport(){
      const layoutHeight = window.innerHeight;
      const visualHeight = vv?.height || layoutHeight;
      const keyboardOpen = !!vv && visualHeight < layoutHeight * 0.78;
      const height = keyboardOpen ? visualHeight : layoutHeight;

      document.documentElement.style.setProperty('--app-height', `${Math.round(height)}px`);
      document.documentElement.classList.toggle('keyboard-open', keyboardOpen);
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
    vv?.addEventListener('scroll', setViewport);
    window.addEventListener('resize', setViewport);
    window.addEventListener('orientationchange', setViewport);
    document.addEventListener('focusin', keepFocusedFieldVisible);

    return () => {
      clearTimeout(focusTimer);
      vv?.removeEventListener('resize', setViewport);
      vv?.removeEventListener('scroll', setViewport);
      window.removeEventListener('resize', setViewport);
      window.removeEventListener('orientationchange', setViewport);
      document.removeEventListener('focusin', keepFocusedFieldVisible);
      document.documentElement.classList.remove('keyboard-open');
    };
  }, []);
}
