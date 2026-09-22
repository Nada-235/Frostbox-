import { useEffect } from 'react';

/**
 * Keeps a --app-height CSS variable in sync with the real visible height on
 * mobile. `100dvh` alone doesn't reliably track every height change across
 * browsers (notably the on-screen keyboard opening/closing on some Android
 * WebViews, and older Safari without dvh support) — window.visualViewport
 * fires on all of those, so we mirror its height into a CSS var the shell
 * can use, falling back to dvh where visualViewport isn't available.
 */
export function useViewportHeight(){
  useEffect(() => {
    const vv = window.visualViewport;

    function setHeight(){
      const height = vv ? vv.height : window.innerHeight;
      document.documentElement.style.setProperty('--app-height', `${height}px`);
    }

    setHeight();

    const target = vv || window;
    target.addEventListener('resize', setHeight);
    target.addEventListener('scroll', setHeight);
    window.addEventListener('orientationchange', setHeight);

    return () => {
      target.removeEventListener('resize', setHeight);
      target.removeEventListener('scroll', setHeight);
      window.removeEventListener('orientationchange', setHeight);
    };
  }, []);
}
