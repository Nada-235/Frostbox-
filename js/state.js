/**
 * Central app state. Every module imports this same object and mutates its
 * properties directly (not reassigning `state` itself, since other modules
 * hold a reference to this exact object).
 */
export const state = {
  code: null,
  myName: null,
  lang: 'en',
  data: { items: [], shopping: [], members: [] },
  tab: 'fridge',           // 'fridge' | 'shopping' | 'household'
  screen: 'loading',       // 'loading' | 'setup' | 'onboard' | 'main' | 'add' | 'shopadd'
  joinBoxOpen: false,
  editingItem: null,       // fridge item currently being added/edited, or null
  editingShopItem: null,   // shopping item currently being added/edited, or null
  locationFilter: 'all',   // 'all' | 'fridge' | 'freezer'
  categoryFilter: 'all',
  synced: false,
  dueReminders: []
};

/** Reset to a signed-out state, keeping the chosen language. */
export function resetState(lang){
  Object.assign(state, {
    code: null,
    myName: null,
    lang,
    data: { items: [], shopping: [], members: [] },
    tab: 'fridge',
    screen: 'onboard',
    joinBoxOpen: false,
    editingItem: null,
    editingShopItem: null,
    locationFilter: 'all',
    categoryFilter: 'all',
    synced: false,
    dueReminders: []
  });
}
