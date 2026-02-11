'use client'

import { useState, useEffect } from 'react'
import { Key, Eye, EyeOff, CheckCircle2, AlertCircle, ExternalLink, Loader2, Info } from 'lucide-react'
import { testAPIKey, type APIProvider } from '@/lib/mcq/apiClient'

const API_KEY_STORAGE = 'krama_mcq_api_config'

// Current Gemini models (as of Feb 2026)
const GEMINI_MODELS = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Recommended)', desc: 'Fast, free tier: ~250 req/day' },
  { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite', desc: 'Fastest, free tier: ~1000 req/day' },
  { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash (Preview)', desc: 'Latest, best quality' },
  { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro (Preview)', desc: 'Most powerful, ~100 req/day free' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', desc: 'Advanced reasoning, limited free' },
]

const CLAUDE_MODELS = [
  { value: 'claude-sonnet-4-5-20250929', label: 'Claude Sonnet 4.5', desc: 'Best value' },
  { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5', desc: 'Fastest, cheapest' },
  { value: 'claude-opus-4-6', label: 'Claude Opus 4.6', desc: 'Most powerful' },
]

// Valid model name patterns — blocks emails, URLs, random junk from autofill
const VALID_MODEL_PATTERNS: Record<APIProvider, RegExp> = {
  gemini: /^gemini-[\w.-]+$/,
  claude: /^claude-[\w.-]+$/,
}

interface APIConfig {
  provider: APIProvider
  apiKey: string
  modelName: string
}

export default function APIKeyManager() {
  const [provider, setProvider] = useState<APIProvider>('gemini')
  const [apiKey, setApiKey] = useState('')
  const [modelName, setModelName] = useState('gemini-2.5-flash')
  const [customModel, setCustomModel] = useState('')
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
        
        // Migrate old model names AND sanitize corrupted ones (autofill junk)
        let model = config.modelName || ''
        if (model.includes('gemini-1.5')) {
          model = 'gemini-2.5-flash'
        }
        // FIX: If the saved model looks invalid (e.g. an email from autofill), reset it
        if (model && !VALID_MODEL_PATTERNS[config.provider]?.test(model)) {
          console.warn('Invalid model name detected (likely autofill), resetting:', model)
          model = config.provider === 'gemini' ? 'gemini-2.5-flash' : 'claude-sonnet-4-5-20250929'
          // Also fix the saved config immediately
          const fixedConfig = { ...config, modelName: model }
          localStorage.setItem(API_KEY_STORAGE, JSON.stringify(fixedConfig))
        }
        setModelName(model || (config.provider === 'gemini' ? 'gemini-2.5-flash' : 'claude-sonnet-4-5-20250929'))
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
    setCustomModel('')
    
    // Set default model
    if (newProvider === 'gemini') {
      setModelName('gemini-2.5-flash')
    } else {
      setModelName('claude-sonnet-4-5-20250929')
    }
  }

  // FIX: Get effective model name with validation
  const getEffectiveModel = (): string => {
    const custom = customModel.trim()
    if (custom) {
      // Validate custom model — reject if it looks like an email or random junk
      if (custom.includes('@') || custom.includes(' ') || custom.length > 60) {
        return modelName // Fall back to dropdown selection
      }
      if (VALID_MODEL_PATTERNS[provider]?.test(custom)) {
        return custom
      }
      // If it doesn't match pattern but could be a valid model name (no @, reasonable length)
      // Let it through but warn
      if (/^[a-z0-9][\w.-]*$/i.test(custom)) {
        return custom
      }
      return modelName // Fallback
    }
    return modelName
  }

  const effectiveModel = getEffectiveModel()
  
  // Test API key
  const handleTest = async () => {
    if (!apiKey.trim()) {
      setTestResult({ valid: false, error: 'Please enter an API key' })
      return
    }
    
    setTesting(true)
    setTestResult(null)
    
    const result = await testAPIKey(provider, apiKey.trim(), effectiveModel)
    setTestResult(result)
    setTesting(false)
  }
  
  // Save configuration
  const handleSave = () => {
    const config: APIConfig = {
      provider,
      apiKey: apiKey.trim(),
      modelName: effectiveModel
    }
    
    localStorage.setItem(API_KEY_STORAGE, JSON.stringify(config))
    setIsSaved(true)
    
    // Trigger event for other components
    window.dispatchEvent(new CustomEvent('mcq-api-config-updated', { detail: config }))
  }

  const models = provider === 'gemini' ? GEMINI_MODELS : CLAUDE_MODELS
  
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
              Free tier available • Recommended
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
              Best quality • Paid only
            </div>
          </button>
        </div>
      </div>
      
      {/* API Key Input — MOVED ABOVE model selection to prevent autofill conflicts */}
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
            autoComplete="off"
            data-1p-ignore="true"
            data-lpignore="true"
            data-form-type="other"
            name="api-key-input"
            id="mcq-api-key"
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
            ? 'No credit card required • Free tier: ~250 requests/day (Flash), ~1000/day (Flash-Lite)' 
            : 'Free trial available • Pay as you go'}
        </p>
      </div>

      {/* Model Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Model:</label>
        <select
          value={modelName}
          onChange={(e) => {
            setModelName(e.target.value)
            setCustomModel('')
            setTestResult(null)
            setIsSaved(false)
          }}
          className="input w-full mb-2"
        >
          {models.map(m => (
            <option key={m.value} value={m.value}>
              {m.label} — {m.desc}
            </option>
          ))}
        </select>

        {/* Custom model override */}
        <details className="text-sm">
          <summary className="text-text-tertiary cursor-pointer hover:text-text-secondary">
            Use a different model name...
          </summary>
          <input
            type="text"
            value={customModel}
            onChange={(e) => {
              setCustomModel(e.target.value)
              setTestResult(null)
              setIsSaved(false)
            }}
            className="input w-full mt-2 font-mono text-sm"
            placeholder={provider === 'gemini' ? 'e.g. gemini-3-pro-preview' : 'e.g. claude-opus-4-6'}
            autoComplete="off"
            data-1p-ignore="true"
            data-lpignore="true"
            data-form-type="other"
            name="custom-model-name"
            id="mcq-custom-model"
          />
          <p className="text-xs text-text-tertiary mt-1">
            Enter exact model name if you want to use a model not listed above. Models change frequently — check{' '}
            <a href="https://ai.google.dev/gemini-api/docs/models" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">
              Google's model list
            </a>{' '}for the latest.
          </p>
        </details>
      </div>

      {/* Free tier info */}
      {provider === 'gemini' && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700">
              <p className="font-medium mb-1">Gemini Free Tier (Feb 2026):</p>
              <p>Flash-Lite: ~1,000 req/day • Flash: ~250 req/day • Pro: ~100 req/day</p>
              <p className="mt-1">Each MCQ generation = 1 request. With Flash, you can generate ~250 question sets per day for free.</p>
              <p className="mt-1 text-blue-600 font-medium">Note: Google may change free limits without warning. If you hit errors, try Flash-Lite or wait 24h.</p>
            </div>
          </div>
        </div>
      )}
      
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
                  Ready to generate MCQs with {effectiveModel}
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-danger-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-danger-500">Invalid API Key or Model</p>
                <p className="text-sm text-text-secondary">{testResult.error}</p>
                {testResult.error?.includes('404') && (
                  <p className="text-xs text-danger-400 mt-1">
                    This model may have been retired. Try selecting a different model from the dropdown.
                  </p>
                )}
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
      const config = JSON.parse(saved)
      // Auto-migrate retired model names
      if (config.modelName?.includes('gemini-1.5')) {
        config.modelName = 'gemini-2.5-flash'
      }
      // FIX: Sanitize corrupted model names (from browser autofill)
      if (config.modelName && config.modelName.includes('@')) {
        console.warn('Corrupted model name detected, resetting:', config.modelName)
        config.modelName = config.provider === 'gemini' ? 'gemini-2.5-flash' : 'claude-sonnet-4-5-20250929'
        // Fix it in storage too
        localStorage.setItem(API_KEY_STORAGE, JSON.stringify(config))
      }
      return config
    }
  } catch (e) {
    console.error('Failed to load API config:', e)
  }
  return null
}