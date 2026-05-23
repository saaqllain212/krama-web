'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface AppConfig {
  // Feature flags (original)
  feature_focus_enabled: boolean
  feature_review_enabled: boolean
  feature_mocks_enabled: boolean
  feature_mcq_enabled: boolean
  feature_companions_enabled: boolean
  feature_insights_enabled: boolean
  // NEW: Study buddy feature flag
  feature_buddy_enabled: boolean
  // System (original)
  maintenance_mode: boolean
  maintenance_message: string
  signup_active: boolean
  max_users: number
  trial_days: number
  default_daily_goal_hours: number
  xp_multiplier: number
  // Store (original)
  base_price: number
  // NEW: Global free mode — bypasses all paywalls when true
  global_free_mode: boolean
  free_mode_message: string
}

const DEFAULT_CONFIG: AppConfig = {
  feature_focus_enabled: true,
  feature_review_enabled: true,
  feature_mocks_enabled: true,
  feature_mcq_enabled: true,
  feature_companions_enabled: true,
  feature_insights_enabled: true,
  feature_buddy_enabled: true,
  maintenance_mode: false,
  maintenance_message: '',
  signup_active: true,
  max_users: 500,
  trial_days: 14,
  default_daily_goal_hours: 6,
  xp_multiplier: 1,
  base_price: 299,
  global_free_mode: false,
  free_mode_message: '🎉 Early access — everything is free for now!',
}

type AppConfigContextType = {
  config: AppConfig
  loading: boolean
  refresh: () => Promise<void>
}

const AppConfigContext = createContext<AppConfigContextType>({
  config: DEFAULT_CONFIG,
  loading: true,
  refresh: async () => {},
})

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), [])
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)

  const fetchConfig = async () => {
    try {
      const [configRes, storeRes] = await Promise.all([
        supabase.from('app_config').select('*').single(),
        supabase.from('store_settings').select('base_price').eq('id', 'global').single(),
      ])

      if (configRes.data) {
        setConfig({
          // Feature flags (original — unchanged)
          feature_focus_enabled:      configRes.data.feature_focus_enabled ?? true,
          feature_review_enabled:     configRes.data.feature_review_enabled ?? true,
          feature_mocks_enabled:      configRes.data.feature_mocks_enabled ?? true,
          feature_mcq_enabled:        configRes.data.feature_mcq_enabled ?? true,
          feature_companions_enabled: configRes.data.feature_companions_enabled ?? true,
          feature_insights_enabled:   configRes.data.feature_insights_enabled ?? true,
          // NEW: buddy flag
          feature_buddy_enabled:      configRes.data.feature_buddy_enabled ?? true,
          // System (original — unchanged)
          maintenance_mode:           configRes.data.maintenance_mode ?? false,
          maintenance_message:        configRes.data.maintenance_message ?? '',
          signup_active:              configRes.data.signup_active ?? true,
          max_users:                  configRes.data.max_users ?? 500,
          trial_days:                 configRes.data.trial_days ?? 14,
          default_daily_goal_hours:   configRes.data.default_daily_goal_hours ?? 6,
          xp_multiplier:              parseFloat(configRes.data.xp_multiplier) || 1,
          // Store (original — unchanged)
          base_price:                 storeRes.data?.base_price ?? 299,
          // NEW: global free mode
          global_free_mode:           configRes.data.global_free_mode ?? false,
          free_mode_message:          configRes.data.free_mode_message ?? '🎉 Early access — everything is free for now!',
        })
      }
    } catch (e) {
      console.error('Failed to load app config:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AppConfigContext.Provider value={{ config, loading, refresh: fetchConfig }}>
      {children}
    </AppConfigContext.Provider>
  )
}

export function useAppConfig() {
  return useContext(AppConfigContext)
}
