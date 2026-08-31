import { state } from './state.js';
import { onRenderRequest, requestRender } from './render-bus.js';
import { getMe, getLang } from './local-storage.js';
import { initFirebase } from './firebase-service.js';
import { resumeHousehold } from './household-session.js';
import { checkReminders } from './reminders.js';

import * as setupView from './views/setup.js';
import * as onboardingView from './views/onboarding.js';
import * as mainView from './views/main.js';
import * as itemFormView from './views/item-form.js';
import * as shopItemFormView from './views/shop-item-form.js';

const SCREENS = {
  setup: setupView,
  onboard: onboardingView,
  main: mainView,
  add: itemFormView,
  shopadd: shopItemFormView,
};

/**
 * Any element marked data-scroll-key keeps its scroll position across a
 * full re-render (e.g. tapping a filter chip shouldn't snap a horizontally
 * scrolled chip row back to the start).
 */
function captureScrollPositions(){
  const positions = {};
  document.querySelectorAll('[data-scroll-key]').forEach(el => {
    positions[el.dataset.scrollKey] = { left: el.scrollLeft, top: el.scrollTop };
  });
  return positions;
}
function restoreScrollPositions(positions){
  document.querySelectorAll('[data-scroll-key]').forEach(el => {
    const saved = positions[el.dataset.scrollKey];
    if(saved){ el.scrollLeft = saved.left; el.scrollTop = saved.top; }
  });
}

function render(){
  const appEl = document.getElementById('app');
  const isRtl = state.lang === 'ar';
  appEl.classList.toggle('rtl', isRtl);
  appEl.setAttribute('dir', isRtl ? 'rtl' : 'ltr');

  const screen = SCREENS[state.screen];
  if(!screen){ console.error('Unknown screen:', state.screen); return; }

  const savedScroll = captureScrollPositions();
  appEl.innerHTML = screen.render();
  screen.bind();
  restoreScrollPositions(savedScroll);
}
onRenderRequest(render);

async function init(){
  state.lang = getLang();

  if(!initFirebase()){
    state.screen = 'setup';
    requestRender();
    return;
  }

  const me = getMe();
  if(me && me.code){
    await resumeHousehold(me.code, me.name || 'You');
  } else {
    state.screen = 'onboard';
  }
  requestRender();
  setInterval(checkReminders, 60000);
}

init();
