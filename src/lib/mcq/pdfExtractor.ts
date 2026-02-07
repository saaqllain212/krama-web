// ============================================
// PDF TEXT EXTRACTION
// ============================================
// Uses pdf.js to extract text from PDFs in browser
// Works with text-based PDFs (90% of student PDFs)
// No backend needed! ✅
// ============================================

import * as pdfjsLib from 'pdfjs-dist'

// Set worker path
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
}

export interface PDFExtractionResult {
  success: boolean
  text: string
  pageCount: number
  fileName: string
  estimatedReadingTime: number // in minutes
  error?: string
}

export interface ExtractionProgress {
  currentPage: number
  totalPages: number
  percentage: number
}

/**
 * Extract text from PDF file
 */
export async function extractTextFromPDF(
  file: File,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<PDFExtractionResult> {
  try {
    // Validate file
    if (!file.type.includes('pdf')) {
      return {
        success: false,
        text: '',
        pageCount: 0,
        fileName: file.name,
        estimatedReadingTime: 0,
        error: 'File is not a PDF'
      }
    }

    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer()
    
    // Load PDF
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const pageCount = pdf.numPages
    
    let fullText = ''
    
    // Extract text from each page
    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      
      // Combine text items
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
      
      fullText += pageText + '\n\n'
      
      // Report progress
      if (onProgress) {
        onProgress({
          currentPage: i,
          totalPages: pageCount,
          percentage: Math.round((i / pageCount) * 100)
        })
      }
    }
    
    // Clean up text
    fullText = cleanExtractedText(fullText)
    
    // Check if extraction was successful
    if (fullText.trim().length < 100) {
      return {
        success: false,
        text: fullText,
        pageCount,
        fileName: file.name,
        estimatedReadingTime: 0,
        error: 'Very little text extracted. This PDF might be image-based (scanned). Please try a text-based PDF.'
      }
    }
    
    // Calculate reading time (assuming 200 words per minute)
    const wordCount = fullText.split(/\s+/).length
    const estimatedReadingTime = Math.ceil(wordCount / 200)
    
    return {
      success: true,
      text: fullText,
      pageCount,
      fileName: file.name,
      estimatedReadingTime
    }
  } catch (error) {
    console.error('PDF extraction error:', error)
    return {
      success: false,
      text: '',
      pageCount: 0,
      fileName: file.name,
      estimatedReadingTime: 0,
      error: error instanceof Error ? error.message : 'Failed to extract text from PDF'
    }
  }
}

/**
 * Clean extracted text
 * Removes excessive whitespace, fixes formatting issues
 */
function cleanExtractedText(text: string): string {
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove excessive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Trim each line
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .trim()
}

/**
 * Get preview of extracted text (first 500 characters)
 */
export function getTextPreview(text: string, maxLength: number = 500): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Estimate number of questions that can be generated from text
 */
export function estimateQuestionCount(text: string): number {
  const wordCount = text.split(/\s+/).length
  
  // Rough estimate: 1 question per 100-150 words
  const minQuestions = Math.floor(wordCount / 150)
  const maxQuestions = Math.floor(wordCount / 100)
  
  return Math.floor((minQuestions + maxQuestions) / 2)
}

/**
 * Check if PDF is likely text-based or image-based
 */
export async function isPDFTextBased(file: File): Promise<boolean> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    
    // Check first page
    const page = await pdf.getPage(1)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ')
    
    // If first page has more than 50 characters, likely text-based
    return pageText.trim().length > 50
  } catch (error) {
    console.error('Error checking PDF type:', error)
    return false
  }
}

/**
 * Validate PDF file
 */
export function validatePDFFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
    return {
      valid: false,
      error: 'Please upload a PDF file'
    }
  }
  
  // Check file size (max 50MB)
  const maxSize = 50 * 1024 * 1024 // 50MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'PDF file is too large. Maximum size is 50MB'
    }
  }
  
  // Check file size (min 1KB)
  if (file.size < 1024) {
    return {
      valid: false,
      error: 'PDF file is too small. It might be corrupted'
    }
  }
  
  return { valid: true }
}