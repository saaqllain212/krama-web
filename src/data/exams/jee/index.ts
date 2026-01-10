// 1. IMPORT MAINS
import mainsPhysics from './jee-physics.json'
import mainsChemistry from './jee-chemistry.json'
import mainsMaths from './jee-maths.json'

// 2. IMPORT ADVANCED
import advPhysics from './jee-advanced-physics.json'
import advChemistry from './jee-advanced-chemistry.json' // Ensure you renamed the file!
import advMaths from './jee-advanced-maths.json'

// 3. BUILD THE MASTER TREE
const jeeMaster = [
  {
    id: "root_jee",
    title: "Joint Entrance Examination (JEE)",
    type: "branch",
    children: [
      // === BRANCH 1: MAINS ===
      {
        id: "jee_mains_folder",
        title: "JEE Mains",
        type: "branch",
        children: [
            // We spread the arrays because your JSON files are wrapped in [ ... ]
            ...mainsPhysics,
            ...mainsChemistry,
            ...mainsMaths
        ]
      },

      // === BRANCH 2: ADVANCED ===
      {
        id: "jee_advanced_folder",
        title: "JEE Advanced",
        type: "branch",
        children: [
            ...advPhysics,
            ...advChemistry,
            ...advMaths
        ]
      }
    ]
  }
]

export default jeeMaster