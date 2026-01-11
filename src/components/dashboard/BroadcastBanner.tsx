'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Megaphone, AlertTriangle, CheckCircle } from 'lucide-react'

export default function BroadcastBanner() {
  const [announcement, setAnnouncement] = useState<any>(null)
  const [visible, setVisible] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchAnnouncement = async () => {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (data) setAnnouncement(data)
    }
    fetchAnnouncement()

    // Realtime Listener: Updates instantly without refresh!
    const channel = supabase
      .channel('announcements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
        fetchAnnouncement()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  if (!announcement || !visible) return null

  // Styles based on type
  const styles = {
    alert: 'bg-red-600 text-white border-red-800',
    success: 'bg-green-600 text-white border-green-800',
    info: 'bg-blue-600 text-white border-blue-800'
  }
  
  const icons = {
    alert: <AlertTriangle size={18} className="animate-pulse" />,
    success: <CheckCircle size={18} />,
    info: <Megaphone size={18} />
  }

  // @ts-ignore
  const currentStyle = styles[announcement.type] || styles.info
  // @ts-ignore
  const currentIcon = icons[announcement.type] || icons.info

  return (
    <div className={`w-full px-4 py-3 mb-6 rounded-lg border-b-4 flex items-center justify-between shadow-lg animate-in slide-in-from-top duration-300 ${currentStyle}`}>
      <div className="flex items-center gap-3 font-bold tracking-wide uppercase text-xs md:text-sm">
        {currentIcon}
        <span>{announcement.message}</span>
      </div>
      <button 
        onClick={() => setVisible(false)}
        className="p-1 hover:bg-black/20 rounded-full transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  )
}