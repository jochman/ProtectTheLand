import React from 'react';
import { GameState, GameAction, HexTile } from '../types';

interface HexMapCanvasProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const HexMapCanvas: React.FC<HexMapCanvasProps> = ({ state, dispatch }) => {
  const tiles = Object.values(state.tiles);

  // Helper to generate hexagonal SVG path centered at (cx, cy) with radius r
  const getHexPoints = (cx: number, cy: number, r: number = 38) => {
    const points: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i + Math.PI / 6;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };

  return (
    <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center my-1 select-none">
      <svg
        viewBox="0 0 430 570"
        className="w-full h-full max-h-[570px] drop-shadow-md"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Subtle gradient for Israel green terrain */}
          <linearGradient id="israelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a3d97f" />
            <stop offset="100%" stopColor="#8ac667" />
          </linearGradient>

          {/* Gradient for West Bank ochre terrain */}
          <linearGradient id="westBankGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f7dc8d" />
            <stop offset="100%" stopColor="#eec366" />
          </linearGradient>

          {/* Sea gradient */}
          <linearGradient id="seaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#68b4ea" />
            <stop offset="100%" stopColor="#4395cf" />
          </linearGradient>

          {/* Dead Sea */}
          <linearGradient id="deadSeaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5396cc" />
            <stop offset="100%" stopColor="#3b7cb0" />
          </linearGradient>

          {/* Glowing pulse filter for breached borders */}
          <filter id="alertGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. RENDER BASE HEX TILES */}
        {tiles.map((tile: HexTile) => {
          let fill = 'url(#westBankGrad)';
          let stroke = '#dfb55c';

          if (tile.terrain === 'israel') {
            fill = 'url(#israelGrad)';
            stroke = '#72aa50';
          } else if (tile.terrain === 'sea') {
            fill = 'url(#seaGrad)';
            stroke = '#3c81b5';
          } else if (tile.label === 'ים המלח') {
            fill = 'url(#deadSeaGrad)';
            stroke = '#346d9c';
          } else if (tile.terrain === 'border') {
            fill = tile.garrisonCount > 0 ? '#b8dc92' : '#eecba1';
            stroke = '#d89b65';
          }

          const isClickable = tile.hasSettlement;

          return (
            <g
              key={tile.id}
              onClick={() => {
                if (isClickable) {
                  dispatch({ type: 'SELECT_TILE', tileId: tile.id });
                }
              }}
              className={isClickable ? 'cursor-pointer hover:opacity-90' : ''}
            >
              <polygon
                points={getHexPoints(tile.x, tile.y, 38)}
                fill={fill}
                stroke={stroke}
                strokeWidth="2"
                strokeLinejoin="round"
                className="transition-colors duration-200"
              />

              {/* Decorative terrain touches (trees in Israel, rocks in West Bank) */}
              {tile.terrain === 'israel' && !tile.label && (
                <g opacity="0.3" transform={`translate(${tile.x - 6}, ${tile.y - 12})`}>
                  <circle cx="6" cy="4" r="3" fill="#2d5e1e" />
                  <circle cx="10" cy="8" r="3.5" fill="#387426" />
                </g>
              )}
              {tile.terrain === 'westbank' && !tile.hasSettlement && (
                <g opacity="0.3" transform={`translate(${tile.x - 8}, ${tile.y - 6})`}>
                  <rect x="2" y="2" width="4" height="3" rx="1" fill="#8f6735" />
                  <rect x="8" y="4" width="5" height="4" rx="1.5" fill="#a4773d" />
                </g>
              )}

              {/* Region or Town label */}
              {tile.label && (
                <text
                  x={tile.x}
                  y={tile.y + 4}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="bold"
                  className="pointer-events-none drop-shadow-sm font-heebo"
                >
                  {tile.label}
                </text>
              )}
            </g>
          );
        })}

        {/* 2. RENDER THE UNDULATING GREEN LINE / BORDER BARRIER */}
        <path
          d="M 195 40 Q 185 100 185 135 T 175 210 T 165 285 T 160 360 T 160 435 Q 140 460 120 485 L 180 490"
          fill="none"
          stroke={state.defenseScore < 30 ? '#ef4444' : '#e04238'}
          strokeWidth="4"
          strokeDasharray={state.defenseScore < 50 ? '6,3' : 'none'}
          className={state.defenseScore < 30 ? 'animate-pulse' : ''}
        />

