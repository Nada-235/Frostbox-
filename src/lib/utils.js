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

/** Defaults a reminder to 9am, two days before the "good until" date. */
export function defaultReminderAt(goodUntil){
  const d = new Date(goodUntil + 'T09:00:00');
  d.setDate(d.getDate() - 2);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Deterministic catalog doc id from an item name — normalizes casing/
 * whitespace so "Milk", "milk", " Milk " all resolve to the same catalog
 * entry, letting saves upsert with a plain setDoc(..., {merge:true})
 * instead of a separate find-by-name query.
 */
export function catalogIdFromName(name){
  const slug = (name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9؀-ۿ]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || uid();
}

/** Merges a new set of {place,price} entries into an existing price history — same place updates in place, a new one is appended. */
export function mergePrices(existing, incoming){
  const merged = (existing || []).slice();
  (incoming || []).forEach(next => {
    const i = merged.findIndex(p => (p.place || '').trim().toLowerCase() === (next.place || '').trim().toLowerCase());
    if(i >= 0) merged[i] = { ...merged[i], price: next.price };
    else merged.push(next);
  });
  return merged;
}
