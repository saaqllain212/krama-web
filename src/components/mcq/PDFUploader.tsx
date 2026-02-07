'use client'

import { useState, useCallback } from 'react'
import { Upload, File, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { 
  extractTextFromPDF, 
  validatePDFFile, 
  getTextPreview,
  estimateQuestionCount,
  type PDFExtractionResult,
  type ExtractionProgress
} from '@/lib/mcq/pdfExtractor'

interface PDFUploaderProps {
  onTextExtracted: (result: PDFExtractionResult) => void
}

export default function PDFUploader({ onTextExtracted }: PDFUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [progress, setProgress] = useState<ExtractionProgress | null>(null)
  const [result, setResult] = useState<PDFExtractionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }, [])
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])
  
  // Handle file selection
  const handleFileSelect = async (selectedFile: File) => {
    setError(null)
    setResult(null)
    
    // Validate file
    const validation = validatePDFFile(selectedFile)
    if (!validation.valid) {
      setError(validation.error!)
      return
    }
    
    setFile(selectedFile)
    
    // Auto-extract
    await extractText(selectedFile)
  }
  
  // Extract text from PDF
  const extractText = async (pdfFile: File) => {
    setExtracting(true)
    setError(null)
    setProgress(null)
    
    try {
      const extractionResult = await extractTextFromPDF(pdfFile, (prog) => {
        setProgress(prog)
      })
      
      setResult(extractionResult)
      
      if (extractionResult.success) {
        onTextExtracted(extractionResult)
      } else {
        setError(extractionResult.error || 'Failed to extract text')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraction failed')
    } finally {
      setExtracting(false)
      setProgress(null)
    }
  }
  
  // Remove file
  const handleRemove = () => {
    setFile(null)
    setResult(null)
    setError(null)
    setProgress(null)
  }
  
  return (
    <div className="space-y-4">
      {!file ? (
        // Upload Area
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-border-primary rounded-xl p-12 text-center hover:border-primary-500 hover:bg-primary-500/5 transition-all cursor-pointer"
        >
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
            id="pdf-upload"
          />
          <label htmlFor="pdf-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto mb-4 text-text-secondary" />
            <h3 className="text-lg font-semibold mb-2">Upload Your Study PDF</h3>
            <p className="text-text-secondary mb-4">
              Drag and drop or click to browse
            </p>
            <p className="text-sm text-text-tertiary">
              Supports text-based PDFs up to 50MB
            </p>
          </label>
        </div>
      ) : (
        // File Preview & Extraction
        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center">
                <File className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <h4 className="font-semibold">{file.name}</h4>
                <p className="text-sm text-text-secondary">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            
            <button
              onClick={handleRemove}
              className="p-2 hover:bg-background-tertiary rounded-lg transition-colors"
              disabled={extracting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Extraction Progress */}
          {extracting && progress && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Extracting text... Page {progress.currentPage} of {progress.totalPages}
                </span>
                <span className="text-sm text-text-secondary">
                  {progress.percentage}%
                </span>
              </div>
              <div className="w-full bg-background-tertiary rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Extraction Result */}
          {result && result.success && (
            <div className="space-y-4">
              <div className="flex items-start gap-2 p-4 bg-success-500/10 border border-success-500/20 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-success-500 mb-1">
                    Text extracted successfully!
                  </p>
                  <div className="text-sm text-text-secondary space-y-1">
                    <p>• {result.pageCount} pages processed</p>
                    <p>• {result.text.length.toLocaleString()} characters extracted</p>
                    <p>• Estimated reading time: {result.estimatedReadingTime} minutes</p>
                    <p>• Can generate ~{estimateQuestionCount(result.text)} questions</p>
                  </div>
                </div>
              </div>
              
              {/* Text Preview */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Text Preview:</h4>
                <div className="bg-background-tertiary rounded-lg p-4 max-h-48 overflow-y-auto">
                  <pre className="text-sm text-text-secondary whitespace-pre-wrap font-mono">
                    {getTextPreview(result.text, 1000)}
                  </pre>
                </div>
              </div>
            </div>
          )}
          
          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-4 bg-danger-500/10 border border-danger-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-danger-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-danger-500 mb-1">Extraction Failed</p>
                <p className="text-sm text-text-secondary">{error}</p>
                
                {error.includes('image-based') && (
                  <div className="mt-3 text-sm text-text-secondary">
                    <p className="font-medium mb-1">Possible solutions:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Try converting the PDF to text using online tools</li>
                      <li>Use a different PDF if available</li>
                      <li>Check if the PDF is password protected</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Extracting State */}
          {extracting && !progress && (
            <div className="flex items-center justify-center gap-3 py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              <p className="text-text-secondary">Initializing PDF reader...</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}