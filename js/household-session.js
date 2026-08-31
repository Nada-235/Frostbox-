import { state } from './state.js';
import { requestRender } from './render-bus.js';
import { setMe, clearMe } from './local-storage.js';
import { genCode } from './utils.js';
import {
  createHousehold, findHousehold, joinHouseholdAsMember,
  subscribeToHousehold, unsubscribeFromHousehold
} from './firebase-service.js';
import { checkReminders } from './reminders.js';

function attachLiveSubscriptions(){
  subscribeToHousehold(state.code, {
    onMembers: members => {
      state.data.members = members;
      if(state.screen === 'main') requestRender();
    },
    onItems: items => {
      state.data.items = items;
      state.synced = true;
      checkReminders();
      if(state.screen === 'main') requestRender();
    },
    onShopping: shopping => {
      state.data.shopping = shopping;
      if(state.screen === 'main') requestRender();
    }
  });
}

/** Called on app load when this device already remembers a household. */
export async function resumeHousehold(code, name){
  state.code = code;
  state.myName = name;
  state.screen = 'main';
  attachLiveSubscriptions();
}

export async function startNewHousehold(){
  const code = genCode();
  const name = 'You';
  await createHousehold(code, name);
  state.code = code;
  state.myName = name;
  setMe({ code, name });
  attachLiveSubscriptions();
}

/** Returns false if the code doesn't match an existing household. */
export async function joinHousehold(code){
  const exists = await findHousehold(code);
  if(!exists) return false;
  const name = 'You';
  await joinHouseholdAsMember(code, name);
  state.code = code;
  state.myName = name;
  setMe({ code, name });
  attachLiveSubscriptions();
  return true;
}

export function leaveHousehold(){
  unsubscribeFromHousehold();
  clearMe();
}
