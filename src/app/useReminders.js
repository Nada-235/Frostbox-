import { useEffect } from 'react';
import { useAppState, useAppDispatch } from './AppContext.jsx';
import { t } from '../lib/i18n.js';
import { daysUntil } from '../lib/utils.js';
import { markReminderFired } from '../lib/firebase.js';

/**
 * Fires any due reminders (as a Notification, if permitted) and refreshes
 * dueReminders for the in-app banner. Runs whenever the item list changes,
 * plus every 60s so a reminder that comes due while the app sits idle
 * still fires without needing a data update. Items are marked
 * reminderFired so nothing double-fires.
 */
export function useReminders(){
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { items } = state.data;
  const { code, lang } = state;

  useEffect(() => {
    function checkReminders(){
      const now = Date.now();
      const justFired = [];

      items.forEach(item => {
        if(item.reminderEnabled && item.reminderAt && !item.reminderFired){
          if(new Date(item.reminderAt).getTime() <= now){
            justFired.push(item);
            markReminderFired(code, item.id);
          }
        }
      });

      if(justFired.length){
        dispatch({ type: 'MARK_REMINDERS_FIRED', ids: justFired.map(i => i.id) });
        if(window.Notification && Notification.permission === 'granted'){
          justFired.forEach(item => {
            new Notification(t(lang, 'reminder_notification_title'), {
              body: t(lang, 'reminder_notification_body', item.name),
            });
          });
        }
      }

      dispatch({
        type: 'SET_DUE_REMINDERS',
        list: items.filter(item =>
          item.reminderEnabled && item.reminderAt && daysUntil(item.goodUntil) <= 2
        ),
      });
    }

    checkReminders();
    const id = setInterval(checkReminders, 60000);
    return () => clearInterval(id);
  }, [items, code, lang, dispatch]);
}
