'use client'

import { useState, useEffect } from 'react'
import { Key, Eye, EyeOff, CheckCircle2, AlertCircle, ExternalLink, Loader2 } from 'lucide-react'
import { testAPIKey, type APIProvider } from '@/lib/mcq/apiClient'

const API_KEY_STORAGE = 'krama_mcq_api_config'

interface APIConfig {
  provider: APIProvider
  apiKey: string
  modelName: string
}

export default function APIKeyManager() {
  const [provider, setProvider] = useState<APIProvider>('gemini')
  const [apiKey, setApiKey] = useState('')
  const [modelName, setModelName] = useState('gemini-1.5-flash-latest')
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ valid: boolean; error?: string } | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  
  // Load saved config
  useEffect(() => {
    const saved = localStorage.getItem(API_KEY_STORAGE)
    if (saved) {
      try {
        const config: APIConfig = JSON.parse(saved)
        setProvider(config.provider)
        setApiKey(config.apiKey || '')
        setModelName(config.modelName || (config.provider === 'gemini' ? 'gemini-1.5-flash-latest' : 'claude-sonnet-4-20250514'))
        setIsSaved(true)
      } catch (e) {
        console.error('Failed to load API config:', e)
      }
    }
  }, [])
  
  // Handle provider change
  const handleProviderChange = (newProvider: APIProvider) => {
    setProvider(newProvider)
    setTestResult(null)
    setIsSaved(false)
    
    // Set default model
    if (newProvider === 'gemini') {
      setModelName('gemini-1.5-flash-latest')
    } else {
      setModelName('claude-sonnet-4-20250514')
    }
  }
  
  // Test API key
  const handleTest = async () => {
    if (!apiKey.trim()) {
      setTestResult({ valid: false, error: 'Please enter an API key' })
      return
    }
    
    setTesting(true)
    setTestResult(null)
    
    const result = await testAPIKey(provider, apiKey.trim(), modelName)
    setTestResult(result)
    setTesting(false)
  }
  
  // Save configuration
  const handleSave = () => {
    const config: APIConfig = {
      provider,
      apiKey: apiKey.trim(),
      modelName
    }
    
    localStorage.setItem(API_KEY_STORAGE, JSON.stringify(config))
    setIsSaved(true)
    
    // Trigger event for other components
    window.dispatchEvent(new CustomEvent('mcq-api-config-updated', { detail: config }))
  }
  
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center">
          <Key className="w-5 h-5 text-primary-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">API Configuration</h3>
          <p className="text-sm text-text-secondary">
            Configure your AI API to generate questions
          </p>
        </div>
      </div>
      
      {/* Provider Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3">Select AI Provider:</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleProviderChange('gemini')}
            className={`p-4 rounded-lg border-2 transition-all ${
              provider === 'gemini'
                ? 'border-primary-500 bg-primary-500/5'
                : 'border-border-primary hover:border-border-secondary'
            }`}
          >
            <div className="font-semibold mb-1">Google Gemini</div>
            <div className="text-sm text-text-secondary">
              Free (1,500/day) • Recommended
            </div>
          </button>
          
          <button
            onClick={() => handleProviderChange('claude')}
            className={`p-4 rounded-lg border-2 transition-all ${
              provider === 'claude'
                ? 'border-primary-500 bg-primary-500/5'
                : 'border-border-primary hover:border-border-secondary'
            }`}
          >
            <div className="font-semibold mb-1">Anthropic Claude</div>
            <div className="text-sm text-text-secondary">
              Best quality • Paid
            </div>
          </button>
        </div>
      </div>
      
      {/* Model Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Model Name:</label>
        <input
          type="text"
          value={modelName}
          onChange={(e) => {
            setModelName(e.target.value)
            setTestResult(null)
            setIsSaved(false)
          }}
          className="input w-full font-mono text-sm"
          placeholder={provider === 'gemini' ? 'gemini-1.5-flash-latest' : 'claude-sonnet-4-20250514'}
        />
        <p className="text-xs text-text-tertiary mt-1">
          {provider === 'gemini' 
            ? 'Examples: gemini-1.5-flash-latest, gemini-1.5-pro' 
            : 'Examples: claude-sonnet-4-20250514, claude-opus-4-20250514'}
        </p>
      </div>
      
      {/* API Key Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">API Key:</label>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value)
              setTestResult(null)
              setIsSaved(false)
            }}
            className="input w-full pr-10 font-mono text-sm"
            placeholder={provider === 'gemini' ? 'AIza...' : 'sk-ant-...'}
          />
          <button
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-background-tertiary rounded transition-colors"
          >
            {showKey ? (
              <EyeOff className="w-4 h-4 text-text-secondary" />
            ) : (
              <Eye className="w-4 h-4 text-text-secondary" />
            )}
          </button>
        </div>
      </div>
      
      {/* Get API Key Links */}
      <div className="mb-6 p-4 bg-background-secondary rounded-lg">
        <p className="text-sm font-medium mb-2">Don't have an API key?</p>
        <a
          href={provider === 'gemini' 
            ? 'https://aistudio.google.com/app/apikey'
            : 'https://console.anthropic.com/'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
        >
          Get {provider === 'gemini' ? 'Gemini' : 'Claude'} API Key
          <ExternalLink className="w-3 h-3" />
        </a>
        <p className="text-xs text-text-tertiary mt-2">
          {provider === 'gemini' 
            ? 'No credit card required • 1,500 free requests per day' 
            : 'Free trial available • Pay as you go'}
        </p>
      </div>
      
      {/* Test Result */}
      {testResult && (
        <div className={`mb-4 p-3 rounded-lg flex items-start gap-2 ${
          testResult.valid
            ? 'bg-success-500/10 border border-success-500/20'
            : 'bg-danger-500/10 border border-danger-500/20'
        }`}>
          {testResult.valid ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-success-500">API Key Valid!</p>
                <p className="text-sm text-text-secondary">
                  Ready to generate MCQs with {provider === 'gemini' ? 'Gemini' : 'Claude'}
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-danger-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-danger-500">Invalid API Key</p>
                <p className="text-sm text-text-secondary">{testResult.error}</p>
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Saved Indicator */}
      {isSaved && !testResult && (
        <div className="mb-4 p-3 rounded-lg flex items-center gap-2 bg-primary-500/10 border border-primary-500/20">
          <CheckCircle2 className="w-5 h-5 text-primary-500" />
          <p className="text-sm font-medium text-primary-500">Configuration saved</p>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleTest}
          disabled={testing || !apiKey.trim()}
          className="btn-secondary flex-1 flex items-center justify-center gap-2"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Testing...
            </>
          ) : (
            'Test API Key'
          )}
        </button>
        
        <button
          onClick={handleSave}
          disabled={!apiKey.trim() || isSaved}
          className="btn-primary flex-1"
        >
          {isSaved ? 'Saved' : 'Save Configuration'}
        </button>
      </div>
      
      {/* Warning */}
      <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <p className="text-xs text-amber-600 dark:text-amber-400">
          <strong>Privacy Note:</strong> Your API key is stored locally in your browser and never sent to our servers. 
          It's only used to make direct API calls to {provider === 'gemini' ? 'Google' : 'Anthropic'} from your browser.
        </p>
      </div>
    </div>
  )
}

// Export helper to get current config
export function getCurrentAPIConfig(): APIConfig | null {
  try {
    const saved = localStorage.getItem(API_KEY_STORAGE)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to load API config:', e)
  }
  return null
}