        {/* 3. RENDER BORDER CHECKPOINT GARRISONS & BREACH ALERTS */}
        {tiles.filter(t => t.isBorderCheckpoint).map(cp => {
          const isManned = cp.garrisonCount > 0;
          return (
            <g key={`checkpoint-${cp.id}`} transform={`translate(${cp.x}, ${cp.y})`}>
              {isManned ? (
                // Manned soldier figure
                <g>
                  <circle cx="0" cy="0" r="13" fill="rgba(255,255,255,0.7)" stroke="#22c55e" strokeWidth="2" />
                  {/* Miniature Green Soldier Figurine */}
                  <circle cx="0" cy="-4" r="3.5" fill="#1b4d1b" />
                  <path d="M -3 0 L 3 0 L 4 7 L -4 7 Z" fill="#2d6a2d" />
                  <rect x="-2" y="7" width="1.5" height="4" fill="#1b4d1b" />
                  <rect x="0.5" y="7" width="1.5" height="4" fill="#1b4d1b" />
                </g>
              ) : (
                // UNMANNED / BREACHED CHECKPOINT ALERT
                <g filter="url(#alertGlow)" className="animate-pulse">
                  <circle cx="0" cy="0" r="14" fill="#ef4444" stroke="#ffffff" strokeWidth="2.5" />
                  <text
                    x="0"
                    y="5"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="14"
                    fontWeight="900"
                    className="font-rubik"
                  >
                    !
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* 4. RENDER SETTLEMENTS IN WEST BANK */}
        {tiles.filter(t => t.hasSettlement).map(s => {
          const isGuarded = s.garrisonCount > 0;
          return (
            <g key={`settlement-${s.id}`} transform={`translate(${s.x}, ${s.y})`} className="cursor-pointer">
              {/* Red Dotted Security Perimeter */}
              <circle
                cx="0"
                cy="0"
                r="22"
                fill="rgba(239, 68, 68, 0.08)"
                stroke="#dc2626"
                strokeWidth="2"
                strokeDasharray="3,3"
              />

              {/* 3D Clay Settlement House Model */}
              <g transform="translate(-10, -10)">
                {/* House Base */}
                <rect x="2" y="8" width="16" height="12" fill="#f5ede0" rx="1.5" stroke="#d5c3aa" strokeWidth="1" />
                {/* Slanted Roof */}
                <polygon points="1,8 10,0 19,8" fill="#d97706" stroke="#b45309" strokeWidth="1" />
                {/* Door */}
                <rect x="7" y="13" width="5" height="7" fill="#78350f" rx="0.5" />
              </g>

              {/* Guarding Soldier if present */}
              {isGuarded ? (
                <g transform="translate(10, 6)">
                  <circle cx="0" cy="0" r="8" fill="#ffffff" stroke="#16a34a" strokeWidth="1.5" />
                  <circle cx="0" cy="-2.5" r="2.5" fill="#1b4d1b" />
                  <path d="M -2 0.5 L 2 0.5 L 2.5 5 L -2.5 5 Z" fill="#2d6a2d" />
                </g>
              ) : (
                <g transform="translate(10, 6)" className="animate-bounce">
                  <circle cx="0" cy="0" r="7" fill="#ef4444" />
                  <text x="0" y="3" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">!</text>
                </g>
              )}

              {/* Settlement Name Tag */}
              {s.settlementName && (
                <g transform="translate(0, 24)">
                  <rect
                    x="-24"
                    y="-6"
                    width="48"
                    height="12"
                    rx="3"
                    fill="rgba(0,0,0,0.65)"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="7"
                    fontWeight="bold"
                    className="font-heebo"
                  >
                    {s.settlementName}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* 5. RENDER INFILTRATING ENEMY TRUCKS (DURING BREACHES) */}
        {state.infiltratingTrucks.map(truck => {
          const currentX = truck.x + (truck.targetX - truck.x) * truck.progress;
          const currentY = truck.y + (truck.targetY - truck.y) * truck.progress;

          return (
            <g key={truck.id} transform={`translate(${currentX}, ${currentY})`} className="animate-pulse">
              {/* Dust / exhaust effect */}
              <circle cx="8" cy="2" r="4" fill="rgba(200, 160, 100, 0.5)" />
              {/* White Pickup Truck Model */}
              <rect x="-9" y="-4" width="18" height="9" fill="#f8fafc" rx="2" stroke="#475569" strokeWidth="1" />
              <rect x="-9" y="-2" width="6" height="5" fill="#94a3b8" />
              {/* Armed Attacker Figure on truck bed */}
              <circle cx="3" cy="-7" r="2.5" fill="#dc2626" />
              <rect x="2" y="-4.5" width="2" height="4" fill="#991b1b" />
              {/* Wheels */}
              <circle cx="-5" cy="5" r="2" fill="#0f172a" />
              <circle cx="5" cy="5" r="2" fill="#0f172a" />
            </g>
          );
        })}

        {/* Big Region Titles */}
        <text
          x="100"
          y="535"
          textAnchor="middle"
          fill="#365314"
          fontSize="16"
          fontWeight="900"
          opacity="0.8"
          className="font-rubik pointer-events-none drop-shadow-sm"
        >
          {state.locale === 'he' ? 'ישראל' : 'ISRAEL'}
        </text>

        <text
          x="300"
          y="535"
          textAnchor="middle"
          fill="#78350f"
          fontSize="16"
          fontWeight="900"
          opacity="0.8"
          className="font-rubik pointer-events-none drop-shadow-sm"
        >
          {state.locale === 'he' ? 'הגדה המערבית' : 'WEST BANK'}
        </text>
      </svg>
    </div>
  );
};
