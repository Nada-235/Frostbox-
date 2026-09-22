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

/** Normalizes a catalog entry's records regardless of shape — reads the
 *  current {brand,size,records:[{brand,size,supermarket,price}]} shape, and
 *  falls back to synthesizing records from the older {brand,size,prices:
 *  [{place,price}]} shape so entries saved before the restructure still show up. */
export function catalogRecords(entry){
  if(!entry) return [];
  if(Array.isArray(entry.records)) return entry.records;
  return (entry.prices || []).map(p => ({
    id: p.id || uid(),
    brand: entry.brand || '',
    size: entry.size || '',
    supermarket: p.place || p.supermarket || '',
    price: p.price,
  }));
}

/** Merges a new set of {brand,size,supermarket,price} records into an existing
 *  list — a record matching the same brand+size+supermarket (case/whitespace
 *  insensitive) has its price updated in place; anything new is appended, and
 *  every other record is left untouched. */
export function mergeRecords(existing, incoming){
  const key = r => [r.brand, r.size, r.supermarket].map(v => (v || '').trim().toLowerCase()).join('|');
  const merged = (existing || []).slice();
  (incoming || []).forEach(next => {
    const i = merged.findIndex(r => key(r) === key(next));
    if(i >= 0) merged[i] = { ...merged[i], price: next.price };
    else merged.push(next);
  });
  return merged;
}
