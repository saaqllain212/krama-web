'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Trophy, Zap, Coffee, Moon, Sun } from 'lucide-react'

type EasterEgg = {
  id: string
  title: string
  message: string
  icon: React.ReactNode
  discovered: boolean
}

export function useEasterEggs() {
  const [eggs, setEggs] = useState<EasterEgg[]>([
    {
      id: 'konami',
      title: 'Beast Mode Unlocked! 🔥',
      message: 'The ancient code has been entered. Your focus is unstoppable!',
      icon: <Zap className="h-6 w-6" />,
      discovered: false
    },
    {
      id: 'logo-spam',
      title: 'Logo Lover Achievement 🎯',
      message: 'You really like that logo, huh? We appreciate the enthusiasm!',
      icon: <Trophy className="h-6 w-6" />,
      discovered: false
    },
    {
      id: 'midnight-owl',
      title: 'Midnight Owl 🦉',
      message: 'Studying after midnight? Respect the dedication, but don\'t forget to sleep!',
      icon: <Moon className="h-6 w-6" />,
      discovered: false
    },
    {
      id: 'early-bird',
      title: 'Early Bird Gets the Marks 🌅',
      message: 'Studying before 6 AM? You\'re a morning warrior!',
      icon: <Sun className="h-6 w-6" />,
      discovered: false
    },
    {
      id: 'coffee-break',
      title: 'Coffee Enthusiast ☕',
      message: 'Pro tip: Studies show 20mg of caffeine per kg of body weight is optimal for focus!',
      icon: <Coffee className="h-6 w-6" />,
      discovered: false
    },
    {
      id: 'scroll-perfectionist',
      title: 'The Perfect Balance ⚖️',
      message: 'You found the 50% scroll point! Just like retention, it\'s all about balance.',
      icon: <Sparkles className="h-6 w-6" />,
      discovered: false
    }
  ])

  const [activeEgg, setActiveEgg] = useState<EasterEgg | null>(null)
  const [konamiCode, setKonamiCode] = useState<string[]>([])
  const [logoClicks, setLogoClicks] = useState(0)
  const [lastLogoClick, setLastLogoClick] = useState(0)

  const discoverEgg = (eggId: string) => {
    const egg = eggs.find(e => e.id === eggId && !e.discovered)
    if (egg) {
      setEggs(prev => prev.map(e => 
        e.id === eggId ? { ...e, discovered: true } : e
      ))
      setActiveEgg(egg)
      setTimeout(() => setActiveEgg(null), 5000)
      
      // Confetti effect
      if (typeof window !== 'undefined' && (window as any).confetti) {
        ;(window as any).confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      }
    }
  }

  // Konami Code listener
  useEffect(() => {
    const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const newCode = [...konamiCode, e.key].slice(-10)
      setKonamiCode(newCode)
      
      if (newCode.join('') === konamiPattern.join('')) {
        discoverEgg('konami')
        setKonamiCode([])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [konamiCode])

  // Check time of day
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 0 && hour < 6) {
      discoverEgg('midnight-owl')
    } else if (hour >= 4 && hour < 7) {
      discoverEgg('early-bird')
    }
  }, [])

  // Scroll detection for 50% mark
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout
    const handleScroll = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        if (scrollPercent >= 49 && scrollPercent <= 51) {
          discoverEgg('scroll-perfectionist')
        }
      }, 150)
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  const handleLogoClick = () => {
    const now = Date.now()
    if (now - lastLogoClick < 500) {
      const newCount = logoClicks + 1
      setLogoClicks(newCount)
      if (newCount >= 5) {
        discoverEgg('logo-spam')
        setLogoClicks(0)
      }
    } else {
      setLogoClicks(1)
    }
    setLastLogoClick(now)
  }

  const handleCoffeeType = () => {
    discoverEgg('coffee-break')
  }

  return {
    eggs,
    activeEgg,
    handleLogoClick,
    handleCoffeeType,
    discoverEgg
  }
}

// Achievement Toast Component
export function EasterEggToast({ egg }: { egg: EasterEgg | null }) {
  if (!egg) return null

  return (
    <div className="fixed top-24 right-6 z-50 animate-slide-in-right">
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white p-6 rounded-2xl shadow-2xl max-w-sm border border-white/20 backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            {egg.icon}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">{egg.title}</h3>
            <p className="text-sm text-white/90 leading-relaxed">{egg.message}</p>
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white/60 animate-progress-bar" />
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes progress-bar {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.4s ease-out;
        }
        .animate-progress-bar {
          animation: progress-bar 5s linear;
        }
      `}</style>
    </div>
  )
}

// Fun Student-Focused Easter Eggs
export function StudentEasterEggs() {
  const [showMotivation, setShowMotivation] = useState(false)
  
  useEffect(() => {
    // Random motivational message every 10 minutes
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setShowMotivation(true)
        setTimeout(() => setShowMotivation(false), 8000)
      }
    }, 600000) // 10 minutes

    return () => clearInterval(interval)
  }, [])

  const motivations = [
    "🧠 Fun fact: Your brain creates new neural pathways every time you review!",
    "💪 Remember: Consistency beats cramming. You're building habits, not just knowledge.",
    "🎯 Pro tip: Take a 5-minute break every 25 minutes. Your retention will thank you!",
    "⚡ Did you know? Walking while studying can boost your memory by 20%!",
    "🌟 You're doing great! Every small step counts toward your goal.",
    "☕ Hydration check! Water improves cognitive function by 14%.",
    "🎮 Gamify your study: Set mini-goals and reward yourself. Dopamine is a powerful ally!",
    "📚 UPSC/JEE/NEET isn't about being perfect. It's about being persistent."
  ]

  const randomMotivation = motivations[Math.floor(Math.random() * motivations.length)]

  if (!showMotivation) return null

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-slide-in-left max-w-xs">
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-5 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-xl">
        <p className="text-sm font-medium leading-relaxed">{randomMotivation}</p>
        <button 
          onClick={() => setShowMotivation(false)}
          className="mt-3 text-xs text-white/70 hover:text-white transition-colors"
        >
          Thanks! ✨
        </button>
      </div>

      <style jsx>{`
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}