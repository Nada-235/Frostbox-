import { useCallback, useEffect, useRef, useState } from 'react';

function hslToHex(h, s, l){
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = x => Math.round(255 * x).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

function hexToHsl(hex){
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
  if(!m) return { h: 100, s: 45, l: 40 };
  const r = parseInt(m[1], 16) / 255, g = parseInt(m[2], 16) / 255, b = parseInt(m[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if(d !== 0){
    s = d / (1 - Math.abs(2 * l - 1));
    switch(max){
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h *= 60;
    if(h < 0) h += 360;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/** Circular hue/saturation wheel (angle = hue, distance from center =
 *  saturation) with a separate lightness slider underneath. Drag-to-pick,
 *  touch-friendly, no external deps. */
export function ColorWheelPicker({ value, onChange }){
  const wheelRef = useRef(null);
  const [hsl, setHsl] = useState(() => hexToHsl(value));
  const draggingRef = useRef(false);

  useEffect(() => {
    setHsl(hexToHsl(value));
  }, [value]);

  const updateFromPoint = useCallback((clientX, clientY) => {
    const el = wheelRef.current;
    if(!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const radius = rect.width / 2;
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), radius);
    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
    if(angle < 0) angle += 360;
    const s = Math.round((dist / radius) * 100);
    setHsl(prev => {
      const next = { ...prev, h: Math.round(angle), s };
      onChange(hslToHex(next.h, next.s, next.l));
      return next;
    });
  }, [onChange]);

  useEffect(() => {
    if(!draggingRef.current) return;
    function move(e){
      const p = e.touches ? e.touches[0] : e;
      updateFromPoint(p.clientX, p.clientY);
    }
    function up(){ draggingRef.current = false; }
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  });

  function onPointerDown(e){
    draggingRef.current = true;
    updateFromPoint(e.clientX, e.clientY);
  }

  function onLightnessChange(l){
    setHsl(prev => {
      const next = { ...prev, l };
      onChange(hslToHex(next.h, next.s, next.l));
      return next;
    });
  }

  const angleRad = hsl.h * Math.PI / 180;
  const radiusPct = hsl.s / 2;
  const dotColor = hslToHex(hsl.h, hsl.s, hsl.l);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={wheelRef}
        onPointerDown={onPointerDown}
        className="relative w-[200px] h-[200px] rounded-full touch-none select-none cursor-pointer shadow-[var(--shadow-sm)]"
        style={{
          background: `radial-gradient(circle, white 0%, transparent 72%),
            conic-gradient(from 90deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)`,
        }}
      >
        <span
          className="absolute w-6 h-6 rounded-full border-[3px] border-white -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            left: `${50 + radiusPct * Math.cos(angleRad)}%`,
            top: `${50 + radiusPct * Math.sin(angleRad)}%`,
            background: dotColor,
            boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
          }}
        />
      </div>
      <input
        type="range" min="8" max="88" value={hsl.l}
        onChange={e => onLightnessChange(Number(e.target.value))}
        className="w-full max-w-[220px] accent-[var(--color-mint)]"
        style={{
          background: `linear-gradient(to right, ${hslToHex(hsl.h, hsl.s, 8)}, ${hslToHex(hsl.h, hsl.s, 50)}, ${hslToHex(hsl.h, hsl.s, 88)})`,
          height: 8, borderRadius: 999, appearance: 'none', WebkitAppearance: 'none',
        }}
      />
    </div>
  );
}
