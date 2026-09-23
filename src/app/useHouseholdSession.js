import { useCallback } from 'react';
import { useAppDispatch } from './AppContext.jsx';
import { setMe, clearMe } from '../lib/localStorage.js';
import { genCode } from '../lib/utils.js';
import {
  createHousehold, findHousehold, joinHouseholdAsMember,
  subscribeToHousehold, unsubscribeFromHousehold, currentUserId,
} from '../lib/firebase.js';

export function useHouseholdSession(){
  const dispatch = useAppDispatch();

  const attachLiveSubscriptions = useCallback((code) => {
    subscribeToHousehold(code, {
      onMembers: (members, adminUid, memberProfiles) => {
        const isAdmin = !!adminUid && adminUid === currentUserId();
        const me = JSON.parse(localStorage.getItem('frostbox_me') || 'null');
        const memberUids = Object.fromEntries(Object.entries(memberProfiles || {}).map(([uid, displayName]) => [displayName, uid]));
        if(me) setMe({ ...me, role: isAdmin ? 'admin' : 'member', memberUids });
        dispatch({ type: 'SET_MEMBERS', members });
      },
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
    await createHousehold(code, name);
    setMe({ code, name, role: 'admin', uid: currentUserId() });
    dispatch({ type: 'ENTER_HOUSEHOLD', code, myName: name });
    attachLiveSubscriptions(code);
  }, [dispatch, attachLiveSubscriptions]);

  const joinHousehold = useCallback(async (code, name, memberType) => {
    const exists = await findHousehold(code);
    if(!exists) return false;
    const displayName = `${name.trim()}, ${memberType.trim()}`;
    await joinHouseholdAsMember(code, displayName);
    setMe({ code, name: displayName, role: 'member', uid: currentUserId() });
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
