'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Loader2, Shield, Trash2, Crown, User, LogOut, ArrowLeft, 
  Store, Users, Tag, CreditCard, TrendingUp, Activity,
  Plus, ToggleLeft, ToggleRight, Download, Bell, Settings,
  ChevronDown, RefreshCw, Search, X
} from 'lucide-react'
import { useAlert } from '@/context/AlertContext'
import { motion, AnimatePresence } from 'framer-motion'
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
  
  // Form State
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
      <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-bold text-black/50">Loading admin...</p>
        </div>
      </div>
    )
  }

  if (!data) return <div className="p-10 font-bold">Error loading dashboard.</div>

  const { config, users, payments, coupons, storeSettings } = data
  const paidUsers = users.filter((u: any) => u.is_premium).length
  const freeUsers = users.length - paidUsers
  const totalRevenue = payments.reduce((sum: number, p: any) => sum + (p.amount_paid / 100), 0)

  // Filter users by search
  const filteredUsers = searchQuery 
    ? users.filter((u: any) => u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    : users

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-black">
      
      {/* HEADER */}
      <header className="border-b-2 border-black bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-black text-white p-2">
              <Shield size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">Admin Console</h1>
              <p className="text-xs font-bold text-black/40">{ADMIN_EMAIL}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={refresh}
              disabled={loading}
              className="p-2 hover:bg-stone-100 transition-colors"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold hover:bg-stone-100 transition-colors"
            >
              <ArrowLeft size={16}/> Dashboard
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
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
              className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
                activeTab === tab.id 
                  ? 'border-black text-black' 
                  : 'border-transparent text-black/40 hover:text-black'
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
            {/* STATS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard 
                label="Total Users" 
                value={users.length} 
                icon={Users}
                color="black"
              />
              <StatCard 
                label="Premium" 
                value={paidUsers} 
                icon={Crown}
                color="green"
              />
              <StatCard 
                label="Free/Trial" 
                value={freeUsers} 
                icon={User}
                color="amber"
              />
              <StatCard 
                label="Revenue" 
                value={`₹${totalRevenue}`} 
                icon={TrendingUp}
                color="blue"
              />
            </div>

            {/* QUICK ACTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SYSTEM STATUS */}
              <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#000]">
                <h3 className="font-black text-lg mb-6">System Status</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-stone-50 border border-stone-200">
                    <div>
                      <div className="font-bold">Signups</div>
                      <div className="text-sm text-black/50">
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

                  <div className="flex items-center justify-between p-4 bg-stone-50 border border-stone-200">
                    <div>
                      <div className="font-bold">User Limit</div>
                      <div className="text-sm text-black/50">
                        {users.length} / {config.max_users} users
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={config.max_users}
                        onChange={(e) => handleAction('UPDATE_LIMIT', { limit: Number(e.target.value) }, true)}
                        className="w-20 border-2 border-black p-2 font-bold text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* RECENT PAYMENTS */}
              <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#000]">
                <h3 className="font-black text-lg mb-4">Recent Payments</h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {payments.length === 0 ? (
                    <p className="text-black/40 text-sm">No payments yet</p>
                  ) : (
                    payments.slice(0, 5).map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-stone-50">
                        <div>
                          <div className="font-bold text-green-600">+₹{p.amount_paid / 100}</div>
                          <div className="text-xs text-black/40">
                            {new Date(p.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        {p.coupon_used && (
                          <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 font-bold">
                            {p.coupon_used}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* BROADCAST MANAGER */}
            <BroadcastManager adminEmail={ADMIN_EMAIL!} />
          </div>
        )}

        {/* === USERS TAB === */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* TOOLBAR */}
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" size={18} />
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full border-2 border-black p-3 pl-10 font-bold text-sm"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X size={18} />
                  </button>
                )}
              </div>
              <Harvester users={users} />
            </div>

            {/* USERS TABLE */}
            <div className="bg-white border-2 border-black shadow-[4px_4px_0_0_#000] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-stone-100 border-b-2 border-black">
                    <tr>
                      <th className="p-4 text-left text-xs font-black uppercase">User</th>
                      <th className="p-4 text-left text-xs font-black uppercase">Trial/Access</th>
                      <th className="p-4 text-left text-xs font-black uppercase">Status</th>
                      <th className="p-4 text-right text-xs font-black uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {filteredUsers.map((u: any) => (
                      <tr key={u.id} className="hover:bg-stone-50">
                        <td className="p-4">
                          <div className="font-bold">{u.email}</div>
                          <div className="text-xs text-black/40 font-mono">{u.id.slice(0, 8)}...</div>
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
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 text-xs font-bold">
                              <Crown size={12}/> Premium
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-600 px-3 py-1 text-xs font-bold">
                              <User size={12}/> Free
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleAction('TOGGLE_PREMIUM', { userId: u.id, status: !u.is_premium })}
                              className="px-3 py-1 text-xs font-bold border border-black/20 hover:border-black"
                            >
                              {u.is_premium ? 'Downgrade' : 'Upgrade'}
                            </button>
                            <button 
                              onClick={() => handleAction('DELETE_USER', { userId: u.id })}
                              className="p-2 text-black/30 hover:text-red-600"
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
            {/* REVENUE STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard label="Total Revenue" value={`₹${totalRevenue}`} icon={TrendingUp} color="green" />
              <StatCard label="Sales Count" value={payments.length} icon={CreditCard} color="blue" />
              <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#000]">
                <div className="text-sm font-bold text-black/50 mb-2">Base Price</div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black">₹</span>
                  <input 
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-24 text-2xl font-black border-b-2 border-black focus:outline-none"
                  />
                  <button 
                    onClick={() => handleAction('UPDATE_PRICE', { price: newPrice }, true)}
                    className="bg-black text-white px-4 py-2 text-sm font-bold"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>

            {/* COUPONS & PAYMENTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* COUPONS */}
              <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#000]">
                <h3 className="font-black text-lg mb-6 flex items-center gap-2">
                  <Tag size={20} /> Coupons
                </h3>
                
                {/* CREATE FORM */}
                <form onSubmit={handleCreateCoupon} className="bg-stone-50 p-4 border border-stone-200 mb-6">
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="text-xs font-bold text-black/50 block mb-1">Code</label>
                      <input 
                        type="text"
                        placeholder="LAUNCH50"
                        value={newCoupon.code}
                        onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                        className="w-full border-2 border-black p-2 text-sm font-bold uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-black/50 block mb-1">Discount ₹</label>
                      <input 
                        type="number"
                        placeholder="50"
                        value={newCoupon.discount || ''}
                        onChange={(e) => setNewCoupon({...newCoupon, discount: Number(e.target.value)})}
                        className="w-full border-2 border-black p-2 text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-black/50 block mb-1">Limit</label>
                      <input 
                        type="number"
                        value={newCoupon.maxUses}
                        onChange={(e) => setNewCoupon({...newCoupon, maxUses: Number(e.target.value)})}
                        className="w-full border-2 border-black p-2 text-sm font-bold"
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-black text-white py-2 font-bold text-sm">
                    <Plus size={16} className="inline mr-2" /> Create Coupon
                  </button>
                </form>

                {/* COUPONS LIST */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {coupons.length === 0 ? (
                    <p className="text-black/40 text-sm">No coupons yet</p>
                  ) : (
                    coupons.map((c: any) => (
                      <div 
                        key={c.id} 
                        className={`flex items-center justify-between p-4 border-2 ${
                          c.is_active ? 'border-black bg-white' : 'border-stone-200 bg-stone-100 opacity-50'
                        }`}
                      >
                        <div>
                          <div className="font-black text-lg">{c.code}</div>
                          <div className="text-xs text-black/50">
                            -₹{c.discount_amount} • {c.times_used}/{c.max_uses} used
                          </div>
                        </div>
                        <button 
                          onClick={() => handleAction('TOGGLE_COUPON', { id: c.id, status: !c.is_active }, true)}
                          className={`px-3 py-1 text-xs font-bold border ${
                            c.is_active ? 'border-red-300 text-red-600' : 'border-green-300 text-green-600'
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
              <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#000]">
                <h3 className="font-black text-lg mb-6 flex items-center gap-2">
                  <CreditCard size={20} /> Payment History
                </h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {payments.length === 0 ? (
                    <p className="text-black/40 text-sm">No payments yet</p>
                  ) : (
                    payments.map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between p-4 border-b border-stone-100 last:border-0">
                        <div>
                          <div className="font-bold text-green-600 text-lg">+₹{p.amount_paid / 100}</div>
                          <div className="text-xs text-black/40">
                            {new Date(p.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          {p.coupon_used && (
                            <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 font-bold block mb-1">
                              {p.coupon_used}
                            </span>
                          )}
                          <div className="text-xs text-black/30 font-mono">
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
            <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#000]">
              <h3 className="font-black text-lg mb-6">System Settings</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border-2 border-black/10">
                  <div>
                    <div className="font-bold">Allow Signups</div>
                    <div className="text-sm text-black/50">Control whether new users can register</div>
                  </div>
                  <button 
                    onClick={() => handleAction('TOGGLE_SIGNUP', { status: !config.signup_active })}
                    className={`text-2xl ${config.signup_active ? 'text-green-600' : 'text-red-500'}`}
                  >
                    {config.signup_active ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                  </button>
                </div>

                <div className="p-4 border-2 border-black/10">
                  <div className="font-bold mb-2">Maximum Users</div>
                  <div className="text-sm text-black/50 mb-4">Limit total registered users</div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number"
                      defaultValue={config.max_users}
                      className="w-32 border-2 border-black p-3 font-bold text-lg"
                      onBlur={(e) => handleAction('UPDATE_LIMIT', { limit: Number(e.target.value) }, true)}
                    />
                    <span className="text-black/50">current: {users.length}</span>
                  </div>
                </div>

                <div className="p-4 border-2 border-black/10">
                  <div className="font-bold mb-2">Base Price</div>
                  <div className="text-sm text-black/50 mb-4">Default price for lifetime access</div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">₹</span>
                    <input 
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(Number(e.target.value))}
                      className="w-32 border-2 border-black p-3 font-bold text-lg"
                    />
                    <button 
                      onClick={() => handleAction('UPDATE_PRICE', { price: newPrice }, true)}
                      className="bg-black text-white px-4 py-3 font-bold"
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

// --- STAT CARD COMPONENT ---
function StatCard({ label, value, icon: Icon, color }: { 
  label: string
  value: string | number
  icon: any
  color: 'black' | 'green' | 'amber' | 'blue' 
}) {
  const colors = {
    black: 'border-l-black',
    green: 'border-l-green-500',
    amber: 'border-l-amber-500',
    blue: 'border-l-blue-500',
  }
  
  return (
    <div className={`bg-white border-2 border-black border-l-4 ${colors[color]} p-6 shadow-[4px_4px_0_0_#000]`}>
      <div className="flex items-center gap-2 text-black/50 text-sm font-bold mb-2">
        <Icon size={16} /> {label}
      </div>
      <div className="text-3xl font-black">{value}</div>
    </div>
  )
}
