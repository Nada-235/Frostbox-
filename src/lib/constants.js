export const FOOD_CATEGORIES = [
  { id:'dairy',      en:'Dairy',                 ar:'ألبان',           icon:'🥛', color:'#3B82F6' },
  { id:'meat',       en:'Meat & Poultry',        ar:'لحوم ودواجن',      icon:'🥩', color:'#FF5470' },
  { id:'seafood',    en:'Seafood',               ar:'مأكولات بحرية',    icon:'🐟', color:'#06B6D4' },
  { id:'produce',    en:'Fruits & Vegetables',   ar:'فواكه وخضروات',    icon:'🥦', color:'#22C55E' },
  { id:'bakery',     en:'Bakery',                ar:'مخبوزات',          icon:'🍞', color:'#F59E0B' },
  { id:'beverages',  en:'Beverages',             ar:'مشروبات',          icon:'🧃', color:'#EC4899' },
  { id:'condiments', en:'Condiments & Sauces',   ar:'صلصات وتوابل',     icon:'🫙', color:'#F97316' },
  { id:'leftovers',  en:'Leftovers',             ar:'بقايا طعام',       icon:'🍱', color:'#8B5CF6' },
  { id:'other',      en:'Other',                 ar:'أخرى',            icon:'🔖', color:'#6B7280' },
];

export const SHOP_CATEGORIES = [
  { id:'market',    en:'Market / Groceries',    ar:'سوق / بقالة',            icon:'🛒', color:'#7C5CFC' },
  { id:'produce',   en:'Fruits & Vegetables',   ar:'فواكه وخضروات',          icon:'🥦', color:'#22C55E' },
  { id:'meat',      en:'Meat & Seafood',        ar:'لحوم ومأكولات بحرية',    icon:'🥩', color:'#FF5470' },
  { id:'dairy',     en:'Dairy & Eggs',          ar:'ألبان وبيض',             icon:'🥛', color:'#3B82F6' },
  { id:'bakery',    en:'Bakery',                ar:'مخبوزات',                icon:'🍞', color:'#F59E0B' },
  { id:'household', en:'Household',             ar:'مستلزمات منزلية',        icon:'🏠', color:'#14B8A6' },
  { id:'cleaning',  en:'Cleaning Supplies',     ar:'مستلزمات تنظيف',         icon:'🧽', color:'#06B6D4' },
  { id:'personal',  en:'Personal Care',         ar:'العناية الشخصية',        icon:'🧴', color:'#EC4899' },
  { id:'other',     en:'Other',                 ar:'أخرى',                  icon:'🔖', color:'#6B7280' },
];

export function catById(list, id){
  return list.find(c => c.id === id) || list[list.length - 1];
}

export const EN_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const AR_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
