// ============================================
// AI API INTEGRATION FOR MCQ GENERATION
// ============================================
// Supports Gemini (free) and Claude APIs
// Direct calls from browser - no proxy needed!
// ============================================

import { MCQQuestion } from './localStorage'

export type APIProvider = 'gemini' | 'claude'

export interface MCQGenerationOptions {
  text: string
  examPattern: string
  numQuestions: number
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed'
  apiProvider: APIProvider
  apiKey: string
  modelName: string
}

export interface MCQGenerationResult {
  success: boolean
  questions: MCQQuestion[]
  error?: string
  tokensUsed?: number
}

// ============================================
// EXAM-SPECIFIC PROMPT TEMPLATES
// ============================================

const EXAM_PROMPTS: Record<string, string> = {
  'SSC (Staff Selection)': `
SSC EXAM STYLE REQUIREMENTS:
- Focus on factual recall and application
- Clear, concise questions
- Avoid ambiguous options
- Time-efficient (answerable in 30-45 seconds)
- Cover: General Knowledge, Reasoning, English, Quantitative Aptitude topics
- Use standard SSC format and difficulty
- Questions should test basic concepts and facts
`,

  'UPSC (Civil Services)': `
UPSC EXAM STYLE REQUIREMENTS:
- Test conceptual understanding and analytical ability
- Questions should require deep thinking
- Often use "Consider the following statements" format
- Cover current affairs, polity, economy, geography, history
- Higher difficulty, analytical reasoning required
- Multi-layered questions with statement combinations
- Standard UPSC format with complex reasoning
`,

  'NEET (Medical)': `
NEET EXAM STYLE REQUIREMENTS:
- Focus on medical terminology and concepts
- Cover biology, chemistry, physics for medical entrance
- Questions should test conceptual clarity
- Include diagrams, processes, and mechanisms
- Application-based rather than rote learning
- Standard NEET difficulty level
- Scientific accuracy is critical
`,

  'JEE (Engineering)': `
JEE EXAM STYLE REQUIREMENTS:
- Focus on mathematics, physics, and chemistry
- Questions should test problem-solving skills
- Include numerical reasoning and calculations
- Conceptual depth with application
- Standard JEE difficulty - moderately challenging
- Multiple concepts can be combined
`,

  'Banking Exams': `
BANKING EXAM STYLE REQUIREMENTS:
- Focus on quantitative aptitude, reasoning, and current affairs
- Include questions on banking awareness
- Financial concepts and terminology
- Time-efficient questions
- Practical scenarios from banking domain
- Standard banking exam format
`,

  'Railway (RRB)': `
RAILWAY RRB EXAM STYLE REQUIREMENTS:
- Focus on general awareness, mathematics, and reasoning
- Include questions on railways and current affairs
- Technical knowledge where applicable
- Time-efficient, straightforward questions
- Standard RRB format
`,

  'State PSC': `
STATE PSC EXAM STYLE REQUIREMENTS:
- Focus on state-specific knowledge and general studies
- Include questions on local history, geography, and current affairs
- Mix of factual and analytical questions
- Cover governance, economy, and social issues
- Standard PSC format
`,

  'General/Academic': `
GENERAL ACADEMIC STYLE:
- Test understanding of core concepts
- Balanced difficulty
- Clear explanations
- Cover main topics comprehensively
- Standard academic MCQ format
`
}

// ============================================
// PROMPT GENERATION
// ============================================

function generatePrompt(options: MCQGenerationOptions): string {
  const examInstructions = EXAM_PROMPTS[options.examPattern] || EXAM_PROMPTS['General/Academic']
  
  // Truncate text if too long (keep first 15000 characters)
  const textSample = options.text.substring(0, 15000)
  
  return `You are an expert exam question creator.

${examInstructions}

Based on the following text, create ${options.numQuestions} multiple-choice questions at ${options.difficulty} difficulty level.

TEXT:
${textSample}

REQUIREMENTS:
1. Create exactly ${options.numQuestions} questions
2. Each question must have EXACTLY 4 options (A, B, C, D)
3. Only ONE option should be correct
4. Questions must match the ${options.examPattern} exam pattern specified above
5. Difficulty: ${options.difficulty}
6. Cover different topics from the text
7. Provide brief explanations for correct answers

CRITICAL: Respond ONLY with valid JSON. Do not include any markdown formatting, code blocks, or explanations.

Use this EXACT format:
{
  "questions": [
    {
      "question": "What is...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Generate the questions now:`
}

// ============================================
// GEMINI API
// ============================================

