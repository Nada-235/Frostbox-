/**
 * A minimal event bus with one job: let any module ask for a re-render
 * without needing to import app.js (which would create circular imports,
 * since app.js imports the views, and the views trigger renders).
 */
const listeners = [];

export function onRenderRequest(fn){
  listeners.push(fn);
}

export function requestRender(){
  listeners.forEach(fn => fn());
}
