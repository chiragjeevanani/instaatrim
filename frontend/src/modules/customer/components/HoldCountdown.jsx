import React, { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';
import { formatCountdown, msUntil } from '../../../shared/lib/time';

// Visible proof that a held slot really does expire — SRS §9.3.
export const HoldCountdown = ({ expiresAt, onExpire }) => {
  const [remaining, setRemaining] = useState(msUntil(expiresAt));

  useEffect(() => {
    const tick = () => {
      const left = msUntil(expiresAt);
      setRemaining(left);
      if (left <= 0) onExpire?.();
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const isLow = remaining < 60000;

  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold ${
        isLow ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-900'
      }`}
    >
      <Timer className="w-3 h-3" />
      <span>Slot held — {formatCountdown(remaining)}</span>
    </div>
  );
};
