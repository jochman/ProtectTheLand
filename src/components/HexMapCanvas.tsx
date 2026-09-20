import React from 'react';
import { GameState, GameAction, HexTile } from '../types';

interface HexMapCanvasProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const HexMapCanvas: React.FC<HexMapCanvasProps> = ({ state, dispatch }) => {
  const tiles = Object.values(state.tiles);

  // Helper to generate hexagonal SVG points centered at (cx, cy) with radius r
  const getHexPoints = (cx: number, cy: number, r: number = 36) => {
    const points: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i + Math.PI / 6;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };

  // Auto-clear moving troops once their leap animation completes
  React.useEffect(() => {
    if (!state.movingTroops || state.movingTroops.length === 0) return;
    const timers = state.movingTroops.map(troop => {
      return setTimeout(() => {
        dispatch({ type: 'CLEAR_MOVING_TROOP', id: troop.id });
      }, 850);
    });
    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, [state.movingTroops, dispatch]);

  return (
    <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center my-0.5 select-none">
      <svg
        viewBox="0 0 460 565"
        className="w-full h-full max-h-[570px] drop-shadow-xl"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Enhanced Gradients for authentic 3D isometric look */}
          <linearGradient id="israelTerrain" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a7de7e" />
            <stop offset="60%" stopColor="#93cc6b" />
            <stop offset="100%" stopColor="#7cb354" />
          </linearGradient>

          <linearGradient id="westBankTerrain" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fae08f" />
            <stop offset="60%" stopColor="#ecc062" />
            <stop offset="100%" stopColor="#dba743" />
          </linearGradient>

          <linearGradient id="cityTerrain" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f3deb3" />
            <stop offset="70%" stopColor="#e2c490" />
            <stop offset="100%" stopColor="#cfab72" />
          </linearGradient>

          <linearGradient id="buildCandidate" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff3b0" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          <linearGradient id="seaWater" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#71bfee" />
            <stop offset="70%" stopColor="#4da3db" />
            <stop offset="100%" stopColor="#317eb3" />
          </linearGradient>

          <linearGradient id="deadSea" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5ea0d4" />
            <stop offset="100%" stopColor="#356d98" />
          </linearGradient>

          <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>

          <linearGradient id="wallGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fae8b0" />
          </linearGradient>

          <radialGradient id="coinGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fff7a1" />
            <stop offset="45%" stopColor="#ffd700" />
            <stop offset="100%" stopColor="#cc9900" />
          </radialGradient>

          <filter id="dropShadow" x="-20%" y="-20%" width="150%" height="150%">
            <feDropShadow dx="1" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.25" />
          </filter>

          <filter id="redAlertGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. RENDER BASE HEX TILES */}
        {tiles.map((tile: HexTile) => {
          let fill = 'url(#westBankTerrain)';
          let stroke = '#cfa03c';

          const isCandidateForBuild =
            state.isBuildMode &&
            tile.terrain === 'westbank' &&
            !tile.isLocalCity &&
            !tile.hasSettlement &&
            !state.constructions[tile.id];

          if (isCandidateForBuild) {
            fill = 'url(#buildCandidate)';
            stroke = '#b45309';
          } else if (tile.isLocalCity) {
            fill = 'url(#cityTerrain)';
            stroke = '#a17843';
          } else if (tile.terrain === 'israel') {
            fill = 'url(#israelTerrain)';
            stroke = '#6b9e45';
          } else if (tile.terrain === 'sea') {
            fill = 'url(#seaWater)';
            stroke = '#2f74a8';
          } else if (tile.label === 'ים המלח') {
            fill = 'url(#deadSea)';
            stroke = '#2b5f87';
          } else if (tile.terrain === 'border') {
            fill = tile.garrisonCount > 0 ? '#afd985' : '#ebd1b2';
            stroke = '#ba7b44';
          }

          return (
            <g
              key={tile.id}
              onClick={() => {
                if (isCandidateForBuild) {
                  dispatch({ type: 'SELECT_TILE_TO_BUILD', tileId: tile.id });
                }
              }}
              className={isCandidateForBuild ? 'cursor-pointer animate-pulse' : ''}
            >
              {/* Tile Base Shadow for 3D Bevel effect */}
              <polygon
                points={getHexPoints(tile.x, tile.y + 3, 36)}
                fill="rgba(0,0,0,0.12)"
              />

              {/* Top Hex Polygon */}
              <polygon
                points={getHexPoints(tile.x, tile.y, 36)}
                fill={fill}
                stroke={stroke}
                strokeWidth={isCandidateForBuild ? 3.5 : tile.isLocalCity ? 2.5 : 1.8}
                strokeDasharray={isCandidateForBuild ? '4,3' : 'none'}
                strokeLinejoin="round"
                className="transition-colors duration-300"
              />

              {/* ---------------- LOCAL WEST BANK CITIES / VILLAGES ---------------- */}
              {tile.isLocalCity && (
                <g transform={`translate(${tile.x}, ${tile.y})`} filter="url(#dropShadow)">
                  {/* City silhouette / Domes & Buildings */}
                  <g opacity="0.85" transform="translate(-12, -14)">
                    {/* Dwellings */}
                    <rect x="0" y="8" width="8" height="8" fill="#d4b483" stroke="#8a5e2f" strokeWidth="0.6" rx="0.5" />
                    <rect x="8" y="5" width="10" height="11" fill="#c49e68" stroke="#8a5e2f" strokeWidth="0.6" rx="0.5" />
                    <rect x="18" y="9" width="7" height="7" fill="#deb881" stroke="#8a5e2f" strokeWidth="0.6" rx="0.5" />
                    {/* Central Dome / Tower */}
                    <path d="M 10 5 Q 13 0 16 5 Z" fill="#b45309" stroke="#78350f" strokeWidth="0.6" />
                    <circle cx="13" cy="0" r="1" fill="#f59e0b" />
                  </g>

                  {/* City Label Banner */}
                  <g transform="translate(0, 10)">
                    <rect
                      x="-25"
                      y="-7"
                      width="50"
                      height="17"
                      rx="3.5"
                      fill="rgba(44, 30, 16, 0.85)"
                      stroke="rgba(245, 222, 179, 0.4)"
                      strokeWidth="0.8"
                    />
                    {/* Hebrew Name */}
                    <text
                      x="0"
                      y="1"
                      textAnchor="middle"
                      fill="#fff8e7"
                      fontSize="7.5"
                      fontWeight="900"
                      className="font-heebo pointer-events-none"
                    >
                      {tile.label}
                    </text>
                    {/* English/Arabic Sublabel */}
                    {tile.subLabel && (
                      <text
                        x="0"
                        y="8"
                        textAnchor="middle"
                        fill="#fde68a"
                        fontSize="5.5"
                        fontWeight="bold"
                        className="pointer-events-none"
                      >
                        {tile.subLabel}
                      </text>
                    )}
                  </g>
                </g>
              )}

              {/* Build Candidate Indicator (+100 ₪) */}
              {isCandidateForBuild && (
                <g transform={`translate(${tile.x}, ${tile.y})`}>
                  <circle cx="0" cy="0" r="14" fill="#f59e0b" stroke="#fff" strokeWidth="1.5" />
                  <text x="0" y="4" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="900">
                    +
                  </text>
                  <text x="0" y="22" textAnchor="middle" fill="#78350f" fontSize="8" fontWeight="bold">
                    100 ₪
                  </text>
                </g>
              )}

              {/* Organic 3D Trees scattered in Israel */}
              {tile.terrain === 'israel' && !tile.label && !isCandidateForBuild && (
                <g opacity="0.45" transform={`translate(${tile.x - 8}, ${tile.y - 12})`}>
                  <circle cx="4" cy="5" r="4.5" fill="#2d6a2d" />
                  <circle cx="4" cy="3.5" r="3" fill="#4ade80" />
                  <circle cx="12" cy="11" r="5" fill="#1b4d1b" />
                  <circle cx="12" cy="9.5" r="3.5" fill="#34d399" />
                </g>
              )}

              {/* Organic Rocks & Bushes in West Bank */}
              {tile.terrain === 'westbank' && !tile.isLocalCity && !tile.hasSettlement && !state.constructions[tile.id] && !isCandidateForBuild && (
                <g opacity="0.4" transform={`translate(${tile.x - 10}, ${tile.y - 8})`}>
                  <ellipse cx="6" cy="6" rx="5" ry="3" fill="#a17435" />
                  <ellipse cx="14" cy="10" rx="6" ry="4" fill="#8c5e23" />
                  <circle cx="10" cy="4" r="2.5" fill="#65a30d" />
                </g>
              )}

              {/* Sea Waves in Mediterranean */}
              {tile.terrain === 'sea' && (
                <path
                  d={`M ${tile.x - 15} ${tile.y - 4} Q ${tile.x} ${tile.y - 10} ${tile.x + 15} ${tile.y - 4} M ${tile.x - 12} ${tile.y + 8} Q ${tile.x} ${tile.y + 3} ${tile.x + 12} ${tile.y + 8}`}
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                />
              )}

              {/* Region or City Label */}
              {tile.label && !tile.isLocalCity && !isCandidateForBuild && (
                <text
                  x={tile.x}
                  y={tile.y + 4}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9.5"
                  fontWeight="bold"
                  className="pointer-events-none drop-shadow-md font-heebo"
                >
                  {tile.label}
                </text>
              )}
            </g>
          );
        })}

        {/* 2. UNDULATING GREEN LINE / BORDER BARRIER WITH DEPTH */}
        <path
          d="M 175 40 Q 170 95 170 130 T 165 205 T 160 280 T 155 355 T 155 430 Q 135 460 110 485 L 170 490"
          fill="none"
          stroke="rgba(0,0,0,0.2)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M 175 40 Q 170 95 170 130 T 165 205 T 160 280 T 155 355 T 155 430 Q 135 460 110 485 L 170 490"
          fill="none"
          stroke={state.defenseScore < 30 ? '#ef4444' : '#e04238'}
          strokeWidth="4"
          strokeDasharray={state.defenseScore < 50 ? '7,4' : 'none'}
          className={state.defenseScore < 30 ? 'animate-pulse' : ''}
          strokeLinecap="round"
        />

        {/* 3. BORDER CHECKPOINTS & WATCHTOWERS */}
        {tiles.filter(t => t.isBorderCheckpoint).map(cp => {
          const isManned = cp.garrisonCount > 0;
          const isIncomingWest = (state.movingTroops || []).some(
            t => t.fromX > t.toX && Math.hypot(t.toX - cp.x, t.toY - cp.y) < 18
          );
          return (
            <g key={`cp-${cp.id}`} transform={`translate(${cp.x}, ${cp.y})`}>
              {/* Incoming Reinforcement Target Beacon from West Bank */}
              {isIncomingWest && (
                <circle
                  cx="0"
                  cy="0"
                  r="23"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeDasharray="4,3"
                  className="animate-spin"
                />
              )}

              {isManned ? (
                // 3D Plastic Green Army Figurine standing on border pedestal
                <g filter="url(#dropShadow)">
                  <ellipse cx="0" cy="6" rx="14" ry="7" fill="rgba(34,197,94,0.3)" stroke="#22c55e" strokeWidth="1.5" />
                  <ellipse cx="0" cy="5" rx="9" ry="4.5" fill="#14532d" />
                  <rect x="-3" y="-1" width="2.5" height="6" fill="#166534" rx="1" />
                  <rect x="0.5" y="-1" width="2.5" height="6" fill="#166534" rx="1" />
                  <rect x="-4.5" y="-9" width="9" height="9" fill="#15803d" rx="2" />
                  <ellipse cx="0" cy="-12" rx="4.5" ry="3.5" fill="#14532d" />
                  <ellipse cx="0" cy="-11" rx="5" ry="1.5" fill="#166534" />
                </g>
              ) : (
                // Breach Emergency Klaxon
                <g filter="url(#redAlertGlow)" className="animate-bounce">
                  <circle cx="0" cy="0" r="15" fill="#ef4444" stroke="#ffffff" strokeWidth="2.5" />
                  <text x="0" y="5.5" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="900" className="font-rubik">
                    !
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* 4. UNDER CONSTRUCTION SITES (SCAFFOLDING & CRANE) */}
        {Object.entries(state.constructions).map(([tileId, c]) => {
          const t = state.tiles[tileId];
          if (!t) return null;
          return (
            <g key={`const-${tileId}`} transform={`translate(${t.x}, ${t.y})`} filter="url(#dropShadow)">
              <circle cx="0" cy="0" r="23" fill="rgba(245,158,11,0.15)" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,4" className="animate-spin" />
              <rect x="-10" y="-8" width="20" height="16" fill="none" stroke="#78350f" strokeWidth="1.5" />
              <line x1="-10" y1="-8" x2="10" y2="8" stroke="#78350f" strokeWidth="1" />
              <line x1="-10" y1="8" x2="10" y2="-8" stroke="#78350f" strokeWidth="1" />
              <rect x="-18" y="14" width="36" height="11" rx="3" fill="#1e293b" />
              <text x="0" y="22" textAnchor="middle" fill="#fef08a" fontSize="7" fontWeight="bold">
                {c.progress}% בבנייה
              </text>
            </g>
          );
        })}

        {/* 5. BUILT SETTLEMENTS (ROBUST CLICK TARGET + 3D ISOMETRIC HOUSE) */}
        {tiles.filter(t => t.hasSettlement).map(s => {
          const isGuarded = s.garrisonCount > 0;
          const isIncoming = (state.movingTroops || []).some(t => Math.hypot(t.toX - s.x, t.toY - s.y) < 10);
          return (
            <g
              key={`settlement-group-${s.id}`}
              transform={`translate(${s.x}, ${s.y})`}
              className="cursor-pointer group"
              onClick={(e) => {
                e.stopPropagation();
                dispatch({ type: 'SELECT_TILE', tileId: s.id });
              }}
            >
              {/* Generous Transparent Hit-Area Circle (ensures clicks never misfire!) */}
              <circle cx="0" cy="0" r="32" fill="transparent" pointerEvents="all" />

              {/* Incoming Reinforcement Target Ping */}
              {isIncoming && (
                <circle
                  cx="0"
                  cy="0"
                  r="27"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2"
                  strokeDasharray="4,3"
                  className="animate-spin"
                />
              )}

              {/* Red Dotted Security Perimeter */}
              <circle
                cx="0"
                cy="0"
                r="24"
                fill="rgba(239, 68, 68, 0.08)"
                stroke="#dc2626"
                strokeWidth="2"
                strokeDasharray="3,3"
                className="group-hover:stroke-width-3 transition-all"
              />

              {/* 3D Isometric Mediterranean House Model */}
              <g filter="url(#dropShadow)" transform="translate(-11, -12)">
                <ellipse cx="11" cy="20" rx="12" ry="5" fill="rgba(0,0,0,0.22)" />
                <rect x="2" y="9" width="18" height="11" fill="url(#wallGrad)" rx="1.5" stroke="#d5c3aa" strokeWidth="1" />
                <rect x="8" y="13" width="5" height="7" fill="#78350f" rx="0.5" />
                <rect x="3.5" y="11.5" width="3" height="3" fill="#60a5fa" stroke="#3b82f6" strokeWidth="0.5" />
                <rect x="14" y="2" width="2.5" height="5" fill="#991b1b" />
                <polygon points="0,9 11,0 22,9" fill="url(#roofGrad)" stroke="#9a3412" strokeWidth="1" />
              </g>

              {/* Garrisoned Guard or Warning */}
              {isGuarded ? (
                <g transform="translate(12, 6)">
                  <circle cx="0" cy="0" r="9" fill="#ffffff" stroke="#16a34a" strokeWidth="1.5" />
                  <circle cx="0" cy="-2.5" r="2.5" fill="#14532d" />
                  <path d="M -2.5 0.5 L 2.5 0.5 L 3 5.5 L -3 5.5 Z" fill="#15803d" />
                </g>
              ) : (
                <g transform="translate(12, 6)" className="animate-bounce">
                  <circle cx="0" cy="0" r="8" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
                  <text x="0" y="3" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">!</text>
                </g>
              )}

              {/* Settlement Name Tag */}
              {s.settlementName && (
                <g transform="translate(0, 24)">
                  <rect
                    x="-26"
                    y="-7"
                    width="52"
                    height="14"
                    rx="4"
                    fill="rgba(24, 24, 27, 0.85)"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="0.8"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="7.5"
                    fontWeight="bold"
                    className="font-heebo pointer-events-none"
                  >
                    {s.settlementName}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* 6. COLLECTIBLE COINS FLOATING OVER ISRAEL CITIES */}
        {state.collectibleCoins.map(coin => (
          <g
            key={coin.id}
            transform={`translate(${coin.x}, ${coin.y})`}
            onClick={(e) => {
              e.stopPropagation();
              dispatch({ type: 'COLLECT_COIN', id: coin.id });
            }}
            className="cursor-pointer animate-bounce"
          >
            <circle cx="0" cy="0" r="20" fill="transparent" />
            <circle cx="0" cy="0" r="11" fill="url(#coinGrad)" stroke="#a16207" strokeWidth="1.5" filter="url(#dropShadow)" />
            <circle cx="0" cy="0" r="8.5" fill="none" stroke="#fff" strokeWidth="0.8" opacity="0.6" />
            <text x="0" y="4" textAnchor="middle" fill="#713f12" fontSize="9" fontWeight="900" className="font-rubik">
              ₪
            </text>
            <text x="0" y="-14" textAnchor="middle" fill="#facc15" fontSize="8" fontWeight="bold" className="drop-shadow-sm font-heebo">
              +25
            </text>
          </g>
        ))}

        {/* 7. INFILTRATING ENEMY TRUCKS */}
        {state.infiltratingTrucks.map(truck => {
          const currentX = truck.x + (truck.targetX - truck.x) * truck.progress;
          const currentY = truck.y + (truck.targetY - truck.y) * truck.progress;

          return (
            <g key={truck.id} transform={`translate(${currentX}, ${currentY})`} filter="url(#dropShadow)">
              <circle cx="10" cy="3" r="5" fill="rgba(217, 119, 6, 0.4)" />
              <circle cx="18" cy="4" r="3" fill="rgba(217, 119, 6, 0.25)" />
              <rect x="-11" y="-5" width="22" height="10" fill="#f8fafc" rx="2" stroke="#334155" strokeWidth="1" />
              <rect x="-10" y="-3" width="7" height="6" fill="#94a3b8" rx="1" />
              <circle cx="4" cy="-8" r="3" fill="#dc2626" />
              <rect x="3" y="-5" width="2.5" height="5" fill="#991b1b" />
              <line x1="8" y1="-12" x2="8" y2="-5" stroke="#475569" strokeWidth="1" />
              <polygon points="8,-12 14,-10 8,-8" fill="#ef4444" />
              <circle cx="-6" cy="6" r="2.5" fill="#0f172a" />
              <circle cx="6" cy="6" r="2.5" fill="#0f172a" />
            </g>
          );
        })}

        {/* 8. TROOPS ACTIVELY MOVING (BOTH LEFT-TO-RIGHT AND RIGHT-TO-LEFT) */}
        {(state.movingTroops || []).map(troop => {
          const isMovingWest = troop.fromX > troop.toX; // Right to Left (recalled to sovereign border)
          const midX = (troop.fromX + troop.toX) / 2;
          const midY = Math.min(troop.fromY, troop.toY) - 30;
          const pathD = `M ${troop.fromX} ${troop.fromY} Q ${midX} ${midY} ${troop.toX} ${troop.toY}`;

          const trajectoryColor = isMovingWest ? '#3b82f6' : '#22c55e';
          const auraColor = isMovingWest ? 'rgba(59, 130, 246, 0.45)' : 'rgba(34, 197, 94, 0.4)';
          const auraBorder = isMovingWest ? '#2563eb' : '#16a34a';

          return (
            <g key={troop.id} className="pointer-events-none">
              {/* Flight / Leap Trajectory Arc */}
              <path
                d={pathD}
                fill="none"
                stroke={trajectoryColor}
                strokeWidth={isMovingWest ? '3' : '2.5'}
                strokeDasharray="5,3"
                strokeLinecap="round"
                className="animate-pulse"
                opacity="0.9"
              />

              {/* Moving Army Figurine leaping along the trajectory arc */}
              <g filter="url(#dropShadow)">
                <animateMotion
                  path={pathD}
                  dur="0.8s"
                  fill="freeze"
                  repeatCount="1"
                />
                {/* Glowing Radar Aura */}
                <circle cx="0" cy="0" r="14" fill={auraColor} stroke={auraBorder} strokeWidth="1.5" />
                {/* 3D Figurine Model facing the movement direction */}
                <g transform={`translate(0, 3) scale(${isMovingWest ? -1.15 : 1.15}, 1.15)`}>
                  <ellipse cx="0" cy="4" rx="7" ry="3.5" fill="#14532d" />
                  <rect x="-2" y="-1" width="1.8" height="4.5" fill="#166534" rx="0.8" />
                  <rect x="0.5" y="-1" width="1.8" height="4.5" fill="#166534" rx="0.8" />
                  <rect x="-3.5" y="-7.5" width="7" height="7" fill={isMovingWest ? '#1d4ed8' : '#15803d'} rx="1.5" />
                  <ellipse cx="0" cy="-9.5" rx="3" ry="2.5" fill="#14532d" />
                  <ellipse cx="0" cy="-8.5" rx="3.8" ry="1" fill="#166534" />
                </g>
              </g>
            </g>
          );
        })}

        {/* Region Geographic Titles */}
        <text
          x="100"
          y="545"
          textAnchor="middle"
          fill="#274608"
          fontSize="16"
          fontWeight="900"
          opacity="0.85"
          className="font-rubik pointer-events-none drop-shadow-sm"
        >
          {state.locale === 'he' ? 'ישראל' : 'ISRAEL'}
        </text>

        <text
          x="320"
          y="545"
          textAnchor="middle"
          fill="#612805"
          fontSize="16"
          fontWeight="900"
          opacity="0.85"
          className="font-rubik pointer-events-none drop-shadow-sm"
        >
          {state.locale === 'he' ? 'הגדה המערבית' : 'WEST BANK'}
        </text>
      </svg>
    </div>
  );
};
