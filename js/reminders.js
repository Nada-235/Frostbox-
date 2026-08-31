import { state } from './state.js';
import { t } from './i18n.js';
import { daysUntil } from './utils.js';
import { markReminderFired } from './firebase-service.js';

/**
 * Fires any due reminders (as a Notification, if permitted) and refreshes
 * state.dueReminders for the in-app banner. Safe to call frequently —
 * items are marked reminderFired so nothing double-fires.
 */
export function checkReminders(){
  const now = Date.now();
  const justFired = [];

  (state.data.items || []).forEach(item => {
    if(item.reminderEnabled && item.reminderAt && !item.reminderFired){
      if(new Date(item.reminderAt).getTime() <= now){
        justFired.push(item);
        item.reminderFired = true;
        markReminderFired(state.code, item.id);
      }
    }
  });

  if(justFired.length && window.Notification && Notification.permission === 'granted'){
    justFired.forEach(item => {
      new Notification(t('reminder_notification_title'), { body: t('reminder_notification_body', item.name) });
    });
  }

  state.dueReminders = (state.data.items || []).filter(item =>
    item.reminderEnabled && item.reminderAt && daysUntil(item.goodUntil) <= 2
  );
}
