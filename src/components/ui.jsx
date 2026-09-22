/** Small shared UI atoms reused across the tab/form screens. */

export function Switch({ on, onToggle }){
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative w-[46px] h-[27px] rounded-full border-none shrink-0 cursor-pointer transition-colors duration-200 ${on ? 'bg-mint' : 'bg-line'}`}
    >
      <span
        className={`absolute top-[3px] w-[21px] h-[21px] rounded-full bg-card shadow-[0_1px_3px_rgba(0,0,0,0.25)] transition-all duration-200 ${on ? 'start-[22px]' : 'start-[3px]'}`}
      />
    </button>
  );
}

/**
 * icon: optional Lucide icon component. color: optional hex used for the
 * selected fill (per-category accent). Falls back to a neutral dark fill.
 */
export function CatChip({ selected, onClick, color, icon: Icon, children }){
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border text-[13.5px] font-semibold whitespace-nowrap cursor-pointer transition-colors ${
        selected ? 'border-transparent text-card' : 'bg-card border-line text-kale'
      }`}
      style={selected ? { background: color || 'var(--color-kale)' } : undefined}
    >
      {Icon && <Icon size={15} strokeWidth={2.25} className="shrink-0" />}
      {children}
    </button>
  );
}

export function SegButton({ active, onClick, children }){
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-[9px] text-center rounded-[9px] border-none text-[13.5px] font-bold cursor-pointer transition-colors ${
        active ? 'bg-card text-mint-deep shadow-[0_2px_6px_rgba(40,54,24,0.16)]' : 'bg-transparent text-fog'
      }`}
    >
      {children}
    </button>
  );
}

/** icon: optional Lucide icon component, tinted by `color` (per-category) or a neutral default. */
export function SectionLabel({ icon: Icon, color, children }){
  return (
    <div className="text-xs font-bold uppercase tracking-[0.08em] rtl:tracking-normal rtl:normal-case text-fog mt-[22px] mb-2.5 flex items-center gap-2">
      {Icon && (
        <span
          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
          style={{ background: color ? `${color}26` : 'var(--color-track)', color: color || 'var(--color-fog)' }}
        >
          <Icon size={12} strokeWidth={2.5} />
        </span>
      )}
      {children}
    </div>
  );
}

const ICON_BTN_VARIANTS = {
  ghost: 'bg-card border border-line text-kale',
  primary: 'btn-brand border-none',
  danger: 'bg-card border-[1.5px] border-[#EFC9C9] text-berry',
};

/** Compact icon-only action button (form footers) — label is used for a11y (aria-label/title), not shown. */
export function IconButton({ onClick, icon: Icon, label, variant = 'ghost', disabled, grow }){
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`h-11 rounded-2xl flex items-center justify-center cursor-pointer transition-transform active:scale-95 disabled:opacity-60 ${
        ICON_BTN_VARIANTS[variant]
      } ${grow ? 'flex-1' : 'w-11 shrink-0'}`}
    >
      <Icon size={19} strokeWidth={2.25} aria-hidden="true" />
    </button>
  );
}

/** icon: Lucide icon component, shown large and muted above the message. */
export function EmptyState({ icon: Icon, children }){
  return (
    <div className="text-center py-[60px] px-5 text-fog">
      <Icon size={44} strokeWidth={1.5} className="mx-auto mb-3.5 opacity-70" />
      <p className="text-[14.5px] leading-normal max-w-[230px] mx-auto">{children}</p>
    </div>
  );
}