async function generateWithGemini(options: MCQGenerationOptions): Promise<MCQGenerationResult> {
  try {
    const prompt = generatePrompt(options)
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${options.modelName}:generateContent?key=${options.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || `Gemini API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API')
    }
    
    let text = data.candidates[0].content.parts[0].text
    
    // Extract JSON from response (remove markdown if present)
    text = extractJSON(text)
    
    const result = JSON.parse(text)
    
    if (!result.questions || !Array.isArray(result.questions)) {
      throw new Error('Invalid question format from API')
    }
    
    // Validate questions
    const validQuestions = validateQuestions(result.questions)
    
    return {
      success: true,
      questions: validQuestions,
      tokensUsed: data.usageMetadata?.totalTokenCount
    }
  } catch (error) {
    console.error('Gemini API error:', error)
    return {
      success: false,
      questions: [],
      error: error instanceof Error ? error.message : 'Failed to generate questions with Gemini'
    }
  }
}

// ============================================
// CLAUDE API
// ============================================

async function generateWithClaude(options: MCQGenerationOptions): Promise<MCQGenerationResult> {
  try {
    const prompt = generatePrompt(options)
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': options.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: options.modelName,
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || `Claude API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.content || !data.content[0]?.text) {
      throw new Error('Invalid response from Claude API')
    }
    
    let text = data.content[0].text
    
    // Extract JSON from response
    text = extractJSON(text)
    
    const result = JSON.parse(text)
    
    if (!result.questions || !Array.isArray(result.questions)) {
      throw new Error('Invalid question format from API')
    }
    
    // Validate questions
    const validQuestions = validateQuestions(result.questions)
    
    return {
      success: true,
      questions: validQuestions,
      tokensUsed: data.usage?.total_tokens
    }
  } catch (error) {
    console.error('Claude API error:', error)
    return {
      success: false,
      questions: [],
      error: error instanceof Error ? error.message : 'Failed to generate questions with Claude'
    }
  }
}

// ============================================
// MAIN GENERATION FUNCTION
// ============================================

export async function generateMCQs(options: MCQGenerationOptions): Promise<MCQGenerationResult> {
  // Validate inputs
  if (!options.text || options.text.trim().length < 100) {
    return {
      success: false,
      questions: [],
      error: 'Text is too short. Please provide at least 100 characters of content.'
    }
  }
  
  if (!options.apiKey || options.apiKey.trim().length < 10) {
    return {
      success: false,
      questions: [],
      error: 'Invalid API key. Please check your API key.'
    }
  }
  
  if (options.numQuestions < 1 || options.numQuestions > 100) {
    return {
      success: false,
      questions: [],
      error: 'Number of questions must be between 1 and 100'
    }
  }
  
  // Generate based on provider
  if (options.apiProvider === 'gemini') {
    return generateWithGemini(options)
  } else {
    return generateWithClaude(options)
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Extract JSON from text (handles markdown code blocks)
 */
function extractJSON(text: string): string {
  // Remove markdown code blocks if present
  let cleaned = text.trim()
  
  if (cleaned.includes('```json')) {
    cleaned = cleaned.split('```json')[1].split('```')[0]
  } else if (cleaned.includes('```')) {
    cleaned = cleaned.split('```')[1].split('```')[0]
  }
  
  return cleaned.trim()
}

/**
 * Validate and clean questions
 */
function validateQuestions(questions: any[]): MCQQuestion[] {
  return questions
    .filter(q => {
      // Must have all required fields
      return (
        q.question &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        typeof q.correctAnswer === 'number' &&
        q.correctAnswer >= 0 &&
        q.correctAnswer <= 3 &&
        q.explanation
      )
    })
    .map(q => ({
      question: String(q.question).trim(),
      options: q.options.map((opt: any) => String(opt).trim()),
      correctAnswer: Number(q.correctAnswer),
      explanation: String(q.explanation).trim()
    }))
}

// ============================================
// API KEY VALIDATION
// ============================================

/**
 * Test if API key is valid
 */
export async function testAPIKey(
  provider: APIProvider,
  apiKey: string,
  modelName: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    if (provider === 'gemini') {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: 'Say OK' }]
            }]
          })
        }
      )
      
      if (!response.ok) {
        const error = await response.json()
        return {
          valid: false,
          error: error.error?.message || 'Invalid API key or model'
        }
      }
      
      return { valid: true }
    } else {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: modelName,
          max_tokens: 50,
          messages: [{ role: 'user', content: 'Say OK' }]
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        return {
          valid: false,
          error: error.error?.message || 'Invalid API key or model'
        }
      }
      
      return { valid: true }
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Failed to validate API key'
    }
  }
}

// ============================================
// COST ESTIMATION
// ============================================

/**
 * Estimate cost for generating MCQs
 */
export function estimateCost(
  provider: APIProvider,
  numQuestions: number,
  textLength: number
): { estimatedCost: number; currency: string; note: string } {
  if (provider === 'gemini') {
    return {
      estimatedCost: 0,
      currency: 'USD',
      note: 'Gemini free tier: ~250 req/day (Flash), ~1000/day (Flash-Lite). Each generation = 1 request.'
    }
  } else {
    // Claude pricing (rough estimate)
    // Assume ~1000 tokens per 10 questions
    const estimatedTokens = (numQuestions / 10) * 1000 + (textLength / 4)
    const costPer1MTokens = 3.00 // Claude Sonnet pricing
    const estimatedCost = (estimatedTokens / 1000000) * costPer1MTokens
    
    return {
      estimatedCost: Math.max(0.01, estimatedCost),
      currency: 'USD',
      note: 'Estimated cost (may vary based on actual usage)'
    }
  }
}