'use client'

import { HardDrive, AlertTriangle, Download, RefreshCw } from 'lucide-react'
import { type StorageStats, downloadExport } from '@/lib/mcq/localStorage'

interface StorageMonitorProps {
  stats: StorageStats
  onRefresh: () => void
}

export default function StorageMonitor({ stats, onRefresh }: StorageMonitorProps) {
  const usageColor = stats.usagePercentage >= 90 ? 'danger' :
                     stats.usagePercentage >= 70 ? 'warning' :
                     'success'
  
  return (
    <div className="flex items-center gap-3">
      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="flex items-center gap-2 text-sm">
          <HardDrive className={`w-4 h-4 text-${usageColor}-500`} />
          <span className="text-text-secondary">Storage:</span>
          <span className="font-medium">{stats.usedSets}/{stats.maxSets}</span>
        </div>
        
        {stats.isNearLimit && (
          <div className="flex items-center gap-1 text-xs text-warning-500 mt-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Near limit - export backup!</span>
          </div>
        )}
      </div>
      
      {/* Mobile View */}
      <div className="md:hidden">
        <button
          onClick={onRefresh}
          className="p-2 hover:bg-background-tertiary rounded-lg transition-colors"
          title="Refresh storage"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>
      
      {/* Warning Modal Trigger */}
      {stats.isNearLimit && (
        <button
          onClick={downloadExport}
          className="btn-sm btn-secondary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span className="hidden md:inline">Backup Now</span>
        </button>
      )}
    </div>
  )
}