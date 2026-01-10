'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Shield, Trash2, Crown, User, LogOut, ArrowLeft } from 'lucide-react'
import { useAlert } from '@/context/AlertContext' // <--- Import

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL

export default function AdminDashboard() {
  const supabase = createClient()
  const router = useRouter()
  const { showAlert } = useAlert() // <--- Use Hook
  
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)

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
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // 2. ACTION HANDLERS
  const handleAction = async (action: string, payload: any) => {
    if (!confirm('Are you sure?')) return

    try {
      setLoading(true)
      await fetch('/api/admin/action', {
        method: 'POST',
        body: JSON.stringify({ action, payload })
      })
      showAlert('Command Executed Successfully', 'success') // <--- Nice Alert
      setRefreshKey(k => k + 1)
    } catch (e) {
      showAlert('Action Failed', 'error')
      setLoading(false)
    }
  }

  // 3. LOGOUT HANDLER
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin"/></div>
  if (!data) return <div className="p-10">Error loading dashboard.</div>

  const { config, users } = data
  const paidUsers = users.filter((u: any) => u.is_premium).length

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-mono text-sm">
      
      {/* HEADER WITH NAVIGATION */}
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between bg-white p-4 shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
            <h1 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
            <Shield size={20} /> Admin
            </h1>
            <span className="bg-gray-100 text-[10px] px-2 py-1 rounded text-gray-500 hidden sm:block">
                {ADMIN_EMAIL}
            </span>
        </div>

        <div className="flex items-center gap-2">
            {/* Back to App */}
            <button 
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 px-3 py-2 text-xs font-bold hover:bg-gray-100 rounded"
            >
                <ArrowLeft size={14}/> <span className="hidden sm:inline">Back to App</span>
            </button>

            {/* Logout */}
            <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 rounded"
            >
                <LogOut size={14}/> Logout
            </button>
        </div>
      </div>

      {/* STATS ROW */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* ... (Stats Cards same as before) ... */}
        <div className="bg-white p-6 border-l-4 border-black shadow-sm">
          <div className="text-gray-400 text-xs uppercase mb-1">Total Users</div>
          <div className="text-3xl font-bold">{users.length}</div>
        </div>
        <div className="bg-white p-6 border-l-4 border-yellow-400 shadow-sm">
           <div className="text-gray-400 text-xs uppercase mb-1">Free / Trial</div>
           <div className="text-3xl font-bold">{users.length - paidUsers}</div>
        </div>
        <div className="bg-white p-6 border-l-4 border-green-500 shadow-sm">
           <div className="text-gray-400 text-xs uppercase mb-1">Premium / Paid</div>
           <div className="text-3xl font-bold text-green-600">{paidUsers}</div>
        </div>
      </div>

      {/* CONFIG PANEL */}
      <div className="max-w-6xl mx-auto bg-white p-6 shadow-sm mb-8 border border-gray-200">
        <h2 className="font-bold uppercase mb-4 border-b pb-2">Global Settings</h2>
        <div className="flex flex-col md:flex-row gap-8">
          
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${config.signup_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div className="flex-1">
              <div className="font-bold">Signups Open?</div>
              <div className="text-xs text-gray-400">{config.signup_active ? 'Users can register' : 'Closed'}</div>
            </div>
            <button 
              onClick={() => handleAction('TOGGLE_SIGNUP', { status: !config.signup_active })}
              className="bg-black text-white px-3 py-1 text-xs hover:bg-gray-800"
            >
              Turn {config.signup_active ? 'OFF' : 'ON'}
            </button>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex-1">
              <div className="font-bold">Max User Limit</div>
              <div className="text-xs text-gray-400">Current: {config.max_users}</div>
            </div>
            <div className="flex gap-1">
               <button onClick={() => handleAction('UPDATE_LIMIT', { limit: 100 })} className="border px-2 py-1 text-xs hover:bg-gray-100">100</button>
               <button onClick={() => handleAction('UPDATE_LIMIT', { limit: 500 })} className="border px-2 py-1 text-xs hover:bg-gray-100">500</button>
               <button onClick={() => handleAction('UPDATE_LIMIT', { limit: 1000 })} className="border px-2 py-1 text-xs hover:bg-gray-100">1000</button>
            </div>
          </div>
        </div>
      </div>

      {/* USER TABLE */}
      <div className="max-w-6xl mx-auto bg-white shadow-sm border border-gray-200 overflow-hidden">
        {/* ... (Table Header) ... */}
        <div className="p-4 border-b bg-gray-50 font-bold uppercase text-xs flex justify-between">
           <span>User Database</span>
           <span>{users.length} Records</span>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs uppercase text-gray-400 border-b">
              <th className="p-4 font-normal">User</th>
              <th className="p-4 font-normal">Joined</th>
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
                <td className="p-4 text-gray-500">
                  {new Date(u.created_at).toLocaleDateString()}
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
                    title="Delete User"
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
  )
}