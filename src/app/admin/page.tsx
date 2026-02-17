'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Loader2, Shield, Trash2, Crown, User, LogOut, ArrowLeft, 
  Store, Users, Tag, CreditCard, TrendingUp, Activity,
  Plus, ToggleLeft, ToggleRight, Settings,
  RefreshCw, Search, X, ChevronDown, ChevronUp,
  Zap, AlertTriangle, Clock, Target, BarChart3, 
  Wrench, Download
} from 'lucide-react'
import { useAlert } from '@/context/AlertContext'
import Timekeeper from '@/components/admin/Timekeeper'
import Harvester from '@/components/admin/Harvester'
import BroadcastManager from '@/components/admin/BroadcastManager'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL

// ---- STAT CARD ----
function StatCard({ label, value, icon: Icon, color }: { 
  label: string; value: string | number; icon: any; color: 'gray' | 'green' | 'amber' | 'blue' | 'red' | 'purple'
}) {
  const colors: Record<string, string> = {
    gray: 'border-l-gray-400', green: 'border-l-green-500', amber: 'border-l-amber-500',
    blue: 'border-l-blue-500', red: 'border-l-red-500', purple: 'border-l-purple-500',
  }
  return (
    <div className={`bg-white rounded-xl border border-gray-200 border-l-4 ${colors[color]} p-6 shadow-sm`}>
      <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold mb-2">
        <Icon size={16} /> {label}
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </div>
  )
}

