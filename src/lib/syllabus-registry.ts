import { SyllabusNode } from '@/types/syllabus'

// 1. IMPORT DATA
// UPSC
import upscMaster from '@/data/exams/upsc' 
// JEE
import jeePhysics from '@/data/exams/jee/jee-physics.json'
import jeeChem from '@/data/exams/jee/jee-chemistry.json'
import jeeMaths from '@/data/exams/jee/jee-maths.json'
// NEET
import neetPhysics from '@/data/exams/neet/neet-physics.json'
import neetChem from '@/data/exams/neet/neet-chemistry.json'
import neetBio from '@/data/exams/neet/neet-biology.json'
// SSC
import sscData from '@/data/exams/ssc/ssc-syllabus.json'

// 2. DEFINE THE PUBLIC PATHS
export const PUBLIC_SYLLABUS_MAP: Record<string, Record<string, { title: string, data: any[] }>> = {
  'upsc': {
    'history': { title: 'UPSC History Optional', data: findUpscNode('opt_history') },
    'geography': { title: 'UPSC Geography Optional', data: findUpscNode('opt_geography') },
    'sociology': { title: 'UPSC Sociology Optional', data: findUpscNode('opt_socio') },
    'psir': { title: 'UPSC PSIR Optional', data: findUpscNode('opt_psir') },
    'public-admin': { title: 'UPSC Public Administration', data: findUpscNode('opt_pubad') },
    'gs1': { title: 'UPSC GS Paper 1', data: findUpscNode('mains_gs1') },
    'gs2': { title: 'UPSC GS Paper 2', data: findUpscNode('mains_gs2') },
    'gs3': { title: 'UPSC GS Paper 3', data: findUpscNode('mains_gs3') },
    'gs4': { title: 'UPSC GS Paper 4', data: findUpscNode('mains_gs4') },
  },
  'jee': {
    'physics': { title: 'JEE Physics', data: jeePhysics },
    'chemistry': { title: 'JEE Chemistry', data: jeeChem },
    'maths': { title: 'JEE Maths', data: jeeMaths },
  },
  'neet': {
    'physics': { title: 'NEET Physics', data: neetPhysics },
    'chemistry': { title: 'NEET Chemistry', data: neetChem },
    'biology': { title: 'NEET Biology', data: neetBio },
  },
  'ssc': {
    'cgl': { title: 'SSC CGL Complete', data: sscData },
  }
}

// 3. THE FIX: helper to extract specific branches
function findUpscNode(id: string): any[] {
  // CRITICAL FIX: We explicitly tell TS that this stack can hold 'any' object
  // (both Branches with children AND Leaves without children)
  const stack: any[] = [...upscMaster]
  
  while (stack.length > 0) {
    const node = stack.pop()
    
    // If we found the folder, return its children
    if (node?.id === id) return node.children || []
    
    // If it's a folder, add its children to the stack to keep searching
    if (node?.children) {
       stack.push(...node.children)
    }
  }
  return []
}

// 4. EXPORT HELPERS FOR NEXT.JS
export function getAllSyllabusPaths() {
  const paths: { exam: string, subject: string }[] = []
  
  Object.keys(PUBLIC_SYLLABUS_MAP).forEach(exam => {
    Object.keys(PUBLIC_SYLLABUS_MAP[exam]).forEach(subject => {
      paths.push({ exam, subject })
    })
  })
  
  return paths
}

export function getSyllabusData(exam: string, subject: string) {
  return PUBLIC_SYLLABUS_MAP[exam]?.[subject] || null
}