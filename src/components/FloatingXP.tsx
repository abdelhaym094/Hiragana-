import React, { useEffect, useState } from 'react';

interface FloatingXPProps {
  amount: number | null;
  onComplete?: () => void;
}

export const FloatingXP: React.FC<FloatingXPProps> = ({ amount, onComplete }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (amount !== null && amount > 0) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 950);
      return () => clearTimeout(timer);
    }
  }, [amount, onComplete]);

  if (!visible || !amount) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="animate-float-xp flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1B2027]/90 border border-[#FFD166]/50 shadow-xl shadow-[#FFD166]/10 backdrop-blur-md">
        <span className="text-lg">⭐</span>
        <span className="font-bold text-base text-[#FFD166] tabular-nums tracking-wide">
          +{amount} XP
        </span>
      </div>
    </div>
  );
};