// ---- FEATURE FLAG TOGGLE ----
function FeatureToggle({ label, description, flag, value, onToggle }: {
  label: string; description: string; flag: string; value: boolean; onToggle: (flag: string, val: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div>
        <div className="font-semibold text-gray-900">{label}</div>
        <div className="text-sm text-gray-500">{description}</div>
      </div>
      <button onClick={() => onToggle(flag, !value)} className={`${value ? 'text-green-600' : 'text-red-500'}`}>
        {value ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
      </button>
    </div>
  )
}

// ---- USER DETAIL ROW ----
function UserDetailRow({ u, isExpanded, onToggle, onAction }: {
  u: any; isExpanded: boolean; onToggle: () => void; onAction: (action: string, payload: any, skip?: boolean) => void
}) {
  const [editXP, setEditXP] = useState(u.xp)
  const [editStreak, setEditStreak] = useState(u.current_streak)

  const focusHours = (u.total_focus_minutes / 60).toFixed(1)
  const daysLeft = u.trial_ends_at 
    ? Math.ceil((new Date(u.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <>
      <tr className="hover:bg-gray-50 cursor-pointer" onClick={onToggle}>
        <td className="p-4">
          <div className="font-semibold text-gray-900">{u.email}</div>
          <div className="text-xs text-gray-400 font-mono">{u.id.slice(0, 8)}...</div>
        </td>
        <td className="p-4">
          <Timekeeper 
            userId={u.id} currentTrialEnd={u.trial_ends_at} 
            onUpdate={() => onAction('NOOP', {}, true)} adminEmail={ADMIN_EMAIL!} isPremium={u.is_premium} 
          />
        </td>
        <td className="p-4">
          {u.is_premium ? (
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
              <Crown size={12}/> Premium
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">
              <User size={12}/> Free
            </span>
          )}
        </td>
        <td className="p-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <button onClick={(e) => { e.stopPropagation(); onToggle() }}
              className="p-2 text-gray-400 hover:text-gray-700 rounded-lg">
              {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
            </button>
            <button onClick={(e) => { e.stopPropagation(); onAction('TOGGLE_PREMIUM', { userId: u.id, status: !u.is_premium }, false) }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 hover:border-gray-400 transition-colors">
              {u.is_premium ? 'Downgrade' : 'Upgrade'}
            </button>
            <button onClick={(e) => { e.stopPropagation(); onAction('DELETE_USER', { userId: u.id }, false) }}
              className="p-2 text-gray-300 hover:text-red-500 transition-colors rounded-lg">
              <Trash2 size={16} />
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-blue-50/50">
          <td colSpan={4} className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-xs text-gray-500 font-semibold">Focus Hours</div>
                <div className="text-xl font-bold text-gray-900">{focusHours}h</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-xs text-gray-500 font-semibold">Streak</div>
                <div className="text-xl font-bold text-gray-900">{u.current_streak}d</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-xs text-gray-500 font-semibold">Level {u.level}</div>
                <div className="text-xl font-bold text-gray-900">{u.xp} XP</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-xs text-gray-500 font-semibold">Exam</div>
                <div className="text-xl font-bold text-gray-900 uppercase">{u.active_exam || '—'}</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-xs text-gray-500 font-semibold">Reviews</div>
                <div className="text-xl font-bold text-gray-900">{u.total_reviews}</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-xs text-gray-500 font-semibold">Mocks</div>
                <div className="text-xl font-bold text-gray-900">{u.total_mocks}</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-xs text-gray-500 font-semibold">Guardian HP</div>
                <div className="text-xl font-bold text-gray-900">{u.guardian_health}%</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-xs text-gray-500 font-semibold">Last Active</div>
                <div className="text-sm font-bold text-gray-900">{u.last_active_date || 'Never'}</div>
              </div>
            </div>

            {/* Quick edit actions */}
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">XP</label>
                <div className="flex gap-1">
                  <input type="number" value={editXP} onChange={(e) => setEditXP(Number(e.target.value))}
                    className="w-24 border rounded-lg px-2 py-1.5 text-sm font-semibold" />
                  <button onClick={() => onAction('UPDATE_USER_STATS', { userId: u.id, xp: editXP }, true)}
                    className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">Set</button>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Streak</label>
                <div className="flex gap-1">
                  <input type="number" value={editStreak} onChange={(e) => setEditStreak(Number(e.target.value))}
                    className="w-20 border rounded-lg px-2 py-1.5 text-sm font-semibold" />
                  <button onClick={() => onAction('UPDATE_USER_STATS', { userId: u.id, current_streak: editStreak }, true)}
                    className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">Set</button>
                </div>
              </div>
              <button onClick={() => onAction('RESET_USER_STREAK', { userId: u.id }, false)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
                Reset Streak
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ============== MAIN ADMIN PAGE ==============
export default function AdminDashboard() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const { showAlert, askConfirm } = useAlert()
  
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'store' | 'settings' | 'analytics'>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: 0, maxUses: 10 })
  const [newPrice, setNewPrice] = useState<number>(0)
  const [maintenanceMsg, setMaintenanceMsg] = useState('')
  const [bulkDays, setBulkDays] = useState(7)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== ADMIN_EMAIL) { router.push('/'); return }
      fetchData()
    }
    init()
  }, [refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/data', { method: 'POST' })
      if (!res.ok) throw new Error('Failed')
      const json = await res.json()
      setData(json)
      setNewPrice(json.storeSettings?.base_price || 299)
      setMaintenanceMsg(json.config?.maintenance_message || '')
    } catch (e) { console.error(e); showAlert('Failed to load data', 'error') }
    finally { setLoading(false) }
  }

  const handleAction = async (action: string, payload: any, skipConfirm = false) => {
    if (action === 'NOOP') { refresh(); return }
    if (!skipConfirm) { askConfirm('Are you sure?', () => executeAction(action, payload)) }
    else { await executeAction(action, payload) }
  }

  const executeAction = async (action: string, payload: any) => {
    try {
      setLoading(true)
      await fetch('/api/admin/action', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload })
      })
      showAlert('Action completed', 'success')
      setRefreshKey(k => k + 1)
    } catch (e) { showAlert('Action failed', 'error'); setLoading(false) }
  }

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCoupon.code || newCoupon.discount <= 0) { showAlert('Fill all fields', 'error'); return }
    await executeAction('CREATE_COUPON', newCoupon)
    setNewCoupon({ code: '', discount: 0, maxUses: 10 })
  }

  const refresh = () => setRefreshKey(k => k + 1)

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    )
  }
  if (!data) return <div className="p-10 font-bold text-gray-500">Error loading dashboard.</div>

  const { config, users, payments, coupons, storeSettings, analytics } = data
  const paidUsers = users.filter((u: any) => u.is_premium).length
  const freeUsers = users.length - paidUsers
  const totalRevenue = payments.reduce((sum: number, p: any) => sum + (p.amount_paid / 100), 0)
  const totalFocusHours = Math.round((analytics?.totalFocusMinutes || 0) / 60)

  const filteredUsers = searchQuery 
    ? users.filter((u: any) => u.email.toLowerCase().includes(searchQuery.toLowerCase()) || u.active_exam?.toLowerCase().includes(searchQuery.toLowerCase()))
    : users

  const TABS = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'store', label: 'Store', icon: Store },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* HEADER */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-primary-500 to-purple-500 text-white p-2 rounded-lg"><Shield size={20} /></div>
            <div>
              <h1 className="text-xl font-bold">Admin Console</h1>
              <p className="text-xs text-gray-400">{ADMIN_EMAIL}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={refresh} disabled={loading} className="p-2 rounded-lg hover:bg-gray-100">
              <RefreshCw size={18} className={loading ? 'animate-spin text-gray-400' : 'text-gray-500'} />
            </button>
            <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg hover:bg-gray-100">
              <ArrowLeft size={16}/> Dashboard
            </button>
            <button onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
              <LogOut size={16}/>
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        
        {/* ========== OVERVIEW ========== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Users" value={users.length} icon={Users} color="gray" />
              <StatCard label="Premium" value={paidUsers} icon={Crown} color="green" />
              <StatCard label="Active (7d)" value={analytics?.activeUsers7d || 0} icon={Zap} color="purple" />
              <StatCard label="Revenue" value={`₹${totalRevenue}`} icon={TrendingUp} color="blue" />
            </div>

            {/* Maintenance banner */}
            {config.maintenance_mode && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <AlertTriangle className="text-red-500" size={20} />
                <span className="text-sm font-semibold text-red-700">Maintenance mode is ON</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SYSTEM STATUS */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-6 text-gray-900">System Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-900">Signups</div>
                      <div className="text-sm text-gray-500">{config.signup_active ? 'Open' : 'Closed'}</div>
                    </div>
                    <button onClick={() => handleAction('TOGGLE_SIGNUP', { status: !config.signup_active })}
                      className={`p-2 ${config.signup_active ? 'text-green-600' : 'text-red-500'}`}>
                      {config.signup_active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-900">Users</div>
                      <div className="text-sm text-gray-500">{users.length} / {config.max_users}</div>
                    </div>
                    <input type="number" value={config.max_users}
                      onChange={(e) => handleAction('UPDATE_LIMIT', { limit: Number(e.target.value) }, true)}
                      className="w-20 border border-gray-300 rounded-lg p-2 font-semibold text-center focus:ring-2 focus:ring-primary-500/20 outline-none" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-900">Total Focus</div>
                      <div className="text-sm text-gray-500">Last 30 days</div>
                    </div>
                    <div className="text-2xl font-bold text-primary-600">{totalFocusHours}h</div>
                  </div>
                </div>
              </div>

              {/* RECENT PAYMENTS */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4 text-gray-900">Recent Payments</h3>
                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {payments.length === 0 ? (
                    <p className="text-gray-400 text-sm">No payments yet</p>
                  ) : payments.slice(0, 8).map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-bold text-green-600">+₹{p.amount_paid / 100}</div>
                        <div className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString()}</div>
                      </div>
                      {p.coupon_used && (
                        <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-semibold">{p.coupon_used}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <BroadcastManager adminEmail={ADMIN_EMAIL!} />
          </div>
        )}

        {/* ========== USERS ========== */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by email or exam..."
                  className="w-full border border-gray-300 rounded-lg p-3 pl-10 font-medium text-sm focus:ring-2 focus:ring-primary-500/20 outline-none" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={18} />
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <Harvester users={users} />
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                  <span className="text-xs font-semibold text-gray-500">Bulk +</span>
                  <input type="number" value={bulkDays} onChange={(e) => setBulkDays(Number(e.target.value))}
                    className="w-12 text-sm font-bold border-b border-gray-300 text-center outline-none" />
                  <span className="text-xs text-gray-400">days</span>
                  <button onClick={() => handleAction('BULK_EXTEND_TRIALS', { days: bulkDays })}
                    className="bg-gray-900 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-gray-800">Go</button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="p-4 text-left text-xs font-semibold text-gray-500">User</th>
                      <th className="p-4 text-left text-xs font-semibold text-gray-500">Trial/Access</th>
                      <th className="p-4 text-left text-xs font-semibold text-gray-500">Status</th>
                      <th className="p-4 text-right text-xs font-semibold text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map((u: any) => (
                      <UserDetailRow key={u.id} u={u}
                        isExpanded={expandedUser === u.id}
                        onToggle={() => setExpandedUser(expandedUser === u.id ? null : u.id)}
                        onAction={handleAction} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========== ANALYTICS ========== */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Active (7d)" value={analytics?.activeUsers7d || 0} icon={Users} color="purple" />
              <StatCard label="Focus (30d)" value={`${totalFocusHours}h`} icon={Clock} color="blue" />
              <StatCard label="Free/Trial" value={freeUsers} icon={User} color="amber" />
              <StatCard label="Paid" value={paidUsers} icon={Crown} color="green" />
            </div>

            {/* Daily Activity Chart (simple bar chart) */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-6 text-gray-900">Daily Active Users (30d)</h3>
              {analytics?.daily?.length > 0 ? (
                <div className="flex items-end gap-1 h-40">
                  {analytics.daily.slice(-30).map((d: any, i: number) => {
                    const maxUsers = Math.max(...analytics.daily.map((x: any) => x.activeUsers), 1)
                    const height = (d.activeUsers / maxUsers) * 100
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div className="w-full bg-primary-400 rounded-t transition-all hover:bg-primary-600"
                          style={{ height: `${Math.max(height, 4)}%` }} />
                        <div className="absolute -top-8 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                          {d.date}: {d.activeUsers} users, {Math.round(d.totalMinutes/60)}h
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No activity data yet</p>
              )}
            </div>

            {/* Exam Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4 text-gray-900">Exam Distribution</h3>
                <div className="space-y-3">
                  {Object.entries(analytics?.examDistribution || {}).sort((a: any, b: any) => b[1] - a[1]).map(([exam, count]: any) => (
                    <div key={exam} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-primary-400" />
                        <span className="font-semibold text-sm uppercase">{exam}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-100 rounded-full h-2">
                          <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${(count / users.length) * 100}%` }} />
                        </div>
                        <span className="text-sm font-bold text-gray-700 w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4 text-gray-900">User Stats Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Avg Focus / User</span>
                    <span className="font-bold">{users.length > 0 ? (totalFocusHours / users.length).toFixed(1) : 0}h</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Users with Streak &gt; 0</span>
                    <span className="font-bold">{users.filter((u: any) => u.current_streak > 0).length}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Users who studied</span>
                    <span className="font-bold">{users.filter((u: any) => u.total_focus_minutes > 0).length}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Highest Streak</span>
                    <span className="font-bold">{Math.max(...users.map((u: any) => u.longest_streak), 0)}d</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Top Focus User</span>
                    <span className="font-bold">{Math.max(...users.map((u: any) => u.total_focus_minutes), 0)} min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========== STORE ========== */}
        {activeTab === 'store' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard label="Total Revenue" value={`₹${totalRevenue}`} icon={TrendingUp} color="green" />
              <StatCard label="Sales Count" value={payments.length} icon={CreditCard} color="blue" />
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="text-sm font-semibold text-gray-500 mb-2">Base Price</div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-900">₹</span>
                  <input type="number" value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-24 text-2xl font-bold border-b-2 border-gray-300 focus:border-primary-500 outline-none" />
                  <button onClick={() => handleAction('UPDATE_PRICE', { price: newPrice }, true)}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800">Update</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* COUPONS */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Tag size={20} /> Coupons</h3>
                <form onSubmit={handleCreateCoupon} className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">Code</label>
                      <input type="text" placeholder="LAUNCH50" value={newCoupon.code}
                        onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm font-semibold uppercase outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">Discount ₹</label>
                      <input type="number" placeholder="50" value={newCoupon.discount || ''}
                        onChange={(e) => setNewCoupon({...newCoupon, discount: Number(e.target.value)})}
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm font-semibold outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">Limit</label>
                      <input type="number" value={newCoupon.maxUses}
                        onChange={(e) => setNewCoupon({...newCoupon, maxUses: Number(e.target.value)})}
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm font-semibold outline-none" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-gray-900 text-white py-2 rounded-lg font-semibold text-sm hover:bg-gray-800">
                    <Plus size={16} className="inline mr-2" /> Create Coupon
                  </button>
                </form>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {coupons.length === 0 ? <p className="text-gray-400 text-sm">No coupons yet</p> : coupons.map((c: any) => (
                    <div key={c.id} className={`flex items-center justify-between p-4 rounded-lg border ${c.is_active ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-50'}`}>
                      <div>
                        <div className="font-bold text-lg text-gray-900">{c.code}</div>
                        <div className="text-xs text-gray-500">-₹{c.discount_amount} · {c.times_used}/{c.max_uses} used</div>
                      </div>
                      <button onClick={() => handleAction('TOGGLE_COUPON', { id: c.id, status: !c.is_active }, true)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${c.is_active ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                        {c.is_active ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* PAYMENTS */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><CreditCard size={20} /> Payment History</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {payments.length === 0 ? <p className="text-gray-400 text-sm">No payments yet</p> : payments.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0">
                      <div>
                        <div className="font-bold text-green-600 text-lg">+₹{p.amount_paid / 100}</div>
                        <div className="text-xs text-gray-400">{new Date(p.created_at).toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        {p.coupon_used && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-semibold block mb-1">{p.coupon_used}</span>}
                        <div className="text-xs text-gray-300 font-mono">{p.user_id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========== SETTINGS ========== */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-6">
            
            {/* FEATURE FLAGS */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-gray-900">
                <Zap size={20} /> Feature Flags
              </h3>
              <div className="space-y-3">
                <FeatureToggle label="Focus Mode" description="Timer and focus sessions" flag="feature_focus_enabled"
                  value={config.feature_focus_enabled} onToggle={(f, v) => handleAction('UPDATE_FEATURE_FLAG', { flag: f, value: v }, true)} />
                <FeatureToggle label="Spaced Review" description="Spaced repetition review system" flag="feature_review_enabled"
                  value={config.feature_review_enabled} onToggle={(f, v) => handleAction('UPDATE_FEATURE_FLAG', { flag: f, value: v }, true)} />
                <FeatureToggle label="Mock Tests" description="Mock test logging" flag="feature_mocks_enabled"
                  value={config.feature_mocks_enabled} onToggle={(f, v) => handleAction('UPDATE_FEATURE_FLAG', { flag: f, value: v }, true)} />
                <FeatureToggle label="AI MCQ Generator" description="AI-powered question generation" flag="feature_mcq_enabled"
                  value={config.feature_mcq_enabled} onToggle={(f, v) => handleAction('UPDATE_FEATURE_FLAG', { flag: f, value: v }, true)} />
                <FeatureToggle label="Companions" description="Guardian & Wraith companions" flag="feature_companions_enabled"
                  value={config.feature_companions_enabled} onToggle={(f, v) => handleAction('UPDATE_FEATURE_FLAG', { flag: f, value: v }, true)} />
                <FeatureToggle label="Insights" description="Analytics and insights page" flag="feature_insights_enabled"
                  value={config.feature_insights_enabled} onToggle={(f, v) => handleAction('UPDATE_FEATURE_FLAG', { flag: f, value: v }, true)} />
              </div>
            </div>

            {/* MAINTENANCE MODE */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-gray-900">
                <Wrench size={20} /> Maintenance Mode
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">Maintenance Mode</div>
                    <div className="text-sm text-gray-500">{config.maintenance_mode ? 'ACTIVE — Users see maintenance page' : 'Off'}</div>
                  </div>
                  <button onClick={() => handleAction('TOGGLE_MAINTENANCE', { enabled: !config.maintenance_mode, message: maintenanceMsg })}
                    className={`${config.maintenance_mode ? 'text-red-500' : 'text-green-600'}`}>
                    {config.maintenance_mode ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                  </button>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-2">Maintenance Message</label>
                  <div className="flex gap-2">
                    <input type="text" value={maintenanceMsg} onChange={(e) => setMaintenanceMsg(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-primary-500/20" />
                    <button onClick={() => handleAction('TOGGLE_MAINTENANCE', { enabled: config.maintenance_mode, message: maintenanceMsg }, true)}
                      className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold">Save</button>
                  </div>
                </div>
              </div>
            </div>

            {/* SYSTEM DEFAULTS */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-gray-900">
                <Settings size={20} /> System Defaults
              </h3>
              <div className="space-y-6">
                {/* Signup toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">Allow Signups</div>
                    <div className="text-sm text-gray-500">Control new registrations</div>
                  </div>
                  <button onClick={() => handleAction('TOGGLE_SIGNUP', { status: !config.signup_active })}
                    className={`text-2xl ${config.signup_active ? 'text-green-600' : 'text-red-500'}`}>
                    {config.signup_active ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                  </button>
                </div>

                {/* Max Users */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-900 mb-2">Maximum Users</div>
                  <div className="flex items-center gap-3">
                    <input type="number" defaultValue={config.max_users}
                      className="w-32 border border-gray-300 rounded-lg p-3 font-semibold text-lg outline-none"
                      onBlur={(e) => handleAction('UPDATE_LIMIT', { limit: Number(e.target.value) }, true)} />
                    <span className="text-gray-400">current: {users.length}</span>
                  </div>
                </div>

                {/* Trial Duration */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-900 mb-1">Default Trial Days</div>
                  <div className="text-sm text-gray-500 mb-3">For new signups</div>
                  <div className="flex items-center gap-3">
                    <input type="number" defaultValue={config.trial_days}
                      className="w-24 border border-gray-300 rounded-lg p-3 font-semibold text-lg outline-none"
                      onBlur={(e) => handleAction('UPDATE_TRIAL_DAYS', { days: Number(e.target.value) }, true)} />
                    <span className="text-gray-400">days</span>
                  </div>
                </div>

                {/* Default Daily Goal */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-900 mb-1">Default Daily Goal</div>
                  <div className="text-sm text-gray-500 mb-3">Default hours for new users</div>
                  <div className="flex items-center gap-3">
                    <input type="number" defaultValue={config.default_daily_goal_hours}
                      className="w-24 border border-gray-300 rounded-lg p-3 font-semibold text-lg outline-none"
                      onBlur={(e) => handleAction('UPDATE_DEFAULT_GOAL', { hours: Number(e.target.value) }, true)} />
                    <span className="text-gray-400">hours/day</span>
                  </div>
                </div>

                {/* XP Multiplier */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-900 mb-1">XP Multiplier</div>
                  <div className="text-sm text-gray-500 mb-3">Global XP multiplier (e.g. 2x for events)</div>
                  <div className="flex items-center gap-3">
                    <input type="number" step="0.1" defaultValue={config.xp_multiplier}
                      className="w-24 border border-gray-300 rounded-lg p-3 font-semibold text-lg outline-none"
                      onBlur={(e) => handleAction('UPDATE_XP_MULTIPLIER', { multiplier: Number(e.target.value) }, true)} />
                    <span className="text-gray-400">x</span>
                  </div>
                </div>

                {/* Base Price */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-900 mb-1">Base Price</div>
                  <div className="text-sm text-gray-500 mb-3">Lifetime access price</div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">₹</span>
                    <input type="number" value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))}
                      className="w-32 border border-gray-300 rounded-lg p-3 font-semibold text-lg outline-none" />
                    <button onClick={() => handleAction('UPDATE_PRICE', { price: newPrice }, true)}
                      className="bg-gray-900 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-800">Save</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
