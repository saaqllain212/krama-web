// src/components/companions/visuals/WraithHourglass.tsx
// Animated SVG hourglass that darkens with inactivity

'use client'

import { WraithStage } from '@/lib/companions/companionLogic'

interface WraithHourglassProps {
  stage: WraithStage
  daysIdle: number
  animated?: boolean
}

export default function WraithHourglass({ stage, daysIdle, animated = true }: WraithHourglassProps) {
  // Stage-based color scheme
  const getColors = () => {
    switch (stage) {
      case 0: // Vigilant
        return {
          frame: '#fbbf24', // Gold
          sand: '#ffffff',   // White sand
          glow: '#fbbf24',
          glowOpacity: 0.4,
        }
      case 1: // Watchful
        return {
          frame: '#d4d4d4', // Light gray
          sand: '#f5f5f5',  // Off-white
          glow: '#d4d4d4',
          glowOpacity: 0.2,
        }
      case 2: // Fading
        return {
          frame: '#737373', // Dark gray
          sand: '#a3a3a3',  // Gray sand
          glow: '#737373',
          glowOpacity: 0.15,
        }
      case 3: // Shadow
        return {
          frame: '#262626', // Very dark gray
          sand: '#ef4444',  // Red sand (warning!)
          glow: '#ef4444',
          glowOpacity: 0.3,
        }
      case 4: // Void (skull transformation)
        return {
          frame: '#000000', // Black
          sand: '#dc2626',  // Dark red
          glow: '#dc2626',
          glowOpacity: 0.5,
        }
      default:
        return {
          frame: '#fbbf24',
          sand: '#ffffff',
          glow: '#fbbf24',
          glowOpacity: 0.4,
        }
    }
  }

  const colors = getColors()

  // Sand flow speed based on stage (slower when idle)
  const getSandSpeed = () => {
    if (stage === 4) return '0.5s' // Nearly stopped
    if (stage === 3) return '1s'
    if (stage === 2) return '2s'
    if (stage === 1) return '3s'
    return '4s' // Normal flow
  }

  // Void stage - skull transformation
  if (stage === 4) {
    return (
      <svg viewBox="0 0 80 120" className="w-full h-full">
        <defs>
          <radialGradient id="voidGlow">
            <stop offset="0%" stopColor={colors.glow} stopOpacity={colors.glowOpacity} />
            <stop offset="100%" stopColor={colors.glow} stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Ominous glow */}
        <circle cx="40" cy="60" r="50" fill="url(#voidGlow)">
          {animated && (
            <animate attributeName="r" values="50;55;50" dur="2s" repeatCount="indefinite" />
          )}
        </circle>
        
        {/* Cracked hourglass frame (background) */}
        <path
          d="M 20 20 L 60 20 L 55 50 L 60 80 L 60 100 L 20 100 L 20 80 L 25 50 Z"
          fill={colors.frame}
          opacity="0.3"
        />
        
        {/* Crack lines */}
        <path d="M 30 20 L 28 100" stroke="#dc2626" strokeWidth="1" opacity="0.6" />
        <path d="M 50 20 L 52 100" stroke="#dc2626" strokeWidth="1" opacity="0.6" />
        
        {/* Skull */}
        <ellipse cx="40" cy="55" rx="18" ry="20" fill={colors.frame} />
        
        {/* Eye sockets - glowing red */}
        <ellipse cx="33" cy="52" rx="4" ry="6" fill={colors.sand}>
          {animated && (
            <animate attributeName="opacity" values="1;0.5;1" dur="3s" repeatCount="indefinite" />
          )}
        </ellipse>
        <ellipse cx="47" cy="52" rx="4" ry="6" fill={colors.sand}>
          {animated && (
            <animate attributeName="opacity" values="1;0.5;1" dur="3s" begin="0.5s" repeatCount="indefinite" />
          )}
        </ellipse>
        
        {/* Nose cavity */}
        <path d="M 40 60 L 37 65 L 43 65 Z" fill="#000000" opacity="0.7" />
        
        {/* Teeth */}
        <rect x="33" y="68" width="3" height="4" fill="#000000" opacity="0.5" />
        <rect x="37" y="68" width="3" height="4" fill="#000000" opacity="0.5" />
        <rect x="41" y="68" width="3" height="4" fill="#000000" opacity="0.5" />
        <rect x="45" y="68" width="3" height="4" fill="#000000" opacity="0.5" />
        
        {/* Remaining sand (minimal) */}
        <ellipse cx="40" cy="90" rx="8" ry="4" fill={colors.sand} opacity="0.5" />
        
        {/* Warning particles */}
        {animated && (
          <>
            <circle cx="25" cy="40" r="2" fill={colors.sand}>
              <animate attributeName="cy" values="40;20" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="55" cy="45" r="2" fill={colors.sand}>
              <animate attributeName="cy" values="45;25" dur="3s" begin="0.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0" dur="3s" begin="0.5s" repeatCount="indefinite" />
            </circle>
          </>
        )}
      </svg>
    )
  }

  // Normal hourglass (stages 0-3)
  return (
    <svg viewBox="0 0 80 120" className="w-full h-full">
      <defs>
        <linearGradient id="frameGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colors.frame} />
          <stop offset="50%" stopColor={colors.glow} />
          <stop offset="100%" stopColor={colors.frame} />
        </linearGradient>
        
        <radialGradient id="hourglassGlow">
          <stop offset="0%" stopColor={colors.glow} stopOpacity={colors.glowOpacity} />
          <stop offset="100%" stopColor={colors.glow} stopOpacity="0" />
        </radialGradient>
      </defs>
      
      {/* Glow effect */}
      {stage === 0 && (
        <circle cx="40" cy="60" r="45" fill="url(#hourglassGlow)">
          {animated && (
            <animate attributeName="r" values="45;50;45" dur="3s" repeatCount="indefinite" />
          )}
        </circle>
      )}
      
      {/* Pulsing red glow for warning stage */}
      {stage === 3 && (
        <circle cx="40" cy="60" r="45" fill="url(#hourglassGlow)">
          {animated && (
            <>
              <animate attributeName="r" values="45;52;45" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.6;0.3" dur="1.5s" repeatCount="indefinite" />
            </>
          )}
        </circle>
      )}
      
      {/* Hourglass frame */}
      <path
        d="M 20 15 L 60 15 L 60 25 L 45 55 L 60 85 L 60 105 L 20 105 L 20 85 L 35 55 L 20 25 Z"
        fill="none"
        stroke="url(#frameGradient)"
        strokeWidth="3"
      />
      
      {/* Top horizontal bars */}
      <rect x="20" y="15" width="40" height="3" fill={colors.frame} />
      <rect x="20" y="102" width="40" height="3" fill={colors.frame} />
      
      {/* Upper chamber sand (decreases as stage increases) */}
      <path
        d={`M 25 25 L 55 25 L ${45 - stage * 2} ${55 - stage * 8} L ${35 + stage * 2} ${55 - stage * 8} Z`}
        fill={colors.sand}
        opacity="0.9"
      >
        {/* Sand level animation */}
        {animated && stage < 3 && (
          <animate 
            attributeName="d"
            values={`M 25 25 L 55 25 L ${45 - stage * 2} ${55 - stage * 8} L ${35 + stage * 2} ${55 - stage * 8} Z;
                     M 25 25 L 55 25 L ${45 - stage * 2} ${57 - stage * 8} L ${35 + stage * 2} ${57 - stage * 8} Z;
                     M 25 25 L 55 25 L ${45 - stage * 2} ${55 - stage * 8} L ${35 + stage * 2} ${55 - stage * 8} Z`}
            dur={getSandSpeed()}
            repeatCount="indefinite"
          />
        )}
      </path>
      
      {/* Sand stream (narrow at center) */}
      {stage < 3 && (
        <rect x="38" y={`${52 - stage * 8}`} width="4" height={`${20 + stage * 8}`} fill={colors.sand} opacity="0.7">
          {animated && (
            <animate attributeName="opacity" values="0.7;0.4;0.7" dur="1s" repeatCount="indefinite" />
          )}
        </rect>
      )}
      
      {/* Lower chamber sand (increases as stage increases) */}
      <path
        d={`M ${35 + stage * 2} ${65 + stage * 8} L ${45 - stage * 2} ${65 + stage * 8} L 55 95 L 25 95 Z`}
        fill={colors.sand}
        opacity="0.9"
      >
        {/* Growing pile animation */}
        {animated && stage < 3 && (
          <animate 
            attributeName="d"
            values={`M ${35 + stage * 2} ${65 + stage * 8} L ${45 - stage * 2} ${65 + stage * 8} L 55 95 L 25 95 Z;
                     M ${35 + stage * 2} ${63 + stage * 8} L ${45 - stage * 2} ${63 + stage * 8} L 55 95 L 25 95 Z;
                     M ${35 + stage * 2} ${65 + stage * 8} L ${45 - stage * 2} ${65 + stage * 8} L 55 95 L 25 95 Z`}
            dur={getSandSpeed()}
            repeatCount="indefinite"
          />
        )}
      </path>
      
      {/* Falling sand particles */}
      {animated && stage < 3 && (
        <>
          <circle cx="39" cy="60" r="1" fill={colors.sand}>
            <animate attributeName="cy" values="55;75" dur={getSandSpeed()} repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0" dur={getSandSpeed()} repeatCount="indefinite" />
          </circle>
          <circle cx="41" cy="58" r="1" fill={colors.sand}>
            <animate attributeName="cy" values="53;73" dur={getSandSpeed()} begin="0.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0" dur={getSandSpeed()} begin="0.2s" repeatCount="indefinite" />
          </circle>
        </>
      )}
      
      {/* Warning cracks (stage 3) */}
      {stage === 3 && (
        <>
          <path d="M 30 30 L 32 50" stroke={colors.sand} strokeWidth="1" opacity="0.5" />
          <path d="M 50 35 L 48 52" stroke={colors.sand} strokeWidth="1" opacity="0.5" />
        </>
      )}
      
      {/* Idle days indicator (small text) */}
      {daysIdle > 0 && (
        <text x="40" y="115" fontSize="10" fill={colors.frame} textAnchor="middle" opacity="0.7">
          {daysIdle}d idle
        </text>
      )}
    </svg>
  )
}