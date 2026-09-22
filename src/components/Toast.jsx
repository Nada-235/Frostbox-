import { useEffect, useRef, useState } from 'react';
import { onToast } from '../lib/toast.js';

export function ToastHost(){
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef(null);

  useEffect(() => onToast(msg => {
    setMessage(msg);
    setVisible(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), 2200);
  }), []);

  return (
    <div
      className={`absolute left-1/2 bottom-[100px] -translate-x-1/2 bg-kale text-card px-5 py-[11px] rounded-[30px] text-[13.5px] font-semibold shadow-[var(--shadow-app)] z-50 pointer-events-none whitespace-nowrap transition-[opacity,transform] duration-250 ${
        visible ? 'opacity-100 -translate-y-1.5' : 'opacity-0'
      }`}
    >
      {message}
    </div>
  );
}
