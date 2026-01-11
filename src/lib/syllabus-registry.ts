import { SyllabusNode } from '@/types/syllabus'

// 1. IMPORT DATA
// UPSC
import upscMaster from '@/data/exams/upsc' 
// JEE Mains
import jeePhysics from '@/data/exams/jee/jee-physics.json'
import jeeChem from '@/data/exams/jee/jee-chemistry.json'
import jeeMaths from '@/data/exams/jee/jee-maths.json'
// JEE Advanced (NEW)
import jeeAdvPhysics from '@/data/exams/jee/jee-advanced-physics.json'
import jeeAdvChem from '@/data/exams/jee/jee-advanced-chemistry.json'
import jeeAdvMaths from '@/data/exams/jee/jee-advanced-maths.json'
// NEET
import neetPhysics from '@/data/exams/neet/neet-physics.json'
import neetChem from '@/data/exams/neet/neet-chemistry.json'
import neetBio from '@/data/exams/neet/neet-biology.json'
// SSC
import sscData from '@/data/exams/ssc/ssc-syllabus.json'
// RBI (NEW)
import rbiData from '@/data/exams/rbi/rbi_phase2.json'
// Bank (NEW)
import bankData from '@/data/exams/bank/banking-exam.json'

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
    'physics': { title: 'JEE Mains Physics', data: jeePhysics },
    'chemistry': { title: 'JEE Mains Chemistry', data: jeeChem },
    'maths': { title: 'JEE Mains Maths', data: jeeMaths },
  },
  'jee-advanced': {
    'physics': { title: 'JEE Advanced Physics', data: jeeAdvPhysics },
    'chemistry': { title: 'JEE Advanced Chemistry', data: jeeAdvChem },
    'maths': { title: 'JEE Advanced Maths', data: jeeAdvMaths },
  },
  'neet': {
    'physics': { title: 'NEET Physics', data: neetPhysics },
    'chemistry': { title: 'NEET Chemistry', data: neetChem },
    'biology': { title: 'NEET Biology', data: neetBio },
  },
  'ssc': {
    'cgl': { title: 'SSC CGL', data: sscData },
  },
  'rbi': {
    'phase2': { title: 'RBI Grade B Phase 2', data: rbiData },
  },
  'bank': {
    'po': { title: 'Bank PO & Clerk', data: bankData },
  }
}

// 3. HELPER (Stack Fix Included)
function findUpscNode(id: string): any[] {
  const stack: any[] = [...upscMaster]
  
  while (stack.length > 0) {
    const node = stack.pop()
    if (node?.id === id) return node.children || []
    if (node?.children) {
       stack.push(...node.children)
    }
  }
  return []
}

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