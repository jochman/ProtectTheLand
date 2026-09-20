import React, { useEffect } from 'react';
import { SparkParticle, GameAction } from '../types';

interface SoulSparksOverlayProps {
  sparks: SparkParticle[];
  dispatch: React.Dispatch<GameAction>;
}

export const SoulSparksOverlay: React.FC<SoulSparksOverlayProps> = ({ sparks, dispatch }) => {
  useEffect(() => {
    if (sparks.length === 0) return;
    const timer = setTimeout(() => {
      sparks.forEach(s => {
        dispatch({ type: 'CLEAR_SPARK', id: s.id });
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [sparks, dispatch]);

  if (sparks.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      {sparks.map(spark => (
        <div
          key={spark.id}
          className="absolute w-3 h-3 rounded-full bg-amber-300 shadow-[0_0_12px_#ffd700] transition-all duration-700 ease-in-out transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${(spark.startX / 430) * 100}%`,
            top: `${(spark.startY / 570) * 100}%`,
            animation: 'flyToButton 0.75s forwards cubic-bezier(0.25, 1, 0.5, 1)',
          }}
        />
      ))}
      <style>{`
        @keyframes flyToButton {
          0% {
            transform: scale(0.5) translateY(0);
            opacity: 1;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.9;
          }
          100% {
            top: 92%;
            left: 50%;
            transform: scale(0.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
