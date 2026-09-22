/**
 * Curated theme presets. `id` matches the [data-theme="…"] selectors in
 * index.css (the default/"sage" theme needs no attribute — it's the base
 * @theme values). `swatch` is only used to render the picker's color dot.
 */
export const THEMES = [
  { id: 'sage', name: 'Sage', swatch: '#6A994E' },
  { id: 'ocean', name: 'Ocean', swatch: '#2E86AB' },
  { id: 'sunset', name: 'Sunset', swatch: '#E76F51' },
  { id: 'berry', name: 'Berry', swatch: '#A63A6B' },
  { id: 'slate', name: 'Slate', swatch: '#475569' },
];

export function isValidTheme(id){
  return THEMES.some(t => t.id === id);
}
