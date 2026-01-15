'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, Smartphone, MessageSquare, X } from 'lucide-react'

export default function SetupModal({ 
  onClose, 
  onOpenSettings 
}: { 
  onClose: () => void, 
  onOpenSettings: () => void 
}) {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Reality Check, 2: Connect Bot
  const [userTarget, setUserTarget] = useState<number>(0)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    guardianName: '',
    guardianId: '', 
  })

  const supabase = createClient()

  // 1. Fetch User's Existing Target (The Reality Check)
  useEffect(() => {
    async function loadTarget() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const metaTarget = user.user_metadata?.target_hours || 4
      setUserTarget(Number(metaTarget))
    }
    loadTarget()
  }, [])

  const handleSave = async () => {
    if (!formData.guardianId || !formData.guardianName) return
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Verify Connection (Send Test Message)
      const res = await fetch('/api/sentinel/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guardianId: formData.guardianId,
          guardianName: formData.guardianName
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Connection Failed')

      // 2. Save to Database
      const { error: dbError } = await supabase
        .from('sentinel_settings')
        .upsert({
          user_id: user.id,
          guardian_name: formData.guardianName,
          guardian_chat_id: formData.guardianId,
          is_active: true,
          last_active_at: new Date().toISOString(),
          offline_quota_used: 0,
          last_quota_reset_at: new Date().toISOString()
        })

      if (dbError) throw dbError

      // 3. Close & Refresh
      onClose()
      window.location.reload()

    } catch (err: any) {
      console.error(err)
      setError("Could not message Guardian. Did they START the bot?")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      
      <div className="w-full max-w-md bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-2 p-1 hover:bg-gray-100"><X size={20}/></button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-600 border-2 border-black text-white">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold uppercase tracking-tighter">Protocol Sentinel</h2>
            <p className="text-xs font-mono text-gray-500">Dead Man's Switch</p>
          </div>
        </div>

        {/* STEP 1: The Reality Check (KEPT INT ACT) */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-gray-100 p-4 border-2 border-black text-center">
              <p className="text-xs uppercase font-bold text-gray-500 mb-1">Current Target</p>
              <p className="text-4xl font-black font-mono">{userTarget} HOURS</p>
            </div>

            {userTarget > 8 ? (
              <div className="bg-yellow-50 p-3 border-l-4 border-yellow-400 text-sm flex gap-3">
                <AlertTriangle className="text-yellow-600 shrink-0" />
                <p>
                  <span className="font-bold">REALITY CHECK:</span> {userTarget} hours is "God Mode". 
                  <br/><br/>
                  Are you sure you can sustain this?
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                The Sentinel will trigger if you fail to log <strong>{userTarget} hours</strong> of Deep Work daily.
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button 
                onClick={() => { onClose(); onOpenSettings(); }} 
                className="py-3 text-xs font-bold uppercase border-2 border-black hover:bg-gray-100"
              >
                Lower Target
              </button>
              <button 
                onClick={() => setStep(2)}
                className="py-3 bg-black text-white text-xs font-bold uppercase border-2 border-black hover:bg-white hover:text-black flex items-center justify-center gap-2"
              >
                I accept the Risk <ArrowRight size={14}/>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: The Bot Connection (UPDATED INSTRUCTIONS) */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            
            <div className="bg-yellow-50 border-2 border-yellow-400 p-3 text-xs space-y-2">
                <p className="font-bold text-yellow-800 uppercase flex items-center gap-2">
                    <Smartphone size={14}/> 1. Authorize The Channel
                </p>
                <p className="text-yellow-900 leading-relaxed">
                    Ask your Guardian to search for <span className="font-bold bg-white px-1 border border-yellow-200 select-all">@krama_guardianbot</span> on Telegram and click <span className="font-bold">START</span>.
                </p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 p-3 text-xs space-y-2">
                <p className="font-bold text-blue-800 uppercase flex items-center gap-2">
                    <MessageSquare size={14}/> 2. Get Their ID
                </p>
                <p className="text-blue-900 leading-relaxed">
                    Ask them to search for <span className="font-bold bg-white px-1 border border-blue-200 select-all">@userinfobot</span>. It will reply with a number. Copy that number.
                </p>
            </div>

            <div className="mt-4 space-y-3">
                <div>
                <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Guardian Name</label>
                <input 
                    value={formData.guardianName}
                    onChange={(e) => setFormData({...formData, guardianName: e.target.value})}
                    placeholder="e.g. DAD, PARTNER, BROTHER"
                    className="w-full border-2 border-black p-2 font-bold uppercase text-sm focus:bg-yellow-50 outline-none"
                />
                </div>

                <div>
                <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Paste Their ID Number</label>
                <input 
                    value={formData.guardianId}
                    onChange={(e) => setFormData({...formData, guardianId: e.target.value})}
                    placeholder="e.g. 123456789"
                    className="w-full border-2 border-black p-2 font-mono font-bold text-sm focus:bg-yellow-50 outline-none"
                />
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 p-2 text-xs text-red-600 font-bold text-center">
                  ⚠️ {error}
                </div>
            )}

            <button
              onClick={handleSave}
              disabled={loading || !formData.guardianId || !formData.guardianName}
              className="w-full py-3 bg-red-600 text-white font-bold uppercase border-2 border-black hover:bg-red-500 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
              {loading ? 'Verifying...' : 'Verify & Activate'}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}