'use client'
import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface AppConfig {
  feature_focus_enabled: boolean
  feature_review_enabled: boolean
  feature_mocks_enabled: boolean
  feature_mcq_enabled: boolean
  feature_companions_enabled: boolean
  feature_insights_enabled: boolean
  feature_buddy_enabled: boolean
  maintenance_mode: boolean
  maintenance_message: string
  signup_active: boolean
  max_users: number
  trial_days: number
  default_daily_goal_hours: number
  xp_multiplier: number
  base_price: number
  global_free_mode: boolean
  free_mode_message: string
}

const DEFAULT_CONFIG: AppConfig = {
  feature_focus_enabled: true, feature_review_enabled: true,
  feature_mocks_enabled: true, feature_mcq_enabled: true,
  feature_companions_enabled: true, feature_insights_enabled: true,
  feature_buddy_enabled: true,
  maintenance_mode: false, maintenance_message: '',
  signup_active: true, max_users: 500, trial_days: 14,
  default_daily_goal_hours: 6, xp_multiplier: 1, base_price: 299,
  global_free_mode: false, free_mode_message: '🎉 Early access — everything is free for now!',
}

type AppConfigContextType = { config: AppConfig; loading: boolean; refresh: () => Promise<void> }
const AppConfigContext = createContext<AppConfigContextType>({ config: DEFAULT_CONFIG, loading: true, refresh: async () => {} })

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
        const d = configRes.data
        setConfig({
          feature_focus_enabled:      d.feature_focus_enabled ?? true,
          feature_review_enabled:     d.feature_review_enabled ?? true,
          feature_mocks_enabled:      d.feature_mocks_enabled ?? true,
          feature_mcq_enabled:        d.feature_mcq_enabled ?? true,
          feature_companions_enabled: d.feature_companions_enabled ?? true,
          feature_insights_enabled:   d.feature_insights_enabled ?? true,
          feature_buddy_enabled:      d.feature_buddy_enabled ?? true,
          maintenance_mode:           d.maintenance_mode ?? false,
          maintenance_message:        d.maintenance_message ?? '',
          signup_active:              d.signup_active ?? true,
          max_users:                  d.max_users ?? 500,
          trial_days:                 d.trial_days ?? 14,
          default_daily_goal_hours:   d.default_daily_goal_hours ?? 6,
          xp_multiplier:              parseFloat(d.xp_multiplier) || 1,
          base_price:                 storeRes.data?.base_price ?? 299,
          global_free_mode:           d.global_free_mode ?? false,
          free_mode_message:          d.free_mode_message ?? '🎉 Early access — everything is free for now!',
        })
      }
    } catch (e) { console.error('Failed to load app config:', e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchConfig() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return <AppConfigContext.Provider value={{ config, loading, refresh: fetchConfig }}>{children}</AppConfigContext.Provider>
}

export function useAppConfig() { return useContext(AppConfigContext) }
