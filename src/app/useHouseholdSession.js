import { useCallback } from 'react';
import { useAppDispatch } from './AppContext.jsx';
import { setMe, clearMe } from '../lib/localStorage.js';
import { genCode } from '../lib/utils.js';
import {
  createHousehold, findHousehold, joinHouseholdAsMember,
  subscribeToHousehold, unsubscribeFromHousehold,
} from '../lib/firebase.js';

function createAdminToken(){
  if(globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export function useHouseholdSession(){
  const dispatch = useAppDispatch();

  const attachLiveSubscriptions = useCallback((code) => {
    subscribeToHousehold(code, {
      onMembers: members => dispatch({ type: 'SET_MEMBERS', members }),
      onItems: items => dispatch({ type: 'SET_ITEMS', items }),
      onShopping: shopping => dispatch({ type: 'SET_SHOPPING', shopping }),
      onCatalog: catalog => dispatch({ type: 'SET_CATALOG', catalog }),
    });
  }, [dispatch]);

  const resumeHousehold = useCallback(async (code, name) => {
    dispatch({ type: 'ENTER_HOUSEHOLD', code, myName: name });
    attachLiveSubscriptions(code);
  }, [dispatch, attachLiveSubscriptions]);

  const startNewHousehold = useCallback(async () => {
    const code = genCode();
    const name = 'Ddo';
    const adminToken = createAdminToken();
    await createHousehold(code, name, adminToken);
    setMe({ code, name, role: 'admin', adminToken });
    dispatch({ type: 'ENTER_HOUSEHOLD', code, myName: name });
    attachLiveSubscriptions(code);
  }, [dispatch, attachLiveSubscriptions]);

  const joinHousehold = useCallback(async (code, name, memberType) => {
    const exists = await findHousehold(code);
    if(!exists) return false;

    const cleanName = name.trim();
    const cleanType = memberType.trim();
    const displayName = `${cleanName}, ${cleanType}`;

    await joinHouseholdAsMember(code, displayName);
    setMe({ code, name: displayName, role: 'member' });
    dispatch({ type: 'ENTER_HOUSEHOLD', code, myName: displayName });
    attachLiveSubscriptions(code);
    return true;
  }, [dispatch, attachLiveSubscriptions]);

  const leaveHousehold = useCallback((lang) => {
    unsubscribeFromHousehold();
    clearMe();
    dispatch({ type: 'RESET', lang });
  }, [dispatch]);

  return { resumeHousehold, startNewHousehold, joinHousehold, leaveHousehold };
}
