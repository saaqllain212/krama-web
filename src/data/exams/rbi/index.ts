// 1. IMPORT PHASES
import phase2 from './rbi_phase2.json'

// 2. BUILD THE MASTER TREE
const rbiMaster = [
  {
    id: "root_rbi",
    title: "RBI Grade B Officer",
    type: "branch",
    children: [
        // Currently just Phase 2, but ready for Phase 1 later
        ...phase2
    ]
  }
]

export default rbiMaster