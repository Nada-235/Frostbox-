export function uid(){
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function genCode(){
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for(let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function todayStr(){
  return new Date().toISOString().slice(0, 10);
}

export function daysUntil(dateStr){
  const target = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target - now) / 86400000);
}

export function escapeHtml(str){
  return (str || '').replace(/[&<>"']/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[c]));
}

/** Defaults a reminder to 9am, two days before the "good until" date. */
export function defaultReminderAt(goodUntil){
  const d = new Date(goodUntil + 'T09:00:00');
  d.setDate(d.getDate() - 2);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
