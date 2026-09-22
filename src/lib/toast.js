/**
 * Minimal pub/sub so any module (not just components) can trigger a toast,
 * the same way the original render-bus let non-component code request a
 * re-render. <ToastHost/> is the sole subscriber.
 */
const listeners = new Set();

export function onToast(fn){
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function showToast(message){
  listeners.forEach(fn => fn(message));
}
