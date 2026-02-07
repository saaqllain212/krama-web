// src/components/companions/visuals/GuardianTree.tsx
// Animated SVG tree that evolves through 5 stages

'use client'

import { GuardianStage } from '@/lib/companions/companionLogic'

interface GuardianTreeProps {
  stage: GuardianStage
  health: number // 0-100
  animated?: boolean
}

export default function GuardianTree({ stage, health, animated = true }: GuardianTreeProps) {
  // Health-based color adjustments
  const getHealthColor = () => {
    if (health >= 80) return { leaves: '#22c55e', glow: '#86efac' } // Vibrant green
    if (health >= 50) return { leaves: '#4ade80', glow: '#86efac' } // Normal green
    if (health >= 20) return { leaves: '#a3a3a3', glow: '#d4d4d4' } // Wilting gray-green
    return { leaves: '#78716c', glow: '#a8a29e' } // Nearly dead brown
  }

  const colors = getHealthColor()
  const glowIntensity = health / 100

  // Stage-specific rendering
  switch (stage) {
    case 0: // Dormant Seed
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full">
          <defs>
            <radialGradient id="seedGlow">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity={glowIntensity * 0.6} />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
            </radialGradient>
          </defs>
          
          {/* Glow */}
          {animated && (
            <circle cx="40" cy="40" r="25" fill="url(#seedGlow)">
              <animate attributeName="r" values="25;28;25" dur="3s" repeatCount="indefinite" />
            </circle>
          )}
          
          {/* Seed */}
          <ellipse cx="40" cy="40" rx="12" ry="15" fill="#78716c" />
          <ellipse cx="40" cy="40" rx="10" ry="13" fill="#a8a29e" />
          
          {/* Crack (if health > 30) */}
          {health > 30 && (
            <path
              d="M 40 30 Q 42 35, 40 40 Q 38 45, 40 50"
              stroke="#44403c"
              strokeWidth="1"
              fill="none"
              opacity="0.5"
            />
          )}
        </svg>
      )

    case 1: // Sprout
      return (
        <svg viewBox="0 0 100 120" className="w-full h-full">
          <defs>
            <linearGradient id="stemGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="100%" stopColor={colors.leaves} />
            </linearGradient>
          </defs>
          
          {/* Soil */}
          <ellipse cx="50" cy="100" rx="30" ry="8" fill="#78716c" opacity="0.3" />
          
          {/* Stem */}
          <path
            d="M 50 100 Q 48 80, 50 60"
            stroke="url(#stemGradient)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          >
            {animated && (
              <animate attributeName="d" 
                values="M 50 100 Q 48 80, 50 60; M 50 100 Q 52 80, 50 60; M 50 100 Q 48 80, 50 60" 
                dur="4s" 
                repeatCount="indefinite" 
              />
            )}
          </path>
          
          {/* Leaves */}
          <ellipse cx="45" cy="65" rx="8" ry="12" fill={colors.leaves} opacity="0.9">
            {animated && (
              <animateTransform 
                attributeName="transform"
                type="rotate"
                values="0 45 65; -5 45 65; 0 45 65"
                dur="3s"
                repeatCount="indefinite"
              />
            )}
          </ellipse>
          
          <ellipse cx="55" cy="68" rx="8" ry="12" fill={colors.leaves} opacity="0.9">
            {animated && (
              <animateTransform 
                attributeName="transform"
                type="rotate"
                values="0 55 68; 5 55 68; 0 55 68"
                dur="3s"
                begin="0.5s"
                repeatCount="indefinite"
              />
            )}
          </ellipse>
          
          <ellipse cx="50" cy="55" rx="7" ry="10" fill={colors.leaves} />
          
          {/* Sparkles (if high health) */}
          {health >= 80 && (
            <>
              <circle cx="35" cy="60" r="2" fill="#fbbf24" opacity="0.8">
                <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="65" cy="65" r="2" fill="#fbbf24" opacity="0.8">
                <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" begin="0.5s" repeatCount="indefinite" />
              </circle>
            </>
          )}
        </svg>
      )

    case 2: // Sapling
      return (
        <svg viewBox="0 0 120 150" className="w-full h-full">
          <defs>
            <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#78716c" />
              <stop offset="50%" stopColor="#a8a29e" />
              <stop offset="100%" stopColor="#78716c" />
            </linearGradient>
          </defs>
          
          {/* Ground */}
          <ellipse cx="60" cy="135" rx="40" ry="10" fill="#78716c" opacity="0.2" />
          
          {/* Trunk */}
          <rect x="55" y="80" width="10" height="55" fill="url(#trunkGradient)" rx="2" />
          
          {/* Branches */}
          <path d="M 60 100 Q 50 95, 45 90" stroke="#78716c" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 60 100 Q 70 95, 75 90" stroke="#78716c" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 60 90 Q 52 85, 48 80" stroke="#78716c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 60 90 Q 68 85, 72 80" stroke="#78716c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          
          {/* Leaves clusters */}
          <circle cx="45" cy="88" r="12" fill={colors.leaves} opacity="0.85" />
          <circle cx="75" cy="88" r="12" fill={colors.leaves} opacity="0.85" />
          <circle cx="48" cy="78" r="10" fill={colors.leaves} opacity="0.85" />
          <circle cx="72" cy="78" r="10" fill={colors.leaves} opacity="0.85" />
          <circle cx="60" cy="75" r="11" fill={colors.leaves} opacity="0.9" />
          
          {/* Wind animation */}
          {animated && (
            <g>
              <animateTransform 
                attributeName="transform"
                type="translate"
                values="0 0; 2 -1; 0 0; -2 -1; 0 0"
                dur="5s"
                repeatCount="indefinite"
              />
            </g>
          )}
          
          {/* Glow if excellent health */}
          {health >= 90 && (
            <circle cx="60" cy="85" r="45" fill={colors.glow} opacity="0.15">
              <animate attributeName="r" values="45;50;45" dur="3s" repeatCount="indefinite" />
            </circle>
          )}
        </svg>
      )

    case 3: // Young Tree
      return (
        <svg viewBox="0 0 140 180" className="w-full h-full">
          <defs>
            <radialGradient id="canopyGradient">
              <stop offset="0%" stopColor={colors.glow} />
              <stop offset="100%" stopColor={colors.leaves} />
            </radialGradient>
          </defs>
          
          {/* Shadow */}
          <ellipse cx="70" cy="165" rx="50" ry="12" fill="#000000" opacity="0.1" />
          
          {/* Trunk */}
          <rect x="63" y="90" width="14" height="75" fill="#78716c" rx="3" />
          <rect x="65" y="90" width="10" height="75" fill="#a8a29e" rx="2" />
          
          {/* Main branches */}
          <path d="M 70 110 Q 55 105, 45 100" stroke="#78716c" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M 70 110 Q 85 105, 95 100" stroke="#78716c" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M 70 100 Q 58 95, 50 88" stroke="#78716c" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M 70 100 Q 82 95, 90 88" stroke="#78716c" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M 70 90 Q 60 85, 55 78" stroke="#78716c" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 70 90 Q 80 85, 85 78" stroke="#78716c" strokeWidth="3" fill="none" strokeLinecap="round" />
          
          {/* Canopy layers */}
          <ellipse cx="70" cy="85" rx="45" ry="40" fill="url(#canopyGradient)" opacity="0.9" />
          <ellipse cx="55" cy="90" rx="30" ry="25" fill={colors.leaves} opacity="0.85" />
          <ellipse cx="85" cy="90" rx="30" ry="25" fill={colors.leaves} opacity="0.85" />
          <ellipse cx="70" cy="70" rx="35" ry="30" fill={colors.leaves} opacity="0.9" />
          
          {/* Detail leaves */}
          <circle cx="45" cy="95" r="15" fill={colors.leaves} opacity="0.7" />
          <circle cx="95" cy="95" r="15" fill={colors.leaves} opacity="0.7" />
          
          {/* Birds flying (if health > 70) */}
          {health > 70 && animated && (
            <g>
              <path d="M 20 50 Q 22 48, 24 50 M 24 50 Q 26 48, 28 50" stroke="#525252" strokeWidth="1.5" fill="none">
                <animateTransform 
                  attributeName="transform"
                  type="translate"
                  values="0 0; 100 -20; 0 0"
                  dur="10s"
                  repeatCount="indefinite"
                />
              </path>
            </g>
          )}
          
          {/* Aura (if health >= 85) */}
          {health >= 85 && (
            <ellipse cx="70" cy="85" rx="55" ry="50" fill={colors.glow} opacity="0.2">
              <animate attributeName="rx" values="55;60;55" dur="4s" repeatCount="indefinite" />
              <animate attributeName="ry" values="50;55;50" dur="4s" repeatCount="indefinite" />
            </ellipse>
          )}
        </svg>
      )

    case 4: // Ancient Guardian
      return (
        <svg viewBox="0 0 160 200" className="w-full h-full">
          <defs>
            <radialGradient id="ancientGlow">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#22c55e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Epic golden glow */}
          <circle cx="80" cy="90" r="70" fill="url(#ancientGlow)">
            <animate attributeName="r" values="70;75;70" dur="3s" repeatCount="indefinite" />
          </circle>
          
          {/* Shadow */}
          <ellipse cx="80" cy="185" rx="60" ry="12" fill="#000000" opacity="0.15" />
          
          {/* Visible roots */}
          <path d="M 75 180 Q 70 185, 65 190" stroke="#78716c" strokeWidth="3" fill="none" opacity="0.6" />
          <path d="M 80 180 Q 80 185, 80 190" stroke="#78716c" strokeWidth="3" fill="none" opacity="0.6" />
          <path d="M 85 180 Q 90 185, 95 190" stroke="#78716c" strokeWidth="3" fill="none" opacity="0.6" />
          
          {/* Massive trunk */}
          <rect x="70" y="100" width="20" height="80" fill="#78716c" rx="4" />
          <rect x="72" y="100" width="16" height="80" fill="#a8a29e" rx="3" />
          
          {/* Complex branch system */}
          <path d="M 80 120 Q 60 115, 45 110" stroke="#78716c" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M 80 120 Q 100 115, 115 110" stroke="#78716c" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M 80 110 Q 62 105, 48 98" stroke="#78716c" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M 80 110 Q 98 105, 112 98" stroke="#78716c" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M 80 100 Q 65 95, 55 88" stroke="#78716c" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M 80 100 Q 95 95, 105 88" stroke="#78716c" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M 80 90 Q 68 85, 60 78" stroke="#78716c" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M 80 90 Q 92 85, 100 78" stroke="#78716c" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          
          {/* Dense canopy */}
          <ellipse cx="80" cy="80" rx="55" ry="50" fill={colors.leaves} opacity="0.95" filter="url(#glow)" />
          <ellipse cx="55" cy="90" rx="35" ry="30" fill={colors.leaves} opacity="0.9" />
          <ellipse cx="105" cy="90" rx="35" ry="30" fill={colors.leaves} opacity="0.9" />
          <ellipse cx="48" cy="95" rx="25" ry="22" fill={colors.leaves} opacity="0.85" />
          <ellipse cx="112" cy="95" rx="25" ry="22" fill={colors.leaves} opacity="0.85" />
          <ellipse cx="80" cy="65" rx="45" ry="38" fill={colors.leaves} opacity="0.95" />
          
          {/* Magical sparkles */}
          {animated && (
            <>
              <circle cx="50" cy="70" r="3" fill="#fbbf24" opacity="0.9">
                <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2s" repeatCount="indefinite" />
                <animate attributeName="cy" values="70;65;70" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx="110" cy="75" r="3" fill="#fbbf24" opacity="0.9">
                <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2s" begin="0.5s" repeatCount="indefinite" />
                <animate attributeName="cy" values="75;70;75" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx="80" cy="55" r="2.5" fill="#fbbf24" opacity="0.9">
                <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2s" begin="1s" repeatCount="indefinite" />
                <animate attributeName="cy" values="55;50;55" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx="65" cy="85" r="2" fill="#86efac" opacity="0.8">
                <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="95" cy="88" r="2" fill="#86efac" opacity="0.8">
                <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2.5s" begin="0.7s" repeatCount="indefinite" />
              </circle>
            </>
          )}
          
          {/* Floating leaves */}
          {animated && health >= 80 && (
            <g>
              <ellipse cx="30" cy="120" rx="3" ry="5" fill={colors.leaves} opacity="0.7">
                <animateTransform 
                  attributeName="transform"
                  type="translate"
                  values="0 0; 10 -30; 20 -60; 30 -90"
                  dur="8s"
                  repeatCount="indefinite"
                />
                <animate attributeName="opacity" values="0.7;0.3;0" dur="8s" repeatCount="indefinite" />
              </ellipse>
            </g>
          )}
        </svg>
      )

    default:
      return null
  }
}