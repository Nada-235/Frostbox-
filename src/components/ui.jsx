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

export function CatChip({ selected, onClick, children }){
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border text-[13.5px] font-semibold whitespace-nowrap cursor-pointer ${
        selected ? 'bg-kale border-kale text-card' : 'bg-card border-line text-kale'
      }`}
    >
      {children}
    </button>
  );
}

export function SegButton({ active, onClick, children }){
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-[9px] text-center rounded-[9px] border-none text-[13.5px] font-bold cursor-pointer ${
        active ? 'bg-card text-kale shadow-[0_2px_6px_rgba(22,56,50,0.12)]' : 'bg-transparent text-fog'
      }`}
    >
      {children}
    </button>
  );
}

export function SectionLabel({ icon, children }){
  return (
    <div className="text-xs font-bold uppercase tracking-[0.08em] rtl:tracking-normal rtl:normal-case text-fog mt-[22px] mb-2.5 flex items-center gap-1.5">
      {icon && <span>{icon}</span>}
      {children}
    </div>
  );
}

export function EmptyState({ emoji, children }){
  return (
    <div className="text-center py-[60px] px-5 text-fog">
      <div className="text-[44px] mb-3.5">{emoji}</div>
      <p className="text-[14.5px] leading-normal max-w-[230px] mx-auto">{children}</p>
    </div>
  );
}
