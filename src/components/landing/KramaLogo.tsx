'use client'

import { motion } from 'framer-motion'

interface KramaLogoProps {
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

export default function KramaLogo({ size = 'md', animated = true }: KramaLogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'text-xl' },
    md: { icon: 32, text: 'text-2xl' },
    lg: { icon: 40, text: 'text-3xl' },
  }

  const { icon: iconSize, text: textSize } = sizes[size]

  return (
    <div className="flex items-center gap-2">
      {/* Combined Icon: Tree (Growth) + Hourglass (Time) */}
      <motion.svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={animated ? { scale: 0.8, opacity: 0 } : {}}
        animate={animated ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Hourglass (Time Wraith) */}
        <motion.path
          d="M12 4 L18 4 L15 10 L18 16 L12 16 L15 10 Z"
          fill="#f97316"
          opacity="0.6"
          initial={animated ? { rotate: 0 } : {}}
          animate={animated ? { rotate: [0, 180, 0] } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Tree (Growth Guardian) */}
        <motion.g
          initial={animated ? { y: 2, opacity: 0 } : {}}
          animate={animated ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {/* Tree leaves - triangle shape */}
          <path
            d="M28 10 L34 20 L22 20 Z"
            fill="#22c55e"
            opacity="0.8"
          />
          <path
            d="M28 14 L33 22 L23 22 Z"
            fill="#16a34a"
            opacity="0.9"
          />
          
          {/* Tree trunk */}
          <rect
            x="26.5"
            y="22"
            width="3"
            height="8"
            fill="#92400e"
            rx="0.5"
          />
        </motion.g>
        
        {/* Connecting element - subtle arc */}
        <motion.path
          d="M18 10 Q23 12 22 15"
          stroke="#5B8FF9"
          strokeWidth="1"
          fill="none"
          opacity="0.3"
          strokeDasharray="2,2"
          initial={animated ? { pathLength: 0 } : {}}
          animate={animated ? { pathLength: 1 } : {}}
          transition={{ delay: 0.5, duration: 1 }}
        />
      </motion.svg>

      {/* Wordmark */}
      <motion.span 
        className={`${textSize} font-black uppercase tracking-tight text-gray-900`}
        initial={animated ? { x: -10, opacity: 0 } : {}}
        animate={animated ? { x: 0, opacity: 1 } : {}}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Krama
      </motion.span>
    </div>
  )
}