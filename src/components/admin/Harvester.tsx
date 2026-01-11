'use client'

import { Download } from 'lucide-react'

interface HarvesterProps {
  users: any[]
}

export default function Harvester({ users }: HarvesterProps) {
  
  const handleExport = () => {
    if (!users || users.length === 0) {
      alert('No users to export')
      return
    }

    // 1. Define CSV Headers
    const headers = ['User ID', 'Email', 'Joined Date', 'Status', 'Trial Ends']
    
    // 2. Map Data to Rows
    const rows = users.map(u => [
      u.id,
      u.email,
      new Date(u.created_at).toLocaleDateString(),
      u.is_premium ? 'Premium' : 'Free',
      u.trial_ends_at ? new Date(u.trial_ends_at).toLocaleDateString() : 'N/A'
    ])

    // 3. Construct CSV String
    const csvContent = [
      headers.join(','), 
      ...rows.map(row => row.join(','))
    ].join('\n')

    // 4. Trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `krama_users_export_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <button 
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-bold uppercase hover:bg-gray-800 transition-all border border-black shadow-sm"
    >
      <Download size={14} /> Export CSV
    </button>
  )
}