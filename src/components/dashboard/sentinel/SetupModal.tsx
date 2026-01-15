'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, MessageSquare, Smartphone } from 'lucide-react'

export default function SetupModal({ 
  onClose, 
  onOpenSettings 
}: { 
  onClose: () => void, 
  onOpenSettings: () => void 
}) {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Reality Check, 2: Connect Bot
  const [userTarget, setUserTarget] = useState<number>(0) // Hours
  
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

      // We try to find the target in metadata (where Onboarding saves it)
      // If not found, default to 4 hours
      const metaTarget = user.user_metadata?.target_hours || 4
      setUserTarget(Number(metaTarget))
    }
    loadTarget()
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Save to Database
      const { error } = await supabase
        .from('sentinel_settings')
        .upsert({
          user_id: user.id,
          guardian_name: formData.guardianName,
          guardian_chat_id: formData.guardianId,
          is_active: true,
          last_active_at: new Date().toISOString(),
          // Initialize quota logic
          offline_quota_used: 0,
          last_quota_reset_at: new Date().toISOString()
        })

      if (error) throw error

      // 2. ⚡ TRIGGER THE BOT MESSAGE (API Call)
      await fetch('/api/sentinel/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guardianId: formData.guardianId,
          guardianName: formData.guardianName
        })
      })

      // 3. Close & Refresh
      onClose()
      window.location.reload()

    } catch (err) {
      console.error(err)
      alert("Failed to activate. Check console.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      
      <div className="w-full max-w-md bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-2 p-1 hover:bg-gray-100">✕</button>

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

        {/* STEP 1: The Reality Check */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-gray-100 p-4 border-2 border-black text-center">
              <p className="text-xs uppercase font-bold text-gray-500 mb-1">Current Target</p>
              {/* Show decimals for test mode */}
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
                onClick={() => {
                  onClose();        // 1. Close this modal
                  onOpenSettings(); // 2. Open the Settings modal
                }} 
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

        {/* STEP 2: The Bot Connection (IMPROVED INSTRUCTIONS) */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            
            <div className="bg-yellow-50 border-2 border-yellow-400 p-3 text-sm">
                <p className="font-bold flex items-center gap-2 text-yellow-800">
                   <Smartphone size={16}/> REQUIRED STEP:
                </p>
                <ol className="list-decimal pl-4 space-y-1 mt-2 text-yellow-900 text-xs">
                    <li>Open Telegram. Search for your bot name.</li>
                    <li><strong>CLICK THE 'START' BUTTON</strong> inside the chat.</li>
                    <li>If you skip this, the bot <u>cannot</u> message you.</li>
                </ol>
            </div>

            <div className="bg-blue-50 p-3 border-2 border-blue-900 text-xs font-mono">
               <p className="font-bold flex items-center gap-2 text-blue-900 mb-2">
                  <MessageSquare size={14}/> FIND YOUR ID:
               </p>
               <p>Search for <strong>@userinfobot</strong> on Telegram to get your numeric ID.</p>
            </div>

            <div className="mt-4 space-y-3">
                <div>
                <label className="block text-xs font-bold uppercase mb-1">Guardian Name</label>
                <input 
                    type="text"
                    placeholder="e.g. Dad, Mentor, Self"
                    className="w-full p-2 border-2 border-black font-mono text-sm"
                    value={formData.guardianName}
                    onChange={e => setFormData({...formData, guardianName: e.target.value})}
                />
                </div>

                <div>
                <label className="block text-xs font-bold uppercase mb-1">Telegram ID (Number)</label>
                <input 
                    type="text"
                    placeholder="e.g. 123456789"
                    className="w-full p-2 border-2 border-black font-mono text-sm"
                    value={formData.guardianId}
                    onChange={e => setFormData({...formData, guardianId: e.target.value})}
                />
                </div>
            </div>

            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full py-3 bg-red-600 text-white font-bold uppercase border-2 border-black hover:bg-red-500 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
              Activate Protocol
            </button>
          </div>
        )}

      </div>
    </div>
  )
}