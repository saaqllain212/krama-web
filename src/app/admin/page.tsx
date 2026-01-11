'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Loader2, Shield, Trash2, Crown, User, LogOut, ArrowLeft, 
  Store, Users, Tag, CreditCard, DollarSign 
} from 'lucide-react'
import { useAlert } from '@/context/AlertContext'
// ✅ IMPORT TIMEKEEPER & HARVESTER
import Timekeeper from '@/components/admin/Timekeeper'
import Harvester from '@/components/admin/Harvester'
import BroadcastManager from '@/components/admin/BroadcastManager'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL

export default function AdminDashboard() {
  const supabase = createClient()
  const router = useRouter()
  const { showAlert } = useAlert()
  
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState<'users' | 'store'>('users')
  
  // Form State for Coupons
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: 0, maxUses: 10 })
  const [newPrice, setNewPrice] = useState<number>(0)

  // 1. INITIAL LOAD
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
    } finally {
      setLoading(false)
    }
  }

  // 2. ACTION HANDLER
  const handleAction = async (action: string, payload: any) => {
    if (!confirm('Are you sure?')) return

    try {
      setLoading(true)
      await fetch('/api/admin/action', {
        method: 'POST',
        body: JSON.stringify({ action, payload })
      })
      showAlert('Command Executed', 'success')
      setRefreshKey(k => k + 1)
    } catch (e) {
      showAlert('Action Failed', 'error')
      setLoading(false)
    }
  }

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    handleAction('CREATE_COUPON', newCoupon)
    setNewCoupon({ code: '', discount: 0, maxUses: 10 })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading && !data) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin"/></div>
  if (!data) return <div className="p-10">Error loading dashboard.</div>

  const { config, users, payments, coupons, storeSettings } = data
  const paidUsers = users.filter((u: any) => u.is_premium).length
  const totalRevenue = payments.reduce((sum: number, p: any) => sum + (p.amount_paid / 100), 0)

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-mono text-sm">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row items-center justify-between bg-white p-4 shadow-sm border border-gray-200 gap-4">
        <div className="flex items-center gap-4">
            <h1 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
            <Shield size={20} /> Admin
            </h1>
            <span className="bg-gray-100 text-[10px] px-2 py-1 rounded text-gray-500 hidden sm:block">
                {ADMIN_EMAIL}
            </span>
        </div>

        <div className="flex items-center gap-2">
            <button 
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 px-3 py-2 text-xs font-bold hover:bg-gray-100 rounded"
            >
                <ArrowLeft size={14}/> Back
            </button>
            <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 rounded"
            >
                <LogOut size={14}/> Logout
            </button>
        </div>
      </div>

      {/* TABS */}
      <div className="max-w-6xl mx-auto mb-6 flex gap-4 border-b-2 border-gray-200">
         <button 
           onClick={() => setActiveTab('users')}
           className={`pb-2 px-4 font-bold uppercase flex items-center gap-2 ${activeTab === 'users' ? 'border-b-4 border-black text-black' : 'text-gray-400'}`}
         >
           <Users size={16} /> Users & Access
         </button>
         <button 
           onClick={() => setActiveTab('store')}
           className={`pb-2 px-4 font-bold uppercase flex items-center gap-2 ${activeTab === 'store' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-400'}`}
         >
           <Store size={16} /> Store & Revenue
         </button>
      </div>

      {/* === TAB 1: USERS === */}
      {activeTab === 'users' && (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
           
           {/* ✅ TOOLBAR: EXPORT BUTTON */}
           <div className="flex justify-end">
              <Harvester users={users} />
           </div>

           {/* STATS */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 border-l-4 border-black shadow-sm">
              <div className="text-gray-400 text-xs uppercase mb-1">Total Users</div>
              <div className="text-3xl font-bold">{users.length}</div>
            </div>
            <div className="bg-white p-6 border-l-4 border-yellow-400 shadow-sm">
              <div className="text-gray-400 text-xs uppercase mb-1">Free / Trial</div>
              <div className="text-3xl font-bold">{users.length - paidUsers}</div>
            </div>
            <div className="bg-white p-6 border-l-4 border-green-500 shadow-sm">
              <div className="text-gray-400 text-xs uppercase mb-1">Premium</div>
              <div className="text-3xl font-bold text-green-600">{paidUsers}</div>
            </div>
          </div>

          {/* GLOBAL TOGGLES */}
          <div className="bg-white p-6 shadow-sm border border-gray-200">
            <h2 className="font-bold uppercase mb-4 border-b pb-2">Global Settings</h2>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${config.signup_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div className="flex-1">
                  <div className="font-bold">Signups Open?</div>
                  <div className="text-xs text-gray-400">{config.signup_active ? 'Active' : 'Closed'}</div>
                </div>
                <button 
                  onClick={() => handleAction('TOGGLE_SIGNUP', { status: !config.signup_active })}
                  className="bg-black text-white px-3 py-1 text-xs hover:bg-gray-800"
                >
                  Toggle
                </button>
              </div>

              <div className="flex items-center gap-4">
                 <div className="flex-1">
                  <div className="font-bold">Max User Limit</div>
                  <div className="text-xs text-gray-400">Current: {config.max_users}</div>
                </div>
                <div className="flex gap-1">
                   {[100, 500, 1000].map(limit => (
                     <button 
                       key={limit}
                       onClick={() => handleAction('UPDATE_LIMIT', { limit })} 
                       className="border px-2 py-1 text-xs hover:bg-gray-100"
                     >
                       {limit}
                     </button>
                   ))}
                </div>
              </div>
            </div>
          </div>


          {/* ✅ NEW: BROADCAST MANAGER */}
          <BroadcastManager adminEmail={ADMIN_EMAIL!} />

          {/* USER TABLE */}
          <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b bg-gray-50 font-bold uppercase text-xs flex justify-between">
              <span>User Database</span>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs uppercase text-gray-400 border-b">
                  <th className="p-4 font-normal">User</th>
                  <th className="p-4 font-normal">Access Control</th>
                  <th className="p-4 font-normal">Status</th>
                  <th className="p-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-bold">{u.email}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{u.id}</div>
                    </td>
                    {/* ✅ TIMEKEEPER COMPONENT - NOW PASSING isPremium */}
                    <td className="p-4">
                       <Timekeeper 
                          userId={u.id} 
                          currentTrialEnd={u.trial_ends_at} 
                          onUpdate={() => setRefreshKey(k => k + 1)} 
                          adminEmail={ADMIN_EMAIL!}
                          isPremium={u.is_premium} 
                       />
                    </td>
                    <td className="p-4">
                      {u.is_premium ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold uppercase">
                          <Crown size={12}/> Premium
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-bold uppercase">
                          <User size={12}/> Free
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => handleAction('TOGGLE_PREMIUM', { userId: u.id, status: !u.is_premium })}
                        className="text-xs underline hover:text-blue-600"
                      >
                        {u.is_premium ? 'Downgrade' : 'Gift Premium'}
                      </button>
                      <button 
                        onClick={() => handleAction('DELETE_USER', { userId: u.id })}
                        className="text-gray-400 hover:text-red-600 ml-4"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === TAB 2: STORE === */}
      {activeTab === 'store' && (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
           
           {/* REVENUE STATS */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-white p-6 border-l-4 border-blue-600 shadow-sm">
                <div className="text-gray-400 text-xs uppercase mb-1">Total Revenue</div>
                <div className="text-3xl font-bold flex items-center">
                   <span className="text-lg text-gray-400 mr-1">₹</span> {totalRevenue}
                </div>
             </div>
             <div className="bg-white p-6 border-l-4 border-indigo-600 shadow-sm">
                <div className="text-gray-400 text-xs uppercase mb-1">Sales Count</div>
                <div className="text-3xl font-bold">{payments.length}</div>
             </div>
             
             {/* PRICE CONTROL */}
             <div className="bg-white p-6 border-l-4 border-black shadow-sm flex flex-col justify-between">
                <div className="text-gray-400 text-xs uppercase mb-1">Base Price (₹)</div>
                <div className="flex gap-2">
                   <input 
                     type="number" 
                     value={newPrice}
                     onChange={(e) => setNewPrice(Number(e.target.value))}
                     className="w-24 border-b-2 border-black text-2xl font-bold focus:outline-none"
                   />
                   <button 
                     onClick={() => handleAction('UPDATE_PRICE', { price: newPrice })}
                     className="bg-black text-white px-3 text-xs font-bold uppercase hover:bg-gray-800"
                   >
                     Update
                   </button>
                </div>
             </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* COUPONS MANAGER */}
              <div className="bg-white p-6 shadow-sm border border-gray-200">
                 <h2 className="font-bold uppercase mb-4 flex items-center gap-2">
                    <Tag size={18} /> Coupons
                 </h2>
                 
                 <form onSubmit={handleCreateCoupon} className="mb-6 bg-gray-50 p-4 rounded flex gap-2 items-end">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-500">Code</label>
                      <input required type="text" placeholder="LAUNCH50" className="w-full border p-2 text-sm uppercase" 
                        value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-500">Discount (₹)</label>
                      <input required type="number" placeholder="50" className="w-24 border p-2 text-sm"
                        value={newCoupon.discount} onChange={e => setNewCoupon({...newCoupon, discount: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-500">Limit</label>
                      <input required type="number" placeholder="100" className="w-20 border p-2 text-sm"
                         value={newCoupon.maxUses} onChange={e => setNewCoupon({...newCoupon, maxUses: Number(e.target.value)})}
                      />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 text-sm font-bold uppercase hover:bg-blue-700">
                      Add
                    </button>
                 </form>

                 <div className="space-y-2">
                    {coupons.map((c: any) => (
                       <div key={c.id} className={`flex items-center justify-between p-3 border ${!c.is_active ? 'opacity-50 bg-gray-100' : 'bg-white'}`}>
                          <div>
                             <div className="font-bold text-lg">{c.code}</div>
                             <div className="text-xs text-gray-500">
                               -₹{c.discount_amount} | Used: {c.times_used} / {c.max_uses}
                             </div>
                          </div>
                          <button 
                            onClick={() => handleAction('TOGGLE_COUPON', { id: c.id, status: !c.is_active })}
                            className={`text-xs px-2 py-1 font-bold border ${c.is_active ? 'text-red-600 border-red-200' : 'text-green-600 border-green-200'}`}
                          >
                             {c.is_active ? 'Disable' : 'Enable'}
                          </button>
                       </div>
                    ))}
                    {coupons.length === 0 && <p className="text-gray-400 italic text-sm">No coupons yet.</p>}
                 </div>
              </div>

              {/* RECENT PAYMENTS */}
              <div className="bg-white p-6 shadow-sm border border-gray-200">
                 <h2 className="font-bold uppercase mb-4 flex items-center gap-2">
                    <CreditCard size={18} /> Recent Receipts
                 </h2>
                 <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {payments.map((p: any) => (
                       <div key={p.id} className="flex items-center justify-between p-3 border-b last:border-0">
                          <div>
                             <div className="font-bold text-green-700">
                                + ₹{p.amount_paid / 100}
                             </div>
                             <div className="text-[10px] text-gray-400 font-mono">
                                {new Date(p.created_at).toLocaleString()}
                             </div>
                          </div>
                          <div className="text-right">
                             {p.coupon_used && (
                               <span className="bg-yellow-100 text-yellow-800 text-[10px] px-1 py-0.5 rounded font-bold">
                                 {p.coupon_used}
                               </span>
                             )}
                             <div className="text-[10px] text-gray-400 font-mono mt-1">
                               {p.user_id.slice(0, 8)}...
                             </div>
                          </div>
                       </div>
                    ))}
                    {payments.length === 0 && <p className="text-gray-400 italic text-sm">No payments yet.</p>}
                 </div>
              </div>

           </div>
        </div>
      )}

    </div>
  )
}