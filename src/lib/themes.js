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
  { id: 'bloom', name: 'Bloom', swatch: '#E34989' },
];

/** The "custom" theme id — background/neutrals stay light grey, only the
 *  accent (mint/mint-deep/teal) comes from the user's own picked color. */
export const CUSTOM_THEME_ID = 'custom';

export function isValidTheme(id){
  return THEMES.some(t => t.id === id) || id === CUSTOM_THEME_ID;
}

/**
 * Font presets, kept separate per language since Arabic needs its own
 * typeface family entirely (Latin fonts don't cover Arabic script).
 * `id` is what's persisted; the CSS custom properties are set from the
 * `sans`/`display`/`family` values directly (see App.jsx).
 */
export const FONTS = {
  en: [
    { id: 'default', name: 'Modern', sans: 'Inter', display: 'Space Grotesk' },
    { id: 'poppins', name: 'Rounded', sans: 'Poppins', display: 'Poppins' },
    { id: 'lora', name: 'Classic', sans: 'Lora', display: 'Lora' },
  ],
  ar: [
    { id: 'tajawal', name: 'Tajawal', family: 'Tajawal' },
    { id: 'cairo', name: 'Cairo', family: 'Cairo' },
    { id: 'almarai', name: 'Almarai', family: 'Almarai' },
  ],
};

export function isValidFont(lang, id){
  return (FONTS[lang] || []).some(f => f.id === id);
}
