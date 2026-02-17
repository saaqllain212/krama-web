'use client'

import { useEffect, useRef } from 'react'
import { useXP } from '@/context/XPContext'

/**
 * StudyReminder — Uses the browser Notification API (NOT push notifications).
 * 
 * How it works:
 * - Runs only when the dashboard tab is open
 * - At 7 PM, checks if user studied today (total_focus_minutes > 0 from today)
 * - If not, shows a browser notification: "Your streak is at risk!"
 * - Only fires once per day (tracked via localStorage)
 * - Completely free — no backend, no service, no subscription
 * 
 * Limitations:
 * - Only works when the tab is open (not a real push notification)
 * - User must grant notification permission
 */
export default function StudyReminder() {
  const { stats } = useXP()
  const hasRequestedRef = useRef(false)

  useEffect(() => {
    // Don't run on server or if notifications aren't supported
    if (typeof window === 'undefined' || !('Notification' in window)) return

    // Request permission once (silently — doesn't show a prompt if already decided)
    if (!hasRequestedRef.current && Notification.permission === 'default') {
      // We'll ask permission when user first completes a focus session
      // For now, just check if already granted
      hasRequestedRef.current = true
    }

    if (Notification.permission !== 'granted') return

    const checkAndNotify = () => {
      const now = new Date()
      const hour = now.getHours()
      
      // Only check between 7 PM and 10 PM
      if (hour < 19 || hour > 22) return

      // Check if we already notified today
      const today = now.toISOString().split('T')[0]
      const lastNotified = localStorage.getItem('krama_last_reminder')
      if (lastNotified === today) return

      // Check if user has studied today
      // If stats exist and last_active_date is today, user has studied
      if (stats?.last_active_date === today) return

      // User hasn't studied today — show notification
      const streak = stats?.current_streak ?? 0
      const title = streak > 0 
        ? `🔥 ${streak}-day streak at risk!` 
        : "📚 Time to study!"
      const body = streak > 0
        ? "You haven't studied today. Don't break your streak!"
        : "Start a quick focus session to build momentum."

      try {
        new Notification(title, {
          body,
          icon: '/icon-192.png',
          tag: 'krama-study-reminder', // Prevents duplicate notifications
          requireInteraction: false,
        })
        localStorage.setItem('krama_last_reminder', today)
      } catch (e) {
        // Notification failed silently — that's fine
      }
    }

    // Check immediately and then every 30 minutes
    checkAndNotify()
    const interval = setInterval(checkAndNotify, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [stats])

  // This component renders nothing — it's just a side effect
  return null
}

/**
 * Call this after user's first focus session to request notification permission.
 * We ask at this moment because the user just experienced value — highest conversion rate.
 */
export function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission === 'default') {
    Notification.requestPermission()
  }
}
