import { SyllabusNode } from '@/types/syllabus'

// 1. LIGHTWEIGHT METADATA ONLY (No heavy JSON imports here!)
// This defines structure without loading the heavy data.
export const SYLLABUS_METADATA: Record<string, Record<string, { title: string }>> = {
  'upsc': {
    'history': { title: 'UPSC History Optional' },
    'geography': { title: 'UPSC Geography Optional' },
    'sociology': { title: 'UPSC Sociology Optional' },
    'psir': { title: 'UPSC PSIR Optional' },
    'public-admin': { title: 'UPSC Public Administration' },
    'gs1': { title: 'UPSC GS Paper 1' },
    'gs2': { title: 'UPSC GS Paper 2' },
    'gs3': { title: 'UPSC GS Paper 3' },
    'gs4': { title: 'UPSC GS Paper 4' },
  },
  'jee': {
    'physics': { title: 'JEE Mains Physics' },
    'chemistry': { title: 'JEE Mains Chemistry' },
    'maths': { title: 'JEE Mains Maths' },
  },
  'jee-advanced': {
    'physics': { title: 'JEE Advanced Physics' },
    'chemistry': { title: 'JEE Advanced Chemistry' },
    'maths': { title: 'JEE Advanced Maths' },
  },
  'neet': {
    'physics': { title: 'NEET Physics' },
    'chemistry': { title: 'NEET Chemistry' },
    'biology': { title: 'NEET Biology' },
  },
  'ssc': {
    'cgl': { title: 'SSC CGL' },
  },
  'rbi': {
    'phase2': { title: 'RBI Grade B Phase 2' },
  },
  'bank': {
    'po': { title: 'Bank PO & Clerk' },
  }
}

// 2. HELPER: UPSC Node Finder (Moved inside the function to avoid global execution)
function findUpscNode(nodes: any[], id: string): any[] {
  const stack: any[] = [...nodes]
  while (stack.length > 0) {
    const node = stack.pop()
    if (node?.id === id) return node.children || []
    if (node?.children) stack.push(...node.children)
  }
  return []
}

// 3. DYNAMIC DATA LOADER (The Magic Fix)
// This function only imports the specific file requested.
export async function getSyllabusData(exam: string, subject: string): Promise<any[]> {
  try {
    // A. UPSC Special Handling (One big file split into parts)
    if (exam === 'upsc') {
      // Dynamic Import
      const fullModule = await import('@/data/exams/upsc') 
      const fullData = fullModule.default as SyllabusNode[]
      
      // Map subject slugs to internal IDs
      const map: Record<string, string> = {
        'history': 'opt_history',
        'geography': 'opt_geography',
        'sociology': 'opt_socio',
        'psir': 'opt_psir',
        'public-admin': 'opt_pubad',
        'gs1': 'mains_gs1',
        'gs2': 'mains_gs2',
        'gs3': 'mains_gs3',
        'gs4': 'mains_gs4'
      }
      
      const internalId = map[subject]
      if (!internalId) return []
      return findUpscNode(fullData, internalId)
    }

    // B. Simple File Mapping for everything else
    // Note: We use specific strings so Webpack can statically analyze split points
    if (exam === 'jee') {
       if (subject === 'physics') return (await import('@/data/exams/jee/jee-physics.json')).default
       if (subject === 'chemistry') return (await import('@/data/exams/jee/jee-chemistry.json')).default
       if (subject === 'maths') return (await import('@/data/exams/jee/jee-maths.json')).default
    }

    if (exam === 'jee-advanced') {
       if (subject === 'physics') return (await import('@/data/exams/jee/jee-advanced-physics.json')).default
       if (subject === 'chemistry') return (await import('@/data/exams/jee/jee-advanced-chemistry.json')).default
       if (subject === 'maths') return (await import('@/data/exams/jee/jee-advanced-maths.json')).default
    }

    if (exam === 'neet') {
       if (subject === 'physics') return (await import('@/data/exams/neet/neet-physics.json')).default
       if (subject === 'chemistry') return (await import('@/data/exams/neet/neet-chemistry.json')).default
       if (subject === 'biology') return (await import('@/data/exams/neet/neet-biology.json')).default
    }

    if (exam === 'ssc' && subject === 'cgl') {
       return (await import('@/data/exams/ssc/ssc-syllabus.json')).default
    }

    if (exam === 'rbi' && subject === 'phase2') {
       return (await import('@/data/exams/rbi/rbi_phase2.json')).default
    }

    if (exam === 'bank' && subject === 'po') {
       return (await import('@/data/exams/bank/banking-exam.json')).default
    }

    return []
  } catch (error) {
    console.error(`Error loading syllabus for ${exam}/${subject}:`, error)
    return []
  }
}

// 4. Helper for generating static paths (lightweight)
export function getAllSyllabusPaths() {
  const paths: { exam: string, subject: string }[] = []
  
  Object.keys(SYLLABUS_METADATA).forEach(exam => {
    Object.keys(SYLLABUS_METADATA[exam]).forEach(subject => {
      paths.push({ exam, subject })
    })
  })
  
  return paths
}