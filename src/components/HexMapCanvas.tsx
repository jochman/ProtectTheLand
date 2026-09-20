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

  // Auto-clear clashes once their duration completes
  React.useEffect(() => {
    if (!state.clashes || state.clashes.length === 0) return;
    const now = Date.now();
    const timers = state.clashes.map(clash => {
      const remaining = Math.max(100, clash.durationMs - (now - clash.createdAt));
      return setTimeout(() => {
        dispatch({ type: 'CLEAR_CLASH', id: clash.id });
      }, remaining);
    });
    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, [state.clashes, dispatch]);

  return (
    <div className="relative w-full flex-1 min-h-[220px] max-h-full overflow-hidden flex items-center justify-center my-0 select-none">
      <svg
        viewBox="0 0 460 565"
        className="w-full h-full drop-shadow-xl"
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

              {/* Region or City Label & Green Side Attack Alert / Damage Indicator */}
              {tile.label && !tile.isLocalCity && !isCandidateForBuild && (
                <g>
                  {/* 1. Active Incoming Infiltration Threat (en route) */}
                  {(state.greenSideAttacks || []).some(a => a.targetCityId === tile.id) && (() => {
                    const relatedAttack = (state.greenSideAttacks || []).find(a => a.targetCityId === tile.id);
                    return (
                      <g
                        transform={`translate(${tile.x}, ${tile.y})`}
                        className="cursor-pointer group"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (relatedAttack) {
                            dispatch({ type: 'SELECT_INFILTRATION', id: relatedAttack.id });
                          } else if ((state.greenSideAttacks || []).length > 0) {
                            dispatch({ type: 'SELECT_INFILTRATION', id: state.greenSideAttacks[0].id });
                          }
                        }}
                      >
                        <circle cx="0" cy="0" r="24" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 3" className="animate-pulse" />
                        <g transform="translate(0, -18)" filter="url(#dropShadow)">
                          <rect x="-35" y="-6.5" width="70" height="13" rx="4" fill="#dc2626" stroke="#fca5a5" strokeWidth="1" />
                          <text x="0" y="2.5" textAnchor="middle" fill="#fff" fontSize="6.5" fontWeight="900" className="font-rubik">
                            {state.locale === 'he' ? '🚨 חדירה בדרך! (בלימה)' : '🚨 Raid Inbound! (Defend)'}
                          </text>
                        </g>
                      </g>
                    );
                  })()}

                  {/* 2. Post-Impact Aftermath (After squad hits: "חדירה!" is removed, replaced by 💥 פגיעה בעורף for 6s) */}
                  {Boolean(tile.damagedUntil && Date.now() < tile.damagedUntil) && !(state.greenSideAttacks || []).some(a => a.targetCityId === tile.id) && (
                    <g transform={`translate(${tile.x}, ${tile.y})`}>
                      <circle cx="0" cy="0" r="22" fill="rgba(185, 28, 28, 0.25)" stroke="#b91c1c" strokeWidth="1.5" />
                      {/* Rising smoke/ember particles */}
                      <g transform="translate(0, -10)" opacity="0.85">
                        <circle cx="-5" cy="-2" r="3" fill="#64748b" className="animate-ping" style={{ animationDuration: '2.4s' }} />
                        <circle cx="4" cy="-5" r="4" fill="#475569" className="animate-pulse" />
                        <circle cx="-1" cy="-8" r="2" fill="#ef4444" opacity="0.75" />
                      </g>
                      <g transform="translate(0, -18)" filter="url(#dropShadow)">
                        <rect x="-36" y="-6.5" width="72" height="13" rx="4" fill="#7f1d1d" stroke="#fca5a5" strokeWidth="1" />
                        <text x="0" y="2.5" textAnchor="middle" fill="#fee2e2" fontSize="6.5" fontWeight="900" className="font-rubik">
                          {state.locale === 'he' ? '💥 פגיעה בעורף (-25₪)' : '💥 Struck! (-25₪)'}
                        </text>
                      </g>
                    </g>
                  )}
                  {tile.label.includes(' / ') ? (
                    <text
                      x={tile.x}
                      y={tile.y - 1}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="8"
                      fontWeight="bold"
                      className="pointer-events-none drop-shadow-md font-heebo"
                    >
                      <tspan x={tile.x} dy="0">{tile.label.split(' / ')[0]}</tspan>
                      <tspan x={tile.x} dy="9.5" fontSize="7" opacity="0.9">{tile.label.split(' / ')[1]}</tspan>
                    </text>
                  ) : tile.label === 'באר שבע והנגב' ? (
                    <text
                      x={tile.x}
                      y={tile.y - 1}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="8"
                      fontWeight="bold"
                      className="pointer-events-none drop-shadow-md font-heebo"
                    >
                      <tspan x={tile.x} dy="0">באר שבע</tspan>
                      <tspan x={tile.x} dy="9.5" fontSize="7" opacity="0.9">והנגב</tspan>
                    </text>
                  ) : tile.label === 'חיפה והצפון' ? (
                    <text
                      x={tile.x}
                      y={tile.y - 1}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="8"
                      fontWeight="bold"
                      className="pointer-events-none drop-shadow-md font-heebo"
                    >
                      <tspan x={tile.x} dy="0">חיפה</tspan>
                      <tspan x={tile.x} dy="9.5" fontSize="7" opacity="0.9">והצפון</tspan>
                    </text>
                  ) : (
                    <text
                      x={tile.x}
                      y={tile.y + 4}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      className="pointer-events-none drop-shadow-md font-heebo"
                    >
                      {tile.label}
                    </text>
                  )}
                </g>
              )}
            </g>
          );
        })}

        {/* 2. UNDULATING GREEN LINE / BORDER BARRIER WITH DEPTH */}
        <path
          d="M 175 40 Q 170 95 170 130 T 165 205 T 160 280 T 155 355 T 155 430 Q 165 465 170 490 L 110 485"
          fill="none"
          stroke="rgba(0,0,0,0.2)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M 175 40 Q 170 95 170 130 T 165 205 T 160 280 T 155 355 T 155 430 Q 165 465 170 490 L 110 485"
          fill="none"
          stroke={state.defenseScore <= 25 ? '#ef4444' : state.defenseScore < 50 ? '#f59e0b' : '#e04238'}
          strokeWidth={state.defenseScore <= 25 ? 5 : 4}
          strokeDasharray={state.defenseScore <= 25 ? '4,5' : state.defenseScore < 50 ? '8,4' : 'none'}
          className={state.defenseScore <= 25 ? 'animate-pulse' : ''}
          strokeLinecap="round"
        />
        {/* Critical Perimeter Collapse Warning Sparks along the Green Line */}
        {state.defenseScore <= 25 && (
          <g className="animate-pulse pointer-events-none">
            {[
              { x: 172, y: 110 },
              { x: 163, y: 240 },
              { x: 155, y: 390 },
            ].map((spark, idx) => (
              <g key={`border-spark-${idx}`} transform={`translate(${spark.x}, ${spark.y})`}>
                <circle cx="0" cy="0" r="7" fill="rgba(239, 68, 68, 0.25)" />
                <circle cx="0" cy="0" r="3" fill="#ef4444" />
                <line x1="-5" y1="-5" x2="5" y2="5" stroke="#fca5a5" strokeWidth="1.2" />
                <line x1="-5" y1="5" x2="5" y2="-5" stroke="#fca5a5" strokeWidth="1.2" />
              </g>
            ))}
          </g>
        )}

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
                  <ellipse cx="0" cy="7" rx="13" ry="6" fill="rgba(22, 101, 52, 0.4)" stroke="#16a34a" strokeWidth="1" />
                  <ellipse cx="-2.5" cy="5" rx="2.5" ry="1.8" fill="#0f172a" />
                  <ellipse cx="2.5" cy="5" rx="2.5" ry="1.8" fill="#0f172a" />
                  <rect x="-3.5" y="-1" width="3" height="6" fill="#3f6212" rx="1" />
                  <rect x="0.5" y="-1" width="3" height="6" fill="#3f6212" rx="1" />
                  <rect x="-5" y="-9" width="10" height="9" fill="#4d7c0f" rx="2" stroke="#365314" strokeWidth="0.6" />
                  <rect x="-3.5" y="-8" width="7" height="6" fill="#65a30d" rx="1" />
                  <ellipse cx="0" cy="-12" rx="5" ry="4" fill="#365314" />
                  <ellipse cx="0" cy="-11" rx="5.2" ry="1.8" fill="#4d7c0f" />
                  <line x1="3" y1="-14" x2="4" y2="-17" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" />
                </g>
              ) : (
                // Tactical unmanned checkpoint: roadblock barrier with open boom gate (clickable to seal breach!)
                <g
                  filter="url(#dropShadow)"
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    const relatedAttack = (state.greenSideAttacks || []).find(a => a.breachId === cp.id);
                    if (relatedAttack) {
                      dispatch({ type: 'SELECT_INFILTRATION', id: relatedAttack.id });
                    } else if ((state.greenSideAttacks || []).length > 0) {
                      dispatch({ type: 'SELECT_INFILTRATION', id: state.greenSideAttacks[0].id });
                    } else if (state.reservesBatchesLeft > 0) {
                      dispatch({ type: 'CALL_RESERVES' });
                    }
                  }}
                >
                  {/* Empty post ground footprint */}
                  <ellipse cx="0" cy="6" rx="13" ry="6.5" fill="rgba(239, 68, 68, 0.15)" stroke="#f87171" strokeWidth="1.2" strokeDasharray="3 2" className="animate-pulse" />
                  
                  {/* Road concrete barrier */}
                  <rect x="-9" y="1" width="18" height="5.5" rx="1.5" fill="#475569" stroke="#334155" strokeWidth="0.8" />
                  <line x1="-6" y1="2" x2="-3" y2="5.5" stroke="#f59e0b" strokeWidth="1.2" />
                  <line x1="-1" y1="2" x2="2" y2="5.5" stroke="#f59e0b" strokeWidth="1.2" />
                  <line x1="4" y1="2" x2="7" y2="5.5" stroke="#f59e0b" strokeWidth="1.2" />

                  {/* Barrier post & lifted gate pole */}
                  <rect x="-8" y="-7" width="3" height="9" rx="0.8" fill="#334155" />
                  <line x1="-6.5" y1="-5" x2="8" y2="-12" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 2" />

                  {/* Indicator dot */}
                  <circle cx="0" cy="-5" r="3" fill="#ef4444" opacity="0.9" />

                  {/* Tooltip prompt on breach */}
                  <g transform="translate(0, -18)">
                    <rect x="-24" y="-5.5" width="48" height="11" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#ef4444" strokeWidth="0.8" />
                    <text x="0" y="2.2" textAnchor="middle" fill="#fca5a5" fontSize="5.5" fontWeight="900" className="font-rubik">
                      ⚠️ פרצה (לחץ לבלימה)
                    </text>
                  </g>
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

              {/* Unprotected Settlement HP Bar */}
              {!isGuarded && (
                <g transform="translate(0, -22)" filter="url(#dropShadow)">
                  <rect x="-17" y="-3" width="34" height="6.5" rx="3.2" fill="rgba(15, 23, 42, 0.92)" stroke="#475569" strokeWidth="0.8" />
                  <rect
                    x="-16"
                    y="-2"
                    width={Math.max(2, (((s.hp ?? 100) / 100) * 32))}
                    height="4.5"
                    rx="2.2"
                    fill={(s.hp ?? 100) > 60 ? '#22c55e' : (s.hp ?? 100) > 30 ? '#f59e0b' : '#ef4444'}
                    className={(s.hp ?? 100) <= 30 ? 'animate-pulse' : ''}
                  />
                  <text x="0" y="1.8" textAnchor="middle" fill="#ffffff" fontSize="5.5" fontWeight="900" className="font-rubik select-none">
                    {s.hp ?? 100}% HP
                  </text>
                </g>
              )}

              {/* Garrisoned Guard or Warning */}
              {isGuarded ? (
                <g transform="translate(12, 6)">
                  <circle cx="0" cy="0" r="9" fill="#ffffff" stroke="#16a34a" strokeWidth="1.5" />
                  <circle cx="0" cy="-2.5" r="2.5" fill="#14532d" />
                  <path d="M -2.5 0.5 L 2.5 0.5 L 3 5.5 L -3 5.5 Z" fill="#15803d" />
                  {/* Miniature IDF Shield Badge */}
                  <g transform="translate(5, -7)">
                    <path d="M 0 0 L 4 2 L 4 6 Q 4 9 0 11 Q -4 9 -4 6 L -4 2 Z" fill="#2563eb" stroke="#ffffff" strokeWidth="0.8" />
                    <text x="0" y="6" textAnchor="middle" fill="#ffffff" fontSize="4.5" fontWeight="900">✡</text>
                  </g>
                  {/* Active outpost repair / healing status */}
                  {(s.hp ?? 100) < 100 && (
                    <g transform="translate(-14, -8)">
                      <rect x="-8" y="-4" width="16" height="8" rx="2.5" fill="#15803d" stroke="#86efac" strokeWidth="0.6" />
                      <text x="0" y="2" textAnchor="middle" fill="#86efac" fontSize="5" fontWeight="900" className="font-rubik">+5 HP</text>
                    </g>
                  )}
                </g>
              ) : (
                // Empty garrison badge: subtle dashed outline with guard silhouette (no bouncing, calm)
                <g transform="translate(12, 6)" opacity="0.9">
                  <circle cx="0" cy="0" r="8" fill="#fef2f2" stroke="#fca5a5" strokeWidth="1.2" strokeDasharray="2.5 2" />
                  <circle cx="0" cy="-2" r="2" fill="#ef4444" opacity="0.6" />
                  <path d="M -2 0.8 L 2 0.8 L 2.2 4 L -2.2 4 Z" fill="#ef4444" opacity="0.5" />
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

        {/* 6. COLLECTIBLE COINS FLOATING OVER ISRAELI CITIES */}
        {state.collectibleCoins.map(coin => (
          <g
            key={coin.id}
            transform={`translate(${coin.x}, ${coin.y})`}
            onClick={(e) => {
              e.stopPropagation();
              dispatch({ type: 'COLLECT_COIN', id: coin.id });
            }}
            className="cursor-pointer group"
            style={{ cursor: 'pointer' }}
          >
            {/* Inner bobbing animation group that does not clobber SVG translate */}
            <g>
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0; 0,-7; 0,0"
                dur="1.6s"
                repeatCount="indefinite"
              />

              {/* Generous Hitbox with pointerEvents="all" for effortless clicking */}
              <circle cx="0" cy="0" r="30" fill="rgba(0,0,0,0.001)" pointerEvents="all" />

              {/* Golden Outer Radiant Halo */}
              <circle cx="0" cy="0" r="18" fill="rgba(250, 204, 21, 0.3)" />
              <circle cx="0" cy="0" r="14" fill="rgba(253, 224, 71, 0.45)" />

              {/* 3D Shiny Gold Shekel Coin */}
              <circle
                cx="0"
                cy="0"
                r="13"
                fill="url(#coinGrad)"
                stroke="#b45309"
                strokeWidth="2"
                filter="url(#dropShadow)"
              />
              <circle cx="0" cy="0" r="10.5" fill="none" stroke="#fef08a" strokeWidth="1.2" opacity="0.85" />
              <text
                x="0"
                y="4.5"
                textAnchor="middle"
                fill="#713f12"
                fontSize="11"
                fontWeight="900"
                className="font-rubik select-none pointer-events-none"
              >
                ₪
              </text>

              {/* Amount Badge Above Coin */}
              <g transform="translate(0, -17)" filter="url(#dropShadow)">
                <rect x="-18" y="-6" width="36" height="12" rx="4" fill="rgba(15, 23, 42, 0.95)" stroke="#facc15" strokeWidth="1" />
                <text
                  x="0"
                  y="2.8"
                  textAnchor="middle"
                  fill="#facc15"
                  fontSize="7.5"
                  fontWeight="900"
                  className="font-rubik select-none pointer-events-none"
                >
                  +{coin.amount || 30}₪
                </text>
              </g>
            </g>
          </g>
        ))}

        {/* 7. GREEN SIDE ATTACKS VIA BORDER DEFENSE LINE HOLES */}
        {(state.greenSideAttacks || []).map(attack => {
          const currentX = attack.startX + (attack.targetX - attack.startX) * attack.progress;
          const currentY = attack.startY + (attack.targetY - attack.startY) * attack.progress;

          return (
            <g key={attack.id}>
              {/* Red threat vector connecting border breach hole to green side city */}
              <line
                x1={attack.startX}
                y1={attack.startY}
                x2={attack.targetX}
                y2={attack.targetY}
                stroke="#dc2626"
                strokeWidth="2.5"
                strokeDasharray="4 3"
                opacity="0.75"
              />

              {/* Moving Hostile Raider Vehicle with Flag and Dust Trail */}
              <g
                transform={`translate(${currentX}, ${currentY})`}
                filter="url(#dropShadow)"
                className="cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: 'SELECT_INFILTRATION', id: attack.id });
                }}
              >
                <circle cx="10" cy="3" r="5" fill="rgba(217, 119, 6, 0.4)" />
                <circle cx="18" cy="4" r="3" fill="rgba(217, 119, 6, 0.25)" />
                <rect x="-11" y="-5" width="22" height="10" fill="#1e293b" rx="2" stroke="#dc2626" strokeWidth="1" />
                <rect x="-10" y="-3" width="7" height="6" fill="#64748b" rx="1" />
                <circle cx="4" cy="-8" r="3" fill="#dc2626" />
                <rect x="3" y="-5" width="2.5" height="5" fill="#991b1b" />
                <line x1="8" y1="-12" x2="8" y2="-5" stroke="#475569" strokeWidth="1" />
                <polygon points="8,-12 14,-10 8,-8" fill="#ef4444" />
                <circle cx="-6" cy="6" r="2.5" fill="#020617" />
                <circle cx="6" cy="6" r="2.5" fill="#020617" />

                {/* Target City Label Badge */}
                <g transform="translate(0, -17)">
                  <rect x="-30" y="-6.5" width="60" height="13" rx="3.5" fill="rgba(153, 27, 27, 0.95)" stroke="#fca5a5" strokeWidth="0.8" />
                  <text x="0" y="2.5" textAnchor="middle" fill="#ffffff" fontSize="5.5" fontWeight="900" className="font-rubik select-none">
                    🎯 חדירה: {attack.targetCityName} (לחץ)
                  </text>
                </g>
              </g>
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

        {/* 9. WEST BANK RANDOM CLASHES (עימותים הדדיים) */}
        {(state.clashes || []).map(clash => {
          const { startX, startY, targetX, targetY, midX, midY, isGarrisoned } = clash;
          const dx = targetX - startX;
          const dy = targetY - startY;

          // Position groups at ~28% from their respective origin toward the middle
          const settlerX = startX + dx * 0.28;
          const settlerY = startY + dy * 0.28;
          const arabX = startX + dx * 0.72;
          const arabY = startY + dy * 0.72;

          // Parabolic rock flight arcs between the two opposing groups
          const arcSettlerToArab = `M ${settlerX} ${settlerY} Q ${midX} ${midY - 24} ${arabX} ${arabY}`;
          const arcArabToSettler = `M ${arabX} ${arabY} Q ${midX} ${midY - 20} ${settlerX} ${settlerY}`;

          return (
            <g key={clash.id} className="pointer-events-none select-none">
              {/* Dotted Tension Friction Line */}
              <line
                x1={startX}
                y1={startY}
                x2={targetX}
                y2={targetY}
                stroke="#dc2626"
                strokeWidth="2"
                strokeDasharray="4 3"
                opacity="0.6"
                className="animate-pulse"
              />

              {/* Group 1: Settlers / Hilltop Youth (מתנחלים ונוער גבעות) */}
              <g transform={`translate(${settlerX}, ${settlerY})`} filter="url(#dropShadow)">
                {/* Friction indicator circle */}
                <circle cx="0" cy="0" r="13" fill="rgba(245, 158, 11, 0.35)" stroke="#d97706" strokeWidth="1.5" />
                
                {/* Settler Avatar Figure 1 */}
                <g transform="translate(-3.5, -2) scale(0.95)">
                  {/* Knitted Kippah (White & Gold) */}
                  <ellipse cx="0" cy="-9" rx="3.5" ry="2" fill="#f59e0b" stroke="#78350f" strokeWidth="0.8" />
                  {/* Head */}
                  <circle cx="0" cy="-7" r="3.2" fill="#fed7aa" />
                  {/* White Tzitziot Shirt */}
                  <rect x="-3.5" y="-3.5" width="7" height="6.5" fill="#f8fafc" stroke="#475569" strokeWidth="0.8" rx="1" />
                  {/* Arm holding a wooden stick / stone */}
                  <line x1="3" y1="-2" x2="8" y2="-7" stroke="#78350f" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="8" cy="-7" r="1.8" fill="#78716c" />
                </g>

                {/* Settler Avatar Figure 2 (waving flag / stone) */}
                <g transform="translate(3.5, 2) scale(0.85)">
                  <ellipse cx="0" cy="-9" rx="3.2" ry="1.8" fill="#ea580c" />
                  <circle cx="0" cy="-7" r="3" fill="#fed7aa" />
                  <rect x="-3" y="-3.5" width="6" height="6" fill="#f8fafc" stroke="#0284c7" strokeWidth="0.8" rx="1" />
                  {/* Mini Israeli Flag / Ribbon */}
                  <line x1="2.5" y1="-2" x2="6" y2="-9" stroke="#475569" strokeWidth="1.2" />
                  <polygon points="6,-9 11,-7.5 6,-6" fill="#0284c7" />
                </g>

                {/* Settler Side Mini Tag */}
                <text x="0" y="16" textAnchor="middle" fontSize="7.5" fontWeight="900" fill="#78350f" className="font-rubik">
                  {clash.settlementName}
                </text>
              </g>

              {/* Group 2: Palestinian Village Residents / Youth (תושבי הכפר והצעירים) */}
              <g transform={`translate(${arabX}, ${arabY})`} filter="url(#dropShadow)">
                {/* Friction indicator circle */}
                <circle cx="0" cy="0" r="13" fill="rgba(220, 38, 38, 0.35)" stroke="#b91c1c" strokeWidth="1.5" />

                {/* Arab Avatar Figure 1 */}
                <g transform="translate(3.5, -2) scale(0.95)">
                  {/* Keffiyeh Pattern Headwrap (Black/White checkered) */}
                  <ellipse cx="0" cy="-8.5" rx="4.2" ry="2.6" fill="#18181b" stroke="#f4f4f5" strokeWidth="0.8" />
                  <circle cx="0" cy="-6.5" r="3" fill="#fed7aa" />
                  {/* Dark Hoodie */}
                  <rect x="-3.5" y="-3.5" width="7" height="6.5" fill="#166534" stroke="#14532d" strokeWidth="0.8" rx="1" />
                  {/* Slingshot arm */}
                  <line x1="-3" y1="-2" x2="-8" y2="-7" stroke="#1c1917" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="-8" cy="-7" r="2" fill="#57534e" />
                </g>

                {/* Arab Avatar Figure 2 */}
                <g transform="translate(-3.5, 2) scale(0.85)">
                  <ellipse cx="0" cy="-8.5" rx="4" ry="2.4" fill="#dc2626" />
                  <circle cx="0" cy="-6.5" r="3" fill="#fed7aa" />
                  <rect x="-3" y="-3.5" width="6" height="6" fill="#18181b" stroke="#27272a" strokeWidth="0.8" rx="1" />
                  {/* Raising stone */}
                  <circle cx="-6" cy="-8" r="2.2" fill="#78716c" />
                </g>

                {/* Arab Side Mini Tag */}
                <text x="0" y="16" textAnchor="middle" fontSize="7.5" fontWeight="900" fill="#991b1b" className="font-rubik">
                  {clash.arabCityName}
                </text>
              </g>

              {/* Midpoint Clash Battle Hotspot (החיכוך במרכז) */}
              <g transform={`translate(${midX}, ${midY})`}>
                {/* Soft shockwave ring (calm, non-pinging) */}
                <circle cx="0" cy="0" r="16" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="1.5" opacity="0.8" />
                <circle cx="0" cy="0" r="22" fill="rgba(245, 158, 11, 0.15)" stroke="#f59e0b" strokeWidth="1.2" />

                {/* Smoke / Dust cloud puffs */}
                <ellipse cx="-6" cy="-5" rx="8" ry="5" fill="#cbd5e1" opacity="0.6" />
                <ellipse cx="7" cy="-7" rx="9" ry="6" fill="#94a3b8" opacity="0.55" />
                <ellipse cx="0" cy="4" rx="10" ry="5" fill="#cbd5e1" opacity="0.5" />

                {/* Impact explosion icon (steady, calm) */}
                <text x="0" y="6" textAnchor="middle" fontSize="16" className="select-none">
                  💥
                </text>

                {/* Fire & Smoke particles */}
                <text x="-11" y="-7" fontSize="12">🔥</text>
                <text x="9" y="-9" fontSize="12" opacity="0.85">💨</text>

                {/* Presence of Army Separation vs Unprotected Outpost */}
                {isGarrisoned ? (
                  <g transform="translate(0, 18)">
                    <rect x="-32" y="-7" width="64" height="13" rx="6.5" fill="#15803d" stroke="#86efac" strokeWidth="1" filter="url(#dropShadow)" />
                    <text x="0" y="2.5" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="900" className="font-rubik">
                      🛡️ צה״ל מפריד
                    </text>
                  </g>
                ) : (
                  <g transform="translate(0, 18)">
                    <rect x="-36" y="-7" width="72" height="13" rx="6.5" fill="#b91c1c" stroke="#fca5a5" strokeWidth="1" className="animate-pulse" filter="url(#dropShadow)" />
                    <text x="0" y="2.5" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="900" className="font-rubik">
                      ⚠️ ללא אבטחה!
                    </text>
                  </g>
                )}
              </g>

              {/* Parabolic Flying Stones Animation (יידויי אבנים הדדיים!) */}
              {/* Stone 1: Settlers -> Arab Side */}
              <g>
                <animateMotion
                  path={arcSettlerToArab}
                  dur="0.75s"
                  repeatCount="indefinite"
                />
                <circle cx="0" cy="0" r="3.2" fill="#44403c" stroke="#1c1917" strokeWidth="0.8" />
                <circle cx="-0.8" cy="-0.8" r="1" fill="#a8a29e" />
              </g>

              {/* Stone 2: Arab Side -> Settlers */}
              <g>
                <animateMotion
                  path={arcArabToSettler}
                  dur="0.85s"
                  begin="0.32s"
                  repeatCount="indefinite"
                />
                <circle cx="0" cy="0" r="3.2" fill="#57534e" stroke="#292524" strokeWidth="0.8" />
                <circle cx="-0.8" cy="-0.8" r="1" fill="#d6d3d1" />
              </g>

              {/* Floating Tactical Banner above the clash */}
              <g transform={`translate(${midX}, ${midY - 32})`} filter="url(#dropShadow)">
                <rect
                  x="-55"
                  y="-10"
                  width="110"
                  height="18"
                  rx="9"
                  fill="#991b1b"
                  stroke="#fef08a"
                  strokeWidth="1.5"
                  className="animate-pulse"
                />
                <text
                  x="0"
                  y="2.5"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="8"
                  fontWeight="900"
                  className="font-rubik"
                >
                  {clash.title}
                </text>
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
