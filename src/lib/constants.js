export const FOOD_CATEGORIES = [
  { id:'dairy',      en:'Dairy',                 ar:'ألبان',           icon:'🥛' },
  { id:'meat',       en:'Meat & Poultry',        ar:'لحوم ودواجن',      icon:'🥩' },
  { id:'seafood',    en:'Seafood',               ar:'مأكولات بحرية',    icon:'🐟' },
  { id:'produce',    en:'Fruits & Vegetables',   ar:'فواكه وخضروات',    icon:'🥦' },
  { id:'bakery',     en:'Bakery',                ar:'مخبوزات',          icon:'🍞' },
  { id:'beverages',  en:'Beverages',             ar:'مشروبات',          icon:'🧃' },
  { id:'condiments', en:'Condiments & Sauces',   ar:'صلصات وتوابل',     icon:'🫙' },
  { id:'leftovers',  en:'Leftovers',             ar:'بقايا طعام',       icon:'🍱' },
  { id:'other',      en:'Other',                 ar:'أخرى',            icon:'🔖' },
];

export const SHOP_CATEGORIES = [
  { id:'market',    en:'Market / Groceries',    ar:'سوق / بقالة',            icon:'🛒' },
  { id:'produce',   en:'Fruits & Vegetables',   ar:'فواكه وخضروات',          icon:'🥦' },
  { id:'meat',      en:'Meat & Seafood',        ar:'لحوم ومأكولات بحرية',    icon:'🥩' },
  { id:'dairy',     en:'Dairy & Eggs',          ar:'ألبان وبيض',             icon:'🥛' },
  { id:'bakery',    en:'Bakery',                ar:'مخبوزات',                icon:'🍞' },
  { id:'household', en:'Household',             ar:'مستلزمات منزلية',        icon:'🏠' },
  { id:'cleaning',  en:'Cleaning Supplies',     ar:'مستلزمات تنظيف',         icon:'🧽' },
  { id:'personal',  en:'Personal Care',         ar:'العناية الشخصية',        icon:'🧴' },
  { id:'other',     en:'Other',                 ar:'أخرى',                  icon:'🔖' },
];

export function catById(list, id){
  return list.find(c => c.id === id) || list[list.length - 1];
}

export const EN_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const AR_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
