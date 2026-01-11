'use client'

import { useState, useEffect } from 'react'
import { Megaphone, Send, Trash2, Power, Loader2 } from 'lucide-react'

interface BroadcastManagerProps {
  adminEmail: string
}

export default function BroadcastManager({ adminEmail }: BroadcastManagerProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [type, setType] = useState('info') // info, alert, success
  const [loading, setLoading] = useState(false)

  // Fetch on load
  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    const res = await fetch('/api/admin/broadcast')
    if (res.ok) setMessages(await res.json())
  }

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage) return

    setLoading(true)
    await fetch('/api/admin/broadcast', {
      method: 'POST',
      body: JSON.stringify({ message: newMessage, type, adminEmail })
    })
    setNewMessage('')
    setLoading(false)
    fetchMessages()
  }

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    // Optimistic Update
    setMessages(msgs => msgs.map(m => m.id === id ? { ...m, is_active: !currentStatus } : m))
    
    await fetch('/api/admin/broadcast', {
      method: 'PATCH',
      body: JSON.stringify({ id, is_active: !currentStatus, adminEmail })
    })
    fetchMessages() // Refresh to ensure one-at-a-time rule
  }

  return (
    <div className="bg-white p-6 shadow-sm border border-gray-200">
      <h2 className="font-bold uppercase mb-4 flex items-center gap-2">
        <Megaphone size={18} /> Broadcast System
      </h2>

      {/* CREATE FORM */}
      <form onSubmit={handlePost} className="flex flex-col md:flex-row gap-2 mb-6 bg-gray-50 p-4 rounded">
        <select 
          value={type} 
          onChange={(e) => setType(e.target.value)}
          className="border p-2 text-sm font-bold uppercase rounded"
        >
          <option value="info">Info (Blue)</option>
          <option value="alert">Alert (Red)</option>
          <option value="success">Success (Green)</option>
        </select>
        
        <input 
          type="text" 
          placeholder="Type announcement here..." 
          className="flex-1 border p-2 text-sm rounded"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        
        <button 
          type="submit" 
          disabled={loading}
          className="bg-black text-white px-4 py-2 font-bold uppercase text-xs rounded hover:bg-gray-800 flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />} Post
        </button>
      </form>

      {/* MESSAGE HISTORY */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-center justify-between p-3 border rounded ${msg.is_active ? 'bg-white border-black' : 'bg-gray-100 opacity-60'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${msg.type === 'alert' ? 'bg-red-500' : msg.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`} />
              <div>
                <div className="text-sm font-medium">{msg.message}</div>
                <div className="text-[10px] text-gray-400">
                  {new Date(msg.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => toggleStatus(msg.id, msg.is_active)}
              className={`p-2 rounded-full hover:bg-gray-200 ${msg.is_active ? 'text-green-600' : 'text-gray-400'}`}
              title={msg.is_active ? "Deactivate" : "Activate"}
            >
              <Power size={16} />
            </button>
          </div>
        ))}
        {messages.length === 0 && <p className="text-gray-400 text-xs italic">No announcements yet.</p>}
      </div>
    </div>
  )
}