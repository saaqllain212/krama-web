'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Loader2, Shield, Trash2, Crown, User, LogOut, ArrowLeft, 
  Store, Users, Tag, CreditCard, TrendingUp, Activity,
  Plus, ToggleLeft, ToggleRight, Settings,
  RefreshCw, Search, X
} from 'lucide-react'
import { useAlert } from '@/context/AlertContext'
import Timekeeper from '@/components/admin/Timekeeper'
import Harvester from '@/components/admin/Harvester'
import BroadcastManager from '@/components/admin/BroadcastManager'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL

export default function AdminDashboard() {
  const supabase = createClient()
  const router = useRouter()
  const { showAlert, askConfirm } = useAlert()
  
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'store' | 'settings'>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: 0, maxUses: 10 })
  const [newPrice, setNewPrice] = useState<number>(0)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/')
        return
      }
      fetchData()
    }
    init()
  }, [refreshKey])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/data', { method: 'POST' })
      if (!res.ok) throw new Error('Failed')
      const json = await res.json()
      setData(json)
      setNewPrice(json.storeSettings?.base_price || 299)
    } catch (e) {
      console.error(e)
      showAlert('Failed to load data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: string, payload: any, skipConfirm = false) => {
    if (!skipConfirm) {
      askConfirm('Are you sure?', async () => {
        await executeAction(action, payload)
      })
    } else {
      await executeAction(action, payload)
    }
  }

  const executeAction = async (action: string, payload: any) => {
    try {
      setLoading(true)
      await fetch('/api/admin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload })
      })
      showAlert('Action completed', 'success')
      setRefreshKey(k => k + 1)
    } catch (e) {
      showAlert('Action failed', 'error')
      setLoading(false)
    }
  }

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCoupon.code || newCoupon.discount <= 0) {
      showAlert('Please fill all fields', 'error')
      return
    }
    await executeAction('CREATE_COUPON', newCoupon)
    setNewCoupon({ code: '', discount: 0, maxUses: 10 })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const refresh = () => setRefreshKey(k => k + 1)

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="font-medium text-gray-400">Loading admin...</p>
        </div>
      </div>
    )
  }

  if (!data) return <div className="p-10 font-bold text-gray-500">Error loading dashboard.</div>

  const { config, users, payments, coupons, storeSettings } = data
  const paidUsers = users.filter((u: any) => u.is_premium).length
  const freeUsers = users.length - paidUsers
  const totalRevenue = payments.reduce((sum: number, p: any) => sum + (p.amount_paid / 100), 0)

  const filteredUsers = searchQuery 
    ? users.filter((u: any) => u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    : users

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      
      {/* HEADER */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-primary-500 to-purple-500 text-white p-2 rounded-lg">
              <Shield size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Console</h1>
              <p className="text-xs text-gray-400">{ADMIN_EMAIL}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={refresh}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin text-gray-400' : 'text-gray-500'} />
            </button>
            <button 
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={16}/> Dashboard
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            >
              <LogOut size={16}/>
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex gap-1">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'store', label: 'Store', icon: Store },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === tab.id 
                  ? 'border-primary-500 text-primary-600' 
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        
        {/* === OVERVIEW TAB === */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Users" value={users.length} icon={Users} color="gray" />
              <StatCard label="Premium" value={paidUsers} icon={Crown} color="green" />
              <StatCard label="Free/Trial" value={freeUsers} icon={User} color="amber" />
              <StatCard label="Revenue" value={`₹${totalRevenue}`} icon={TrendingUp} color="blue" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SYSTEM STATUS */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-6 text-gray-900">System Status</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-900">Signups</div>
                      <div className="text-sm text-gray-500">
                        {config.signup_active ? 'Open for new users' : 'Currently closed'}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAction('TOGGLE_SIGNUP', { status: !config.signup_active })}
                      className={`p-2 ${config.signup_active ? 'text-green-600' : 'text-red-500'}`}
                    >
                      {config.signup_active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-900">User Limit</div>
                      <div className="text-sm text-gray-500">
                        {users.length} / {config.max_users} users
                      </div>
                    </div>
                    <input 
                      type="number" 
                      value={config.max_users}
                      onChange={(e) => handleAction('UPDATE_LIMIT', { limit: Number(e.target.value) }, true)}
                      className="w-20 border border-gray-300 rounded-lg p-2 font-semibold text-center focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* RECENT PAYMENTS */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4 text-gray-900">Recent Payments</h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {payments.length === 0 ? (
                    <p className="text-gray-400 text-sm">No payments yet</p>
                  ) : (
                    payments.slice(0, 5).map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-bold text-green-600">+₹{p.amount_paid / 100}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(p.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        {p.coupon_used && (
                          <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-semibold">
                            {p.coupon_used}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <BroadcastManager adminEmail={ADMIN_EMAIL!} />
          </div>
        )}

        {/* === USERS TAB === */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full border border-gray-300 rounded-lg p-3 pl-10 font-medium text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={18} />
                  </button>
                )}
              </div>
              <Harvester users={users} />
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
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-semibold text-gray-900">{u.email}</div>
                          <div className="text-xs text-gray-400 font-mono">{u.id.slice(0, 8)}...</div>
                        </td>
                        <td className="p-4">
                          <Timekeeper 
                            userId={u.id} 
                            currentTrialEnd={u.trial_ends_at} 
                            onUpdate={refresh} 
                            adminEmail={ADMIN_EMAIL!}
                            isPremium={u.is_premium} 
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
                            <button 
                              onClick={() => handleAction('TOGGLE_PREMIUM', { userId: u.id, status: !u.is_premium })}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 hover:border-gray-400 transition-colors"
                            >
                              {u.is_premium ? 'Downgrade' : 'Upgrade'}
                            </button>
                            <button 
                              onClick={() => handleAction('DELETE_USER', { userId: u.id })}
                              className="p-2 text-gray-300 hover:text-red-500 transition-colors rounded-lg"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* === STORE TAB === */}
        {activeTab === 'store' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard label="Total Revenue" value={`₹${totalRevenue}`} icon={TrendingUp} color="green" />
              <StatCard label="Sales Count" value={payments.length} icon={CreditCard} color="blue" />
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="text-sm font-semibold text-gray-500 mb-2">Base Price</div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-900">₹</span>
                  <input 
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-24 text-2xl font-bold border-b-2 border-gray-300 focus:border-primary-500 outline-none transition-colors"
                  />
                  <button 
                    onClick={() => handleAction('UPDATE_PRICE', { price: newPrice }, true)}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* COUPONS */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-gray-900">
                  <Tag size={20} /> Coupons
                </h3>
                
                <form onSubmit={handleCreateCoupon} className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">Code</label>
                      <input 
                        type="text"
                        placeholder="LAUNCH50"
                        value={newCoupon.code}
                        onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm font-semibold uppercase focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">Discount ₹</label>
                      <input 
                        type="number"
                        placeholder="50"
                        value={newCoupon.discount || ''}
                        onChange={(e) => setNewCoupon({...newCoupon, discount: Number(e.target.value)})}
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">Limit</label>
                      <input 
                        type="number"
                        value={newCoupon.maxUses}
                        onChange={(e) => setNewCoupon({...newCoupon, maxUses: Number(e.target.value)})}
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none"
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-gray-900 text-white py-2 rounded-lg font-semibold text-sm hover:bg-gray-800 transition-colors">
                    <Plus size={16} className="inline mr-2" /> Create Coupon
                  </button>
                </form>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {coupons.length === 0 ? (
                    <p className="text-gray-400 text-sm">No coupons yet</p>
                  ) : (
                    coupons.map((c: any) => (
                      <div 
                        key={c.id} 
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          c.is_active ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-50'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-lg text-gray-900">{c.code}</div>
                          <div className="text-xs text-gray-500">
                            -₹{c.discount_amount} · {c.times_used}/{c.max_uses} used
                          </div>
                        </div>
                        <button 
                          onClick={() => handleAction('TOGGLE_COUPON', { id: c.id, status: !c.is_active }, true)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                            c.is_active ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {c.is_active ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* PAYMENTS HISTORY */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-gray-900">
                  <CreditCard size={20} /> Payment History
                </h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {payments.length === 0 ? (
                    <p className="text-gray-400 text-sm">No payments yet</p>
                  ) : (
                    payments.map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0">
                        <div>
                          <div className="font-bold text-green-600 text-lg">+₹{p.amount_paid / 100}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(p.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          {p.coupon_used && (
                            <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-semibold block mb-1">
                              {p.coupon_used}
                            </span>
                          )}
                          <div className="text-xs text-gray-300 font-mono">
                            {p.user_id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === SETTINGS TAB === */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-6 text-gray-900">System Settings</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">Allow Signups</div>
                    <div className="text-sm text-gray-500">Control whether new users can register</div>
                  </div>
                  <button 
                    onClick={() => handleAction('TOGGLE_SIGNUP', { status: !config.signup_active })}
                    className={`text-2xl ${config.signup_active ? 'text-green-600' : 'text-red-500'}`}
                  >
                    {config.signup_active ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                  </button>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-900 mb-2">Maximum Users</div>
                  <div className="text-sm text-gray-500 mb-4">Limit total registered users</div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number"
                      defaultValue={config.max_users}
                      className="w-32 border border-gray-300 rounded-lg p-3 font-semibold text-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none"
                      onBlur={(e) => handleAction('UPDATE_LIMIT', { limit: Number(e.target.value) }, true)}
                    />
                    <span className="text-gray-400">current: {users.length}</span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-900 mb-2">Base Price</div>
                  <div className="text-sm text-gray-500 mb-4">Default price for lifetime access</div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-900">₹</span>
                    <input 
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(Number(e.target.value))}
                      className="w-32 border border-gray-300 rounded-lg p-3 font-semibold text-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none"
                    />
                    <button 
                      onClick={() => handleAction('UPDATE_PRICE', { price: newPrice }, true)}
                      className="bg-gray-900 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                    >
                      Save
                    </button>
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

function StatCard({ label, value, icon: Icon, color }: { 
  label: string
  value: string | number
  icon: any
  color: 'gray' | 'green' | 'amber' | 'blue' 
}) {
  const colors = {
    gray: 'border-l-gray-400',
    green: 'border-l-green-500',
    amber: 'border-l-amber-500',
    blue: 'border-l-blue-500',
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
