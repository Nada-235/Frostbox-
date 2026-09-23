import { useCallback } from 'react';
import { useAppDispatch } from './AppContext.jsx';
import { setMe, clearMe } from '../lib/localStorage.js';
import { genCode } from '../lib/utils.js';
import {
  createHousehold, findHousehold, joinHouseholdAsMember,
  subscribeToHousehold, unsubscribeFromHousehold,
} from '../lib/firebase.js';

/**
 * Household lifecycle (start / join / resume / leave), ported from
 * household-session.js. Firestore's live listeners feed straight into the
 * reducer instead of mutating a shared `state` object.
 */
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

  /** Called on app load when this device already remembers a household. */
  const resumeHousehold = useCallback(async (code, name) => {
    dispatch({ type: 'ENTER_HOUSEHOLD', code, myName: name });
    attachLiveSubscriptions(code);
  }, [dispatch, attachLiveSubscriptions]);

  const startNewHousehold = useCallback(async () => {
    const code = genCode();
    const name = 'You';
    await createHousehold(code, name);
    setMe({ code, name });
    dispatch({ type: 'ENTER_HOUSEHOLD', code, myName: name });
    attachLiveSubscriptions(code);
  }, [dispatch, attachLiveSubscriptions]);

  /** Returns false if the code doesn't match an existing household. */
  const joinHousehold = useCallback(async (code, name, memberType) => {
    const exists = await findHousehold(code);
    if(!exists) return false;

    const cleanName = name.trim();
    const cleanType = memberType.trim();
    const displayName = `${cleanName}, ${cleanType}`;

    await joinHouseholdAsMember(code, displayName);
    setMe({ code, name: displayName });
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